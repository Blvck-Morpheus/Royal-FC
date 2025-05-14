import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Tournament, CreateTournamentInput, TournamentTeam, CreateTournamentTeamInput, Player, TeamGenerationRequest, GeneratedTeam } from "@shared/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const createTournamentSchema = z.object({
  name: z.string().min(1, "Tournament name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  description: z.string().optional(),
  format: z.enum(["5-a-side", "7-a-side", "11-a-side"]),
  maxTeams: z.number().min(2, "Minimum 2 teams required"),
  registrationDeadline: z.string().min(1, "Registration deadline is required"),
});

const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  captainId: z.number().min(1, "Captain is required"),
  playerIds: z.array(z.number()).min(5, "Minimum 5 players required"),
});

const TournamentManagement = () => {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generatedTeams, setGeneratedTeams] = useState<GeneratedTeam[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch tournaments
  const { data: tournaments = [] } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  // Fetch available players
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  // Tournament creation form
  const tournamentForm = useForm<CreateTournamentInput>({
    resolver: zodResolver(createTournamentSchema),
    defaultValues: {
      format: "5-a-side",
      maxTeams: 8,
    },
  });

  // Team creation form
  const teamForm = useForm<CreateTournamentTeamInput>({
    resolver: zodResolver(createTeamSchema),
  });

  // Create tournament mutation
  const createTournament = useMutation({
    mutationFn: async (data: CreateTournamentInput) => {
      const response = await apiRequest("POST", "/api/tournaments", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      toast({
        title: "Success",
        description: "Tournament created successfully",
      });
      tournamentForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create tournament",
        variant: "destructive",
      });
    },
  });

  // Create team mutation
  const createTeam = useMutation({
    mutationFn: async (data: CreateTournamentTeamInput) => {
      const response = await apiRequest("POST", "/api/tournament-teams", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournament-teams"] });
      toast({
        title: "Success",
        description: "Team created successfully",
      });
      teamForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create team",
        variant: "destructive",
      });
    },
  });

  // Add team generation mutation
  const generateTeams = useMutation({
    mutationFn: async (data: TeamGenerationRequest) => {
      const response = await apiRequest("POST", "/api/team-generator", data);
      return response.json();
    },
    onSuccess: (teams) => {
      setGeneratedTeams(teams);
      toast({
        title: "Success",
        description: "Teams generated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate teams",
        variant: "destructive",
      });
    },
  });

  const onTournamentSubmit = (data: CreateTournamentInput) => {
    createTournament.mutate(data);
  };

  const onTeamSubmit = (data: CreateTournamentTeamInput) => {
    if (!selectedTournament) {
      toast({
        title: "Error",
        description: "Please select a tournament first",
        variant: "destructive",
      });
      return;
    }
    createTeam.mutate({
      ...data,
      tournamentId: selectedTournament.id,
    });
  };

  // Function to handle team generation
  const handleGenerateTeams = async () => {
    if (!selectedTournament) {
      toast({
        title: "Error",
        description: "Please select a tournament first",
        variant: "destructive",
      });
      return;
    }

    const selectedPlayers = teamForm.getValues("playerIds") || [];
    if (selectedPlayers.length < 10) {
      toast({
        title: "Error",
        description: "Please select at least 10 players to generate teams",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      generateTeams.mutate({
        format: selectedTournament.format,
        playerIds: selectedPlayers,
        balanceMethod: "mixed",
        teamsCount: 2,
        considerHistory: true,
        competitionMode: true,
        matchType: "tournament"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to save generated teams
  const handleSaveGeneratedTeams = async () => {
    if (!selectedTournament || !generatedTeams.length) return;

    // Create teams from generated teams
    for (const team of generatedTeams) {
      try {
        await createTeam.mutateAsync({
          tournamentId: selectedTournament.id,
          name: team.name,
          captainId: team.captain?.id || team.players[0].id,
          playerIds: team.players.map(p => p.id)
        });
      } catch (error) {
        console.error("Error saving team:", error);
      }
    }

    setGeneratedTeams([]);
  };

  return (
    <div className="space-y-8">
      {/* Create Tournament Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Tournament</CardTitle>
          <CardDescription>Set up a new tournament with teams and schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...tournamentForm}>
            <form onSubmit={tournamentForm.handleSubmit(onTournamentSubmit)} className="space-y-4">
              <FormField
                control={tournamentForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tournament Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tournament name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={tournamentForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={tournamentForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={tournamentForm.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tournament Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="5-a-side">5-a-side</SelectItem>
                        <SelectItem value="7-a-side">7-a-side</SelectItem>
                        <SelectItem value="11-a-side">11-a-side</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={tournamentForm.control}
                name="maxTeams"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Teams</FormLabel>
                    <FormControl>
                      <Input type="number" min={2} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={tournamentForm.control}
                name="registrationDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={tournamentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter tournament description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={createTournament.isPending}
              >
                {createTournament.isPending ? "Creating..." : "Create Tournament"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Tournament List and Team Creation */}
      {tournaments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Create Teams</CardTitle>
            <CardDescription>Add teams to existing tournaments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Select onValueChange={(value) => setSelectedTournament(tournaments.find(t => t.id === parseInt(value)))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Tournament" />
                </SelectTrigger>
                <SelectContent>
                  {tournaments.map((tournament) => (
                    <SelectItem key={tournament.id} value={tournament.id.toString()}>
                      {tournament.name} ({format(new Date(tournament.startDate), "MMM d, yyyy")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedTournament && (
                <>
                  {/* Player Selection */}
                  <FormField
                    control={teamForm.control}
                    name="playerIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Players</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const id = parseInt(value);
                            const currentIds = field.value || [];
                            if (!currentIds.includes(id)) {
                              field.onChange([...currentIds, id]);
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Add players" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {players.map((player) => (
                              <SelectItem key={player.id} value={player.id.toString()}>
                                {player.name} - {player.position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 mb-2">Selected Players: {field.value?.length || 0}</p>
                          <div className="flex flex-wrap gap-2">
                            {field.value?.map((playerId) => {
                              const player = players.find(p => p.id === playerId);
                              return player ? (
                                <Badge
                                  key={player.id}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={() => {
                                    field.onChange(field.value?.filter(id => id !== player.id));
                                  }}
                                >
                                  {player.name} ×
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Team Generation Button */}
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      onClick={handleGenerateTeams}
                      disabled={isGenerating || !teamForm.getValues("playerIds")?.length}
                      className="flex-1"
                    >
                      {isGenerating ? "Generating Teams..." : "Generate Balanced Teams"}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setGeneratedTeams([])}
                      variant="outline"
                      disabled={!generatedTeams.length}
                    >
                      Clear Generated Teams
                    </Button>
                  </div>

                  {/* Display Generated Teams */}
                  {generatedTeams.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Generated Teams</h3>
                        <Button onClick={handleSaveGeneratedTeams}>Save Teams to Tournament</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {generatedTeams.map((team, index) => (
                          <Card key={index}>
                            <CardHeader>
                              <CardTitle>{team.name}</CardTitle>
                              <CardDescription>
                                Captain: {team.captain?.name || "Not assigned"}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <p className="text-sm text-gray-500">Players:</p>
                                <div className="flex flex-wrap gap-2">
                                  {team.players.map((player) => (
                                    <Badge key={player.id} variant="secondary">
                                      {player.name} ({player.position})
                                    </Badge>
                                  ))}
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                                  <div>Skill Balance: {team.totalSkill}</div>
                                  <div>Position Balance: {Math.round(team.positionBalance)}%</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manual Team Creation Form */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Or Create Team Manually</h3>
                    <Form {...teamForm}>
                      <form onSubmit={teamForm.handleSubmit(onTeamSubmit)} className="space-y-4">
                        <FormField
                          control={teamForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Team Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter team name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={teamForm.control}
                          name="captainId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Team Captain</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select captain" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {players.map((player) => (
                                    <SelectItem key={player.id} value={player.id.toString()}>
                                      {player.name} - {player.position}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={teamForm.control}
                          name="playerIds"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Team Players</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  const id = parseInt(value);
                                  const currentIds = field.value || [];
                                  if (!currentIds.includes(id)) {
                                    field.onChange([...currentIds, id]);
                                  }
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Add players" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {players.map((player) => (
                                    <SelectItem key={player.id} value={player.id.toString()}>
                                      {player.name} - {player.position}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="mt-2">
                                <p className="text-sm text-gray-500 mb-2">Selected Players:</p>
                                <div className="flex flex-wrap gap-2">
                                  {field.value?.map((playerId) => {
                                    const player = players.find(p => p.id === playerId);
                                    return player ? (
                                      <Badge
                                        key={player.id}
                                        variant="secondary"
                                        className="cursor-pointer"
                                        onClick={() => {
                                          field.onChange(field.value?.filter(id => id !== player.id));
                                        }}
                                      >
                                        {player.name} ×
                                      </Badge>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={createTeam.isPending}
                        >
                          {createTeam.isPending ? "Creating..." : "Create Team"}
                        </Button>
                      </form>
                    </Form>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TournamentManagement; 