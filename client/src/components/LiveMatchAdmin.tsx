import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Fixture } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const LiveMatchAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get active matches
  const { data: activeMatches, isLoading } = useQuery<Fixture[]>({
    queryKey: ['/api/fixtures/active'],
  });

  // Get the selected match details if ID is set
  const selectedMatch = activeMatches?.find(m => m.id.toString() === selectedMatchId);

  const handleMatchSelection = (matchId: string) => {
    setSelectedMatchId(matchId);
    
    // Load current scores if available
    const match = activeMatches?.find(m => m.id.toString() === matchId);
    if (match) {
      setHomeScore(match.homeTeamScore ?? 0);
      setAwayScore(match.awayTeamScore ?? 0);
    } else {
      setHomeScore(0);
      setAwayScore(0);
    }
  };

  const updateScore = async () => {
    if (!selectedMatchId) {
      toast({
        title: "No match selected",
        description: "Please select a match first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);
      
      const response = await apiRequest("PATCH", `/api/fixtures/${selectedMatchId}/score`, {
        homeTeamScore: homeScore,
        awayTeamScore: awayScore,
      });
      
      if (response.ok) {
        toast({
          title: "Score updated",
          description: "The match score has been updated successfully",
        });
        
        // Invalidate caches to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/fixtures/active'] });
      } else {
        toast({
          title: "Update failed",
          description: "Failed to update the score. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const startMatch = async () => {
    if (!selectedMatchId) {
      toast({
        title: "No match selected",
        description: "Please select a match first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);
      
      const response = await apiRequest("PATCH", `/api/fixtures/${selectedMatchId}/start`, {});
      
      if (response.ok) {
        toast({
          title: "Match started",
          description: "The match has been marked as in progress",
        });
        
        // Invalidate caches to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/fixtures/active'] });
        queryClient.invalidateQueries({ queryKey: ['/api/fixtures/upcoming'] });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const endMatch = async () => {
    if (!selectedMatchId) {
      toast({
        title: "No match selected",
        description: "Please select a match first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);
      
      const response = await apiRequest("PATCH", `/api/fixtures/${selectedMatchId}/end`, {
        homeTeamScore: homeScore,
        awayTeamScore: awayScore,
      });
      
      if (response.ok) {
        toast({
          title: "Match completed",
          description: "The match has been marked as completed with the final score",
        });
        
        // Invalidate caches to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/fixtures/active'] });
        setSelectedMatchId("");
        setHomeScore(0);
        setAwayScore(0);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="font-montserrat font-bold text-xl text-royal-blue mb-6">Live Match Updates</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Active Match</label>
        <Select value={selectedMatchId} onValueChange={handleMatchSelection}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a match to update" />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="loading" disabled>Loading matches...</SelectItem>
            ) : activeMatches && activeMatches.length > 0 ? (
              activeMatches.map((match) => (
                <SelectItem key={match.id} value={match.id.toString()}>
                  {match.homeTeamName} vs {match.awayTeamName} ({format(new Date(match.date), 'MMM d')})
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>No active matches</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      {selectedMatch && (
        <>
          <div className="bg-royal-light p-4 rounded-lg mb-6">
            <div className="text-center mb-2">
              <span className="text-sm font-medium">{selectedMatch.tournamentName}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="font-medium">{selectedMatch.homeTeamName}</p>
              </div>
              <div className="px-4 text-lg font-bold">vs</div>
              <div className="text-center flex-1">
                <p className="font-medium">{selectedMatch.awayTeamName}</p>
              </div>
            </div>
            <div className="text-center text-xs mt-2 text-gray-600">
              {format(new Date(selectedMatch.date), 'PPP')} at {selectedMatch.location}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{selectedMatch.homeTeamName} Score</label>
              <Input 
                type="number" 
                min="0"
                value={homeScore}
                onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{selectedMatch.awayTeamName} Score</label>
              <Input 
                type="number" 
                min="0"
                value={awayScore}
                onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            {selectedMatch.status === "scheduled" && (
              <Button 
                onClick={startMatch} 
                className="bg-green-600 hover:bg-green-700"
                disabled={isUpdating}
              >
                <i className="ri-play-circle-line mr-1"></i> Start Match
              </Button>
            )}
            
            {selectedMatch.status === "in_progress" && (
              <>
                <Button 
                  onClick={updateScore} 
                  className="bg-royal-blue hover:bg-royal-blue/90"
                  disabled={isUpdating}
                >
                  <i className="ri-refresh-line mr-1"></i> Update Score
                </Button>
                
                <Button 
                  onClick={endMatch} 
                  className="bg-amber-600 hover:bg-amber-700"
                  disabled={isUpdating}
                >
                  <i className="ri-stop-circle-line mr-1"></i> End Match
                </Button>
              </>
            )}
          </div>
        </>
      )}
      
      {!selectedMatch && selectedMatchId && (
        <div className="text-center py-4 text-gray-500">
          Match not found or no longer active.
        </div>
      )}
      
      {!selectedMatchId && (
        <div className="text-center py-4 text-gray-500">
          Select a match to update its score in real-time.
        </div>
      )}
    </div>
  );
};

export default LiveMatchAdmin;