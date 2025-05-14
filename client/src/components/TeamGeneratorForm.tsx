import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Player, GeneratedTeam, TeamMatchHistory } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TeamGeneratorForm = () => {
  // State management
  const [format, setFormat] = useState<"5-a-side" | "7-a-side" | "11-a-side">("5-a-side");
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [generatedTeams, setGeneratedTeams] = useState<GeneratedTeam[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Competition settings
  const [balanceMethod, setBalanceMethod] = useState<"skill" | "position" | "mixed">("mixed");
  const [teamsCount, setTeamsCount] = useState<number>(2);
  const [considerHistory, setConsiderHistory] = useState<boolean>(true);
  const [competitionMode, setCompetitionMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [showPlayerStatsDisplay, setShowPlayerStatsDisplay] = useState<boolean>(false);
  
  // Get user session
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ['/api/admin/check-auth'],
  });

  const isAdmin = session?.role === 'admin';
  const isExco = session?.role === 'exco';
  const isPrivilegedUser = isAdmin || isExco;
  
  const { toast } = useToast();
  
  // Fetch players
  const { data: players, isLoading: isPlayersLoading, error } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });

  const generateTeams = async () => {
    if (selectedPlayers.length < getMinimumPlayers()) {
      toast({
        title: "Not enough players",
        description: `You need at least ${getMinimumPlayers()} players for ${format}`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsGenerating(true);
      const res = await apiRequest("POST", "/api/team-generator", {
        format,
        playerIds: selectedPlayers,
        balanceMethod,
        teamsCount,
        considerHistory: isPrivilegedUser ? considerHistory : false,
        competitionMode: isPrivilegedUser ? competitionMode : false
      });
      
      const teams = await res.json();
      setGeneratedTeams(teams);
      
      toast({
        title: "Teams generated",
        description: "Teams have been generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error generating teams",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateTeams = () => {
    generateTeams();
  };

  const saveTeams = async () => {
    if (!generatedTeams || !isPrivilegedUser) return;
    
    try {
      setIsSaving(true);
      const res = await apiRequest("POST", "/api/team-generator/save", {
        teams: generatedTeams,
      });
      
      if (!res.ok) throw new Error("Failed to save teams");
      
      toast({
        title: "Teams saved",
        description: "The generated teams have been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error saving teams",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Add function to record match results for competition mode
  const recordMatchResult = async (winningTeamIndex: number, isDraw: boolean = false) => {
    if (!generatedTeams || generatedTeams.length < 2) return;
    
    try {
      await apiRequest("POST", "/api/team-generator/record-result", {
        teams: generatedTeams,
        winningTeamIndex: isDraw ? -1 : winningTeamIndex,
        isDraw
      });
      
      toast({
        title: "Match result recorded",
        description: isDraw 
          ? "The match result has been recorded as a draw" 
          : `${generatedTeams[winningTeamIndex].name} has been recorded as the winner`,
      });
      
      // Reload players to update stats
      // This needs a query invalidation in a real app
    } catch (error) {
      toast({
        title: "Error recording result",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const togglePlayerSelection = (playerId: number) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const getMinimumPlayers = () => {
    const playersPerTeam = format === "5-a-side" ? 5 : (format === "7-a-side" ? 7 : 11);
    return Math.max(teamsCount * 2, Math.ceil(teamsCount * playersPerTeam * 0.8));
  };

  const getPositionLabel = (position: string) => {
    switch (position.toLowerCase()) {
      case "goalkeeper": return "GK";
      case "defender": return "DEF";
      case "midfielder": return "MID";
      case "forward": return "FWD";
      default: return position;
    }
  };
  
  const getSkillRating = (player: Player) => {
    const skillRating = (player.stats as any)?.skillRating || 3;
    const stars = "★".repeat(skillRating) + "☆".repeat(5 - skillRating);
    return stars;
  };
  
  const getPlayerPerformanceStats = (player: Player) => {
    const stats = player.stats as any;
    return {
      wins: stats?.teamWins || 0,
      losses: stats?.teamLosses || 0,
      draws: stats?.teamDraws || 0,
      winRate: stats?.teamWins && (stats?.teamWins + stats?.teamLosses + stats?.teamDraws) > 0 
        ? Math.round((stats.teamWins / (stats.teamWins + stats.teamLosses + stats.teamDraws)) * 100) 
        : 0
    };
  };

  if (isSessionLoading || isPlayersLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-royal-light rounded-lg shadow-lg overflow-hidden">
        <div className="bg-royal-blue text-white p-4">
          <h3 className="font-montserrat font-bold text-xl">Team Generator</h3>
          <p className="text-sm text-royal-bright-blue mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-royal-light rounded-lg shadow-lg overflow-hidden">
        <div className="bg-royal-blue text-white p-4">
          <h3 className="font-montserrat font-bold text-xl">Team Generator</h3>
          <p className="text-sm text-royal-bright-blue mt-1">Error loading players</p>
        </div>
        <div className="p-6 text-red-500">
          {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-royal-light rounded-lg shadow-lg overflow-hidden">
      <div className="bg-royal-blue text-white p-4">
        <h3 className="font-montserrat font-bold text-xl">Team Generator</h3>
        <p className="text-sm text-royal-bright-blue mt-1">Create balanced teams for competition and training</p>
      </div>
      
      {!isPrivilegedUser && (
        <Alert className="m-4">
          <AlertTitle>Basic Mode</AlertTitle>
          <AlertDescription>
            You are using the basic team generator. Log in as an admin or exco member to access advanced features.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="p-6">
        <Tabs defaultValue="basic" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            {isPrivilegedUser && (
              <TabsTrigger value="advanced">Advanced Competition</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="basic">
            {/* Team Format Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Select Format:</label>
              <div className="flex flex-wrap gap-4">
                <button 
                  className={`px-4 py-2 ${format === "5-a-side" ? "bg-royal-blue text-white" : "border border-royal-blue text-royal-blue hover:bg-royal-blue/10"} rounded-md font-medium transition duration-200`}
                  onClick={() => setFormat("5-a-side")}
                >
                  5-a-side
                </button>
                <button 
                  className={`px-4 py-2 ${format === "7-a-side" ? "bg-royal-blue text-white" : "border border-royal-blue text-royal-blue hover:bg-royal-blue/10"} rounded-md font-medium transition duration-200`}
                  onClick={() => setFormat("7-a-side")}
                >
                  7-a-side
                </button>
                <button 
                  className={`px-4 py-2 ${format === "11-a-side" ? "bg-royal-blue text-white" : "border border-royal-blue text-royal-blue hover:bg-royal-blue/10"} rounded-md font-medium transition duration-200`}
                  onClick={() => setFormat("11-a-side")}
                >
                  11-a-side
                </button>
              </div>
            </div>
          </TabsContent>
          
          {isPrivilegedUser && (
            <TabsContent value="advanced">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3">Team Configuration</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Number of Teams:</label>
                      <Select 
                        value={teamsCount.toString()} 
                        onValueChange={(value) => setTeamsCount(parseInt(value))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select team count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 Teams</SelectItem>
                          <SelectItem value="3">3 Teams</SelectItem>
                          <SelectItem value="4">4 Teams</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Balancing Method:</label>
                      <Select 
                        value={balanceMethod} 
                        onValueChange={(value) => setBalanceMethod(value as any)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select balancing method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="skill">By Skill Level</SelectItem>
                          <SelectItem value="position">By Position</SelectItem>
                          <SelectItem value="mixed">Combined Method</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-3">Competition Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="competition-mode">Competition Mode</Label>
                        <p className="text-sm text-gray-500">Enable tracking of wins and performance</p>
                      </div>
                      <Switch 
                        id="competition-mode" 
                        checked={competitionMode}
                        onCheckedChange={setCompetitionMode}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="consider-history">Consider Past Performance</Label>
                        <p className="text-sm text-gray-500">Balance teams based on previous results</p>
                      </div>
                      <Switch 
                        id="consider-history" 
                        checked={considerHistory}
                        onCheckedChange={setConsiderHistory}
                        disabled={!competitionMode}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-player-stats">Show Player Statistics</Label>
                        <p className="text-sm text-gray-500">Display player skill and win rates</p>
                      </div>
                      <Switch 
                        id="show-player-stats" 
                        checked={showPlayerStatsDisplay}
                        onCheckedChange={setShowPlayerStatsDisplay}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
        
        {/* Player Selection */}
        <div className="mb-6 mt-6">
          <label className="block text-gray-700 font-semibold mb-2">Select Players:</label>
          <div className="bg-white p-4 rounded-md shadow max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {players?.map(player => (
                <div key={player.id} className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center">
                    <Checkbox 
                      id={`player-${player.id}`}
                      checked={selectedPlayers.includes(player.id)}
                      onCheckedChange={() => togglePlayerSelection(player.id)}
                      className="mr-3"
                    />
                    <label htmlFor={`player-${player.id}`} className="flex items-center">
                      {player.photoUrl ? (
                        <img src={player.photoUrl} alt={player.name} className="h-8 w-8 rounded-full mr-2 object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                          <i className="ri-user-line text-gray-400"></i>
                        </div>
                      )}
                      <div>
                        <div>{player.name}</div>
                        {(isPrivilegedUser || showPlayerStatsDisplay) && (
                          <div className="text-xs text-gray-500 flex items-center">
                            <span className="text-amber-500 mr-2">{getSkillRating(player)}</span>
                            <span className="text-green-600">{getPlayerPerformanceStats(player).wins}W</span>
                            <span className="mx-1">-</span>
                            <span className="text-red-600">{getPlayerPerformanceStats(player).losses}L</span>
                            <span className="mx-1">-</span>
                            <span>{getPlayerPerformanceStats(player).draws}D</span>
                            {getPlayerPerformanceStats(player).wins + 
                             getPlayerPerformanceStats(player).losses + 
                             getPlayerPerformanceStats(player).draws > 0 && (
                              <span className="ml-1">({getPlayerPerformanceStats(player).winRate}%)</span>
                            )}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  <span className="text-sm bg-royal-blue/10 text-royal-blue px-2 py-1 rounded">
                    {getPositionLabel(player.position)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-2">{selectedPlayers.length} players selected</div>
        </div>
        
        <div className="text-center mb-6">
          <button 
            className="px-6 py-3 bg-royal-bright-blue text-white font-bold rounded-md hover:bg-royal-bright-blue/90 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={generateTeams}
            disabled={selectedPlayers.length < getMinimumPlayers() || isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Teams"}
          </button>
        </div>
        
        {/* Generated Teams Display */}
        {generatedTeams && generatedTeams.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {generatedTeams.map((team, index) => {
                const teamColors = [
                  'text-royal-blue',
                  'text-royal-bright-blue',
                  'text-green-600',
                  'text-purple-600'
                ];
                
                return (
                  <div key={index} className="bg-white rounded-md shadow p-4">
                    <h3 className={`font-montserrat font-bold text-xl mb-2 text-center ${teamColors[index % teamColors.length]}`}>
                      {team.name}
                    </h3>
                    
                    {team.captain && (
                      <div className="mb-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <i className="ri-star-fill mr-1"></i> Captain: {team.captain.name}
                        </span>
                      </div>
                    )}
                    
                    {isPrivilegedUser && competitionMode && team.totalSkill && (
                      <div className="text-center mb-3">
                        <span className="text-sm text-gray-600">
                          Team Skill Rating: {team.totalSkill}
                        </span>
                      </div>
                    )}
                    
                    <ul className="space-y-2">
                      {team.players.map(player => (
                        <li key={player.id} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center">
                            {player.photoUrl ? (
                              <img src={player.photoUrl} alt={player.name} className="h-8 w-8 rounded-full mr-2 object-cover" />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                                <i className="ri-user-line text-gray-400"></i>
                              </div>
                            )}
                            <div>
                              <div>{player.name}</div>
                              {(isPrivilegedUser || showPlayerStatsDisplay) && (
                                <div className="text-xs text-amber-500">
                                  {getSkillRating(player)}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-sm bg-royal-blue/10 text-royal-blue px-2 py-1 rounded">
                            {getPositionLabel(player.position)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 space-y-6">
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  className="px-4 py-2 bg-royal-blue text-white rounded-md font-medium"
                  onClick={regenerateTeams}
                >
                  <i className="ri-refresh-line mr-1"></i> Regenerate Teams
                </button>
                {isPrivilegedUser && (
                  <button 
                    className="px-4 py-2 border border-royal-blue text-royal-blue rounded-md font-medium hover:bg-royal-blue/10 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={saveTeams}
                    disabled={isSaving}
                  >
                    <i className="ri-save-line mr-1"></i> {isSaving ? "Saving..." : "Save Teams"}
                  </button>
                )}
              </div>
              
              {isPrivilegedUser && competitionMode && (
                <div className="bg-royal-light p-4 rounded-lg">
                  <h4 className="font-semibold text-lg text-center mb-3">Record Match Result</h4>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Recording match results helps create more balanced teams in the future
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-3">
                    {generatedTeams.map((team, index) => (
                      <button
                        key={index}
                        className="px-3 py-2 bg-royal-bright-blue text-white rounded-md font-medium"
                        onClick={() => recordMatchResult(index)}
                      >
                        {team.name} Won
                      </button>
                    ))}
                    <button
                      className="px-3 py-2 bg-gray-500 text-white rounded-md font-medium"
                      onClick={() => recordMatchResult(-1, true)}
                    >
                      Draw
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeamGeneratorForm;
