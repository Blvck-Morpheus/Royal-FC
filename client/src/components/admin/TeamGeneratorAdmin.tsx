import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Player, GeneratedTeam, TeamGenerationRequest } from "@shared/schema";
import { Users, Shuffle, Target, Trophy, Save } from "lucide-react";

const teamGenSchema = z.object({
  format: z.enum(["5-a-side", "7-a-side", "11-a-side"]),
  playerIds: z.array(z.number()).min(10, "Select at least 10 players"),
  balanceMethod: z.enum(["skill", "position", "mixed"]),
  teamsCount: z.number().min(2).max(8),
  considerHistory: z.boolean(),
  competitionMode: z.boolean(),
});

type TeamGenFormData = z.infer<typeof teamGenSchema>;

const TeamGeneratorAdmin = () => {
  const [generatedTeams, setGeneratedTeams] = useState<GeneratedTeam[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Fetch players
  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  // Form setup
  const form = useForm<TeamGenFormData>({
    resolver: zodResolver(teamGenSchema),
    defaultValues: {
      format: "5-a-side",
      playerIds: [],
      balanceMethod: "mixed",
      teamsCount: 2,
      considerHistory: true,
      competitionMode: true,
    },
  });

  // Generate teams mutation
  const generateTeams = useMutation({
    mutationFn: async (data: TeamGenerationRequest) => {
      const response = await apiRequest("POST", "/api/team-generator", data);
      return response.json();
    },
    onSuccess: (teams) => {
      setGeneratedTeams(teams);
      toast({ title: "Success", description: "Teams generated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate teams",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  // Save teams mutation
  const saveTeams = useMutation({
    mutationFn: async (teams: GeneratedTeam[]) => {
      const response = await apiRequest("POST", "/api/team-generator/save", { teams });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Teams saved successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save teams",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TeamGenFormData) => {
    setIsGenerating(true);
    generateTeams.mutate({
      ...data,
      matchType: "tournament",
    });
  };

  const handlePlayerToggle = (playerId: number, checked: boolean) => {
    const currentIds = form.getValues("playerIds");
    if (checked) {
      form.setValue("playerIds", [...currentIds, playerId]);
    } else {
      form.setValue("playerIds", currentIds.filter(id => id !== playerId));
    }
  };

  const selectAllPlayers = () => {
    form.setValue("playerIds", players.map(p => p.id));
  };

  const clearAllPlayers = () => {
    form.setValue("playerIds", []);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading players...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Team Generator</h2>
        <p className="text-gray-600">Generate balanced teams for matches and tournaments</p>
      </div>

      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="w-5 h-5" />
            Generate Teams
          </CardTitle>
          <CardDescription>Configure team generation parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Match Format</FormLabel>
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
                  control={form.control}
                  name="balanceMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Balance Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="skill">Skill-based</SelectItem>
                          <SelectItem value="position">Position-based</SelectItem>
                          <SelectItem value="mixed">Mixed (Recommended)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teamsCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Teams</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select count" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="2">2 Teams</SelectItem>
                          <SelectItem value="3">3 Teams</SelectItem>
                          <SelectItem value="4">4 Teams</SelectItem>
                          <SelectItem value="6">6 Teams</SelectItem>
                          <SelectItem value="8">8 Teams</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-6">
                <FormField
                  control={form.control}
                  name="considerHistory"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Consider Match History</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Factor in past team performance
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="competitionMode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Competition Mode</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Assign captains and optimize for competition
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Player Selection */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <FormLabel>Select Players ({form.watch("playerIds").length} selected)</FormLabel>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={selectAllPlayers}>
                      Select All
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={clearAllPlayers}>
                      Clear All
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`player-${player.id}`}
                        checked={form.watch("playerIds").includes(player.id)}
                        onCheckedChange={(checked) => handlePlayerToggle(player.id, checked as boolean)}
                      />
                      <label
                        htmlFor={`player-${player.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        <div className="flex items-center justify-between">
                          <span>{player.name}</span>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {player.position}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {player.stats.skillRating}/5
                            </Badge>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </div>

              <Button type="submit" disabled={isGenerating} className="w-full">
                <Shuffle className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating Teams..." : "Generate Teams"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Generated Teams */}
      {generatedTeams.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Generated Teams
                </CardTitle>
                <CardDescription>Balanced teams ready for competition</CardDescription>
              </div>
              <Button onClick={() => saveTeams.mutate(generatedTeams)} disabled={saveTeams.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Save Teams
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedTeams.map((team, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{team.name}</span>
                      {team.captain && (
                        <Badge variant="outline">
                          Captain: {team.captain.name}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>Total Skill: {Math.round(team.totalSkill)}</div>
                        <div>Win Rate: {Math.round(team.averageWinRate)}%</div>
                        <div>Position Balance: {Math.round(team.positionBalance)}%</div>
                        <div>Players: {team.players.length}</div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Players:</h4>
                        <div className="flex flex-wrap gap-2">
                          {team.players.map((player) => (
                            <Badge key={player.id} variant="secondary" className="text-xs">
                              {player.name} ({player.position})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {players.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No players available</h3>
            <p className="text-gray-600 mb-4">Add players to your roster before generating teams</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamGeneratorAdmin;
