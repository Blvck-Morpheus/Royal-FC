import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Player, InsertPlayer } from "@shared/schema";
import PlayerCard from "@/components/PlayerCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const playerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  position: z.string().min(1, "Position is required"),
  jerseyNumber: z.number().min(1, "Jersey number must be positive"),
  photoUrl: z.string().optional(),
  stats: z.object({
    goals: z.number().default(0),
    assists: z.number().default(0),
    cleanSheets: z.number().default(0),
    tackles: z.number().default(0),
    saves: z.number().default(0),
    gamesPlayed: z.number().default(0),
    skillRating: z.number().min(1).max(5).default(3)
  }).default({})
});

type PlayerFormValues = z.infer<typeof playerFormSchema>;

const PlayersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Check if user is logged in as admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/check-auth");
        if (response.ok) {
          const userData = await response.json();
          if (userData.role === "admin") {
            setIsAdminMode(true);
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    checkAuth();
  }, []);
  
  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: {
      name: "",
      position: "Forward",
      jerseyNumber: 1,
      photoUrl: "",
      stats: {
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        tackles: 0,
        saves: 0,
        gamesPlayed: 0,
        skillRating: 3
      }
    }
  });
  
  const { data: players, isLoading, error } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });

  // Create new player mutation
  const createPlayerMutation = useMutation({
    mutationFn: async (data: PlayerFormValues) => {
      const res = await apiRequest("POST", "/api/players", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      setIsAddPlayerOpen(false);
      form.reset();
      toast({
        title: "Player added successfully",
        description: "The new player has been added to the team roster."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add player",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Update player mutation
  const updatePlayerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: PlayerFormValues }) => {
      const res = await apiRequest("PATCH", `/api/players/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      setPlayerToEdit(null);
      setIsEditing(false);
      form.reset();
      toast({
        title: "Player updated successfully",
        description: "The player information has been updated."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update player",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Delete player mutation
  const deletePlayerMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/players/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      setPlayerToDelete(null);
      toast({
        title: "Player deleted",
        description: "The player has been removed from the team roster."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete player",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: PlayerFormValues) => {
    if (isEditing && playerToEdit) {
      updatePlayerMutation.mutate({ id: playerToEdit.id, data });
    } else {
      createPlayerMutation.mutate(data);
    }
  };
  
  const handleEditPlayer = (player: Player) => {
    setPlayerToEdit(player);
    setIsEditing(true);
    
    // Set form values
    form.reset({
      name: player.name,
      position: player.position,
      jerseyNumber: player.jerseyNumber,
      photoUrl: player.photoUrl || "",
      stats: {
        goals: player.stats.goals || 0,
        assists: player.stats.assists || 0,
        cleanSheets: player.stats.cleanSheets || 0,
        tackles: player.stats.tackles || 0,
        saves: player.stats.saves || 0,
        gamesPlayed: player.stats.gamesPlayed || 0,
        skillRating: (player.stats as any)?.skillRating || 3
      }
    });
    
    setIsAddPlayerOpen(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setPlayerToEdit(null);
    form.reset();
    setIsAddPlayerOpen(false);
  };

  const filteredPlayers = players?.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === "all" || player.position.toLowerCase() === positionFilter.toLowerCase();
    return matchesSearch && matchesPosition;
  });

  return (
    <>
      <Helmet>
        <title>Players | Asaba All-stars Club</title>
        <meta name="description" content="Meet the talented players who make up Asaba All-stars Club, with detailed player profiles and statistics." />
      </Helmet>
      
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h1 className="font-montserrat font-bold text-3xl text-royal-blue">Our Players</h1>
            <p className="text-gray-600 mt-2">Meet the talent that makes Asaba All-stars Club special</p>
          </div>
          
          {/* Admin Controls */}
          {isAdminMode && (
            <div className="mb-6 max-w-3xl mx-auto">
              <div className="bg-royal-blue/10 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center">
                <div className="mb-3 sm:mb-0">
                  <h3 className="text-royal-blue font-semibold">
                    <i className="ri-admin-line mr-1"></i> Admin Mode
                  </h3>
                  <p className="text-sm text-gray-600">You can edit and manage players</p>
                </div>
                
                <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-royal-blue">
                      <i className="ri-user-add-line mr-1"></i> Add New Player
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{isEditing ? "Edit Player" : "Add New Player"}</DialogTitle>
                      <DialogDescription>
                        {isEditing ? "Update player information in the team roster." : "Add a new player to the team roster."}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Player Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="jerseyNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jersey Number</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="10" 
                                    {...field} 
                                    value={field.value.toString()}
                                    onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Position</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select position" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                                    <SelectItem value="Defender">Defender</SelectItem>
                                    <SelectItem value="Midfielder">Midfielder</SelectItem>
                                    <SelectItem value="Forward">Forward</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="photoUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Photo URL (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com/photo.jpg" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="stats.skillRating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Skill Rating (1-5)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1"
                                    max="5"
                                    placeholder="3" 
                                    {...field} 
                                    value={field.value.toString()}
                                    onChange={e => field.onChange(parseInt(e.target.value) || 3)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="stats.goals"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Goals</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    {...field} 
                                    value={field.value.toString()}
                                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="stats.assists"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Assists</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    {...field} 
                                    value={field.value.toString()}
                                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="stats.gamesPlayed"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Games Played</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    {...field} 
                                    value={field.value.toString()}
                                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={form.getValues("position") === "Goalkeeper" ? "stats.cleanSheets" : "stats.tackles"}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{form.getValues("position") === "Goalkeeper" ? "Clean Sheets" : "Tackles"}</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    {...field} 
                                    value={field.value.toString()}
                                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {form.getValues("position") === "Goalkeeper" && (
                            <FormField
                              control={form.control}
                              name="stats.saves"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Saves</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="0" 
                                      {...field} 
                                      value={field.value.toString()}
                                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                        
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-royal-blue">
                            {isEditing ? "Update Player" : "Add Player"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
          
          {/* Player Search and Filter */}
          <div className="mb-8 max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search players..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2"
                    />
                    <i className="ri-search-line absolute left-3 top-3 text-gray-400"></i>
                  </div>
                </div>
                
                <div className="md:w-1/3">
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Positions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                      <SelectItem value="defender">Defender</SelectItem>
                      <SelectItem value="midfielder">Midfielder</SelectItem>
                      <SelectItem value="forward">Forward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Players Grid */}
          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-600">Loading players...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              <p>Error loading players: {(error as Error).message}</p>
            </div>
          ) : filteredPlayers && filteredPlayers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPlayers.map(player => (
                  <div key={player.id} className="relative">
                    {isAdminMode && (
                      <div className="absolute top-2 right-2 z-10 flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 rounded-full bg-white shadow-md"
                          onClick={() => handleEditPlayer(player)}
                        >
                          <i className="ri-pencil-line text-royal-blue"></i>
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 rounded-full bg-white shadow-md"
                              onClick={() => setPlayerToDelete(player)}
                            >
                              <i className="ri-delete-bin-line text-red-500"></i>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete {player.name} from the team roster.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => deletePlayerMutation.mutate(player.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                    <PlayerCard player={player} />
                  </div>
                ))}
              </div>
              
              {filteredPlayers.length < (players?.length || 0) && (
                <div className="text-center mt-6">
                  <p className="text-gray-600">
                    Showing {filteredPlayers.length} of {players?.length} players
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600">No players found matching your filters.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default PlayersPage;
