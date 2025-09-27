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
import { Fixture, Tournament, TournamentTeam } from "@shared/schema";
import { Plus, Calendar, Clock, MapPin, Play, Square, Trophy } from "lucide-react";
import { format } from "date-fns";

const fixtureSchema = z.object({
  tournamentId: z.number().min(1, "Tournament is required"),
  homeTeamId: z.number().min(1, "Home team is required"),
  awayTeamId: z.number().min(1, "Away team is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required"),
});

type FixtureFormData = z.infer<typeof fixtureSchema>;

const FixtureManagement = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch fixtures
  const { data: fixtures = [], isLoading: fixturesLoading } = useQuery<Fixture[]>({
    queryKey: ["/api/fixtures"],
  });

  // Fetch tournaments
  const { data: tournaments = [] } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  // Fetch tournament teams
  const { data: tournamentTeams = [] } = useQuery<TournamentTeam[]>({
    queryKey: ["/api/tournaments", selectedTournament, "teams"],
    enabled: !!selectedTournament,
  });

  // Form setup
  const form = useForm<FixtureFormData>({
    resolver: zodResolver(fixtureSchema),
    defaultValues: {
      tournamentId: 0,
      homeTeamId: 0,
      awayTeamId: 0,
      date: "",
      location: "",
    },
  });

  // Create fixture mutation
  const createFixture = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/fixtures", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fixtures"] });
      toast({ title: "Success", description: "Fixture created successfully" });
      form.reset();
      setIsCreating(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create fixture",
        variant: "destructive",
      });
    },
  });

  // Start match mutation
  const startMatch = useMutation({
    mutationFn: async (fixtureId: number) => {
      const response = await apiRequest("PATCH", `/api/fixtures/${fixtureId}/start`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fixtures"] });
      toast({ title: "Success", description: "Match started successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start match",
        variant: "destructive",
      });
    },
  });

  // End match mutation
  const endMatch = useMutation({
    mutationFn: async ({ fixtureId, homeScore, awayScore }: { fixtureId: number; homeScore: number; awayScore: number }) => {
      const response = await apiRequest("PATCH", `/api/fixtures/${fixtureId}/end`, {
        homeTeamScore: homeScore,
        awayTeamScore: awayScore,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fixtures"] });
      toast({ title: "Success", description: "Match completed successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to end match",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FixtureFormData) => {
    const homeTeam = tournamentTeams.find(t => t.id === data.homeTeamId);
    const awayTeam = tournamentTeams.find(t => t.id === data.awayTeamId);
    const tournament = tournaments.find(t => t.id === data.tournamentId);

    if (!homeTeam || !awayTeam || !tournament) {
      toast({
        title: "Error",
        description: "Invalid team or tournament selection",
        variant: "destructive",
      });
      return;
    }

    const fixtureData = {
      ...data,
      homeTeamName: homeTeam.name,
      awayTeamName: awayTeam.name,
      tournamentName: tournament.name,
      date: new Date(data.date).toISOString(),
    };

    createFixture.mutate(fixtureData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>;
      case "active":
        return <Badge variant="default"><Play className="w-3 h-3 mr-1" />Live</Badge>;
      case "completed":
        return <Badge variant="secondary"><Square className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (fixturesLoading) {
    return <div className="flex justify-center p-8">Loading fixtures...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Fixture Management</h2>
          <p className="text-gray-600">Schedule and manage matches</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Match
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Match</CardTitle>
            <CardDescription>Create a new fixture between two teams</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="tournamentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tournament</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          const tournamentId = parseInt(value);
                          field.onChange(tournamentId);
                          setSelectedTournament(tournamentId);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tournament" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tournaments.map((tournament) => (
                            <SelectItem key={tournament.id} value={tournament.id.toString()}>
                              {tournament.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedTournament && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="homeTeamId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Home Team</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select home team" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {tournamentTeams.map((team) => (
                                  <SelectItem key={team.id} value={team.id.toString()}>
                                    {team.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="awayTeamId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Away Team</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select away team" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {tournamentTeams.map((team) => (
                                  <SelectItem key={team.id} value={team.id.toString()}>
                                    {team.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Match Date & Time</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter match location" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={createFixture.isPending}>
                    Schedule Match
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Fixtures List */}
      <div className="space-y-4">
        {fixtures.map((fixture) => (
          <Card key={fixture.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-royal-blue" />
                    <span className="font-medium">{fixture.tournamentName}</span>
                    {getStatusBadge(fixture.status)}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="font-semibold">{fixture.homeTeamName}</div>
                      <div className="text-sm text-gray-600">Home</div>
                    </div>
                    
                    <div className="text-center px-4">
                      {fixture.status === "completed" ? (
                        <div className="text-2xl font-bold">
                          {fixture.homeTeamScore} - {fixture.awayTeamScore}
                        </div>
                      ) : (
                        <div className="text-lg text-gray-400">VS</div>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <div className="font-semibold">{fixture.awayTeamName}</div>
                      <div className="text-sm text-gray-600">Away</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(fixture.date), "MMM d, yyyy 'at' HH:mm")}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {fixture.location}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {fixture.status === "scheduled" && (
                    <Button 
                      size="sm" 
                      onClick={() => startMatch.mutate(fixture.id)}
                      disabled={startMatch.isPending}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </Button>
                  )}
                  
                  {fixture.status === "active" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const homeScore = prompt("Enter home team score:");
                        const awayScore = prompt("Enter away team score:");
                        if (homeScore !== null && awayScore !== null) {
                          endMatch.mutate({
                            fixtureId: fixture.id,
                            homeScore: parseInt(homeScore) || 0,
                            awayScore: parseInt(awayScore) || 0,
                          });
                        }
                      }}
                      disabled={endMatch.isPending}
                    >
                      <Square className="w-3 h-3 mr-1" />
                      End Match
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {fixtures.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No fixtures scheduled</h3>
            <p className="text-gray-600 mb-4">Start by scheduling your first match</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule First Match
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FixtureManagement;
