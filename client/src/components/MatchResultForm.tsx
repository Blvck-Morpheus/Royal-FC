import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Fixture, Tournament, Player } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const matchResultSchema = z.object({
  fixtureId: z.string().min(1, "Fixture is required"),
  homeTeamScore: z.coerce.number().min(0, "Score must be at least 0"),
  awayTeamScore: z.coerce.number().min(0, "Score must be at least 0"),
  scorers: z.array(
    z.object({
      playerId: z.string().min(1, "Player is required"),
      goals: z.coerce.number().min(1, "Goals must be at least 1"),
    })
  ).optional(),
});

type MatchResultFormValues = z.infer<typeof matchResultSchema>;

const MatchResultForm = () => {
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [goalScorers, setGoalScorers] = useState<{playerId: string, goals: number}[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: fixtures, isLoading: fixturesLoading } = useQuery<Fixture[]>({
    queryKey: ['/api/fixtures/upcoming'],
  });
  
  const { data: players } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });
  
  const form = useForm<MatchResultFormValues>({
    resolver: zodResolver(matchResultSchema),
    defaultValues: {
      fixtureId: "",
      homeTeamScore: 0,
      awayTeamScore: 0,
      scorers: [],
    },
  });

  const onSubmit = async (data: MatchResultFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Include goal scorers in the submission
      data.scorers = goalScorers;
      
      const response = await apiRequest("POST", "/api/match-results", data);
      
      if (response.ok) {
        toast({
          title: "Match result saved",
          description: "The match result has been recorded successfully",
        });
        
        // Reset form
        form.reset();
        setGoalScorers([]);
        
        // Invalidate relevant queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/fixtures/upcoming'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/players/leaderboard'] });
      }
    } catch (error) {
      toast({
        title: "Error saving match result",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFixtureChange = (fixtureId: string) => {
    if (fixtures) {
      const fixture = fixtures.find(f => f.id.toString() === fixtureId);
      setSelectedFixture(fixture || null);
      
      // Reset goal scorers when fixture changes
      setGoalScorers([]);
    }
  };

  const addGoalScorer = () => {
    setGoalScorers([...goalScorers, { playerId: "", goals: 1 }]);
  };

  const updateGoalScorer = (index: number, field: 'playerId' | 'goals', value: string | number) => {
    const updatedScorers = [...goalScorers];
    updatedScorers[index] = { 
      ...updatedScorers[index], 
      [field]: field === 'goals' ? Number(value) : value 
    };
    setGoalScorers(updatedScorers);
  };

  const removeGoalScorer = (index: number) => {
    setGoalScorers(goalScorers.filter((_, i) => i !== index));
  };

  const totalGoals = () => {
    return goalScorers.reduce((sum, scorer) => sum + (scorer.goals || 0), 0);
  };

  const homeAwayTotalGoals = () => {
    const homeScore = form.watch("homeTeamScore") || 0;
    const awayScore = form.watch("awayTeamScore") || 0;
    return homeScore + awayScore;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="font-montserrat font-bold text-xl text-royal-blue mb-6">Record Match Result</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="fixtureId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Fixture</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleFixtureChange(value);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a fixture" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {fixturesLoading ? (
                      <SelectItem value="loading" disabled>Loading fixtures...</SelectItem>
                    ) : fixtures && fixtures.length > 0 ? (
                      fixtures.map((fixture) => (
                        <SelectItem key={fixture.id} value={fixture.id.toString()}>
                          {fixture.homeTeamName} vs {fixture.awayTeamName} ({new Date(fixture.date).toLocaleDateString()})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No upcoming fixtures</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {selectedFixture && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="homeTeamScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{selectedFixture.homeTeamName} Score</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="awayTeamScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{selectedFixture.awayTeamName} Score</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-montserrat font-semibold">Goal Scorers</h3>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={addGoalScorer}
                    className="flex items-center"
                  >
                    <i className="ri-add-line mr-1"></i> Add Goal Scorer
                  </Button>
                </div>
                
                {goalScorers.map((scorer, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 items-end">
                    <div className="md:col-span-8">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Player</label>
                      <Select 
                        value={scorer.playerId}
                        onValueChange={(value) => updateGoalScorer(index, 'playerId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select player" />
                        </SelectTrigger>
                        <SelectContent>
                          {players?.map((player) => (
                            <SelectItem key={player.id} value={player.id.toString()}>
                              {player.name} ({player.position})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Goals</label>
                      <Input 
                        type="number" 
                        min="1" 
                        value={scorer.goals}
                        onChange={(e) => updateGoalScorer(index, 'goals', e.target.value)}
                      />
                    </div>
                    
                    <div className="md:col-span-1">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeGoalScorer(index)}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    </div>
                  </div>
                ))}
                
                {goalScorers.length > 0 && homeAwayTotalGoals() !== totalGoals() && (
                  <p className="text-sm text-amber-600 mt-2">
                    <i className="ri-error-warning-line mr-1"></i>
                    Total goals ({totalGoals()}) does not match match score ({homeAwayTotalGoals()})
                  </p>
                )}
              </div>
            </>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-royal-blue hover:bg-royal-blue/90"
            disabled={isSubmitting || !selectedFixture}
          >
            {isSubmitting ? "Saving..." : "Save Match Result"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default MatchResultForm;
