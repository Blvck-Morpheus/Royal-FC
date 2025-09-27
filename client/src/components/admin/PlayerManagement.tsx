import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Player, InsertPlayer } from "@shared/schema";
import { Plus, Edit, Trash2, Trophy, Target, Shield, Users } from "lucide-react";

const playerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  position: z.enum(["Goalkeeper", "Defender", "Midfielder", "Forward"]),
  jerseyNumber: z.number().min(1).max(99),
  photoUrl: z.string().url().optional().or(z.literal("")),
  stats: z.object({
    goals: z.number().min(0).default(0),
    assists: z.number().min(0).default(0),
    cleanSheets: z.number().min(0).default(0),
    tackles: z.number().min(0).default(0),
    saves: z.number().min(0).default(0),
    gamesPlayed: z.number().min(0).default(0),
    skillRating: z.number().min(1).max(5).default(3),
  }).default({}),
});

type PlayerFormData = z.infer<typeof playerSchema>;

const PlayerManagement = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch players
  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  // Form setup
  const form = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: "",
      position: "Midfielder",
      jerseyNumber: 1,
      photoUrl: "",
      stats: {
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        tackles: 0,
        saves: 0,
        gamesPlayed: 0,
        skillRating: 3,
      },
    },
  });

  // Create player mutation
  const createPlayer = useMutation({
    mutationFn: async (data: InsertPlayer) => {
      const { data: result } = await apiRequest("POST", "/api/players", data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({ title: "Success", description: "Player created successfully" });
      form.reset();
      setIsCreating(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create player",
        variant: "destructive",
      });
    },
  });

  // Update player mutation
  const updatePlayer = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Player> }) => {
      const { data: result } = await apiRequest("PUT", `/api/players/${id}`, data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({ title: "Success", description: "Player updated successfully" });
      setEditingPlayer(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update player",
        variant: "destructive",
      });
    },
  });

  // Delete player mutation
  const deletePlayer = useMutation({
    mutationFn: async (id: number) => {
      const { data: result } = await apiRequest("DELETE", `/api/players/${id}`);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({ title: "Success", description: "Player deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete player",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PlayerFormData) => {
    if (editingPlayer) {
      updatePlayer.mutate({ id: editingPlayer.id, data });
    } else {
      createPlayer.mutate(data);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    form.reset({
      name: player.name,
      position: player.position as any,
      jerseyNumber: player.jerseyNumber,
      photoUrl: player.photoUrl || "",
      stats: player.stats,
    });
    setIsCreating(true);
  };

  const handleCancelEdit = () => {
    setEditingPlayer(null);
    setIsCreating(false);
    form.reset();
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case "Goalkeeper": return <Shield className="w-4 h-4" />;
      case "Defender": return <Shield className="w-4 h-4" />;
      case "Midfielder": return <Users className="w-4 h-4" />;
      case "Forward": return <Target className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading players...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Player Management</h2>
          <p className="text-gray-600">Manage your club's player roster</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          Add Player
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingPlayer ? "Edit Player" : "Create New Player"}</CardTitle>
            <CardDescription>
              {editingPlayer ? "Update player information" : "Add a new player to your roster"}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                          <Input placeholder="Enter player name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                    name="jerseyNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jersey Number</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            max={99} 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stats.skillRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skill Rating (1-5)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            max={5} 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createPlayer.isPending || updatePlayer.isPending}>
                    {editingPlayer ? "Update Player" : "Create Player"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Players List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => (
          <Card key={player.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{player.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {getPositionIcon(player.position)}
                    <span className="text-sm text-gray-600">{player.position}</span>
                    <Badge variant="outline">#{player.jerseyNumber}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(player)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => deletePlayer.mutate(player.id)}
                    disabled={deletePlayer.isPending}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Goals: {player.stats.goals}</div>
                <div>Assists: {player.stats.assists}</div>
                <div>Games: {player.stats.gamesPlayed}</div>
                <div>Rating: {player.stats.skillRating}/5</div>
              </div>
              {player.badges.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {player.badges.map((badge, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Trophy className="w-3 h-3 mr-1" />
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {players.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No players yet</h3>
            <p className="text-gray-600 mb-4">Start building your roster by adding your first player</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Player
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlayerManagement;
