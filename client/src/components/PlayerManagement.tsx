import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Player } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const playerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  position: z.enum(["Goalkeeper", "Defender", "Midfielder", "Forward"]),
  jerseyNumber: z.coerce.number().min(1, "Jersey number must be at least 1"),
  photoUrl: z.string().optional(),
});

type PlayerFormValues = z.infer<typeof playerFormSchema>;

const PlayerManagement = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: players, isLoading } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: {
      name: "",
      position: "Forward",
      jerseyNumber: 1,
      photoUrl: "",
    },
  });

  const onSubmit = async (data: PlayerFormValues) => {
    try {
      setIsSubmitting(true);
      
      const response = await apiRequest("POST", "/api/players", {
        ...data,
        stats: {
          goals: 0,
          assists: 0,
          cleanSheets: 0,
          tackles: 0,
          saves: 0,
          gamesPlayed: 0,
          skillRating: 3
        }
      });
      
      if (response.ok) {
        toast({
          title: "Player added",
          description: "The player has been added to the roster successfully",
        });
        
        // Reset form
        form.reset();
        
        // Refresh players list
        queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      }
    } catch (error) {
      toast({
        title: "Error adding player",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRoster = async () => {
    try {
      const response = await apiRequest("POST", "/api/players/save-roster", {
        players: players || []
      });
      
      if (response.ok) {
        toast({
          title: "Roster saved",
          description: "The team roster has been saved successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error saving roster",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePlayer = async (playerId: number) => {
    try {
      const response = await apiRequest("DELETE", `/api/players/${playerId}`);
      
      if (response.ok) {
        toast({
          title: "Player deleted",
          description: "The player has been removed from the roster",
        });
        
        // Refresh players list
        queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      }
    } catch (error) {
      toast({
        title: "Error deleting player",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Player</CardTitle>
          <CardDescription>Add a new player to the team roster</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <Input type="number" min="1" placeholder="Enter jersey number" {...field} />
                    </FormControl>
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
                      <Input placeholder="Enter photo URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-royal-blue hover:bg-royal-blue/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Player"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Roster</CardTitle>
          <CardDescription>Manage the current team roster</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading roster...</div>
          ) : players && players.length > 0 ? (
            <>
              <div className="space-y-4">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      {player.photoUrl ? (
                        <img src={player.photoUrl} alt={player.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <i className="ri-user-line text-gray-400"></i>
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-gray-500">
                          {player.position} · #{player.jerseyNumber}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeletePlayer(player.id)}
                    >
                      <i className="ri-delete-bin-line mr-1"></i>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button 
                  onClick={handleSaveRoster}
                  className="w-full bg-royal-bright-blue hover:bg-royal-bright-blue/90"
                >
                  <i className="ri-save-line mr-1"></i>
                  Save Roster
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No players in the roster yet. Add some players above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerManagement; 