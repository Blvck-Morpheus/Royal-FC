import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Player, GeneratedTeam } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const TeamGeneratorForm = () => {
  const [format, setFormat] = useState<"5-a-side" | "7-a-side" | "11-a-side">("5-a-side");
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [generatedTeams, setGeneratedTeams] = useState<GeneratedTeam[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { toast } = useToast();
  
  const { data: players, isLoading, error } = useQuery<Player[]>({
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
      });
      
      const teams = await res.json();
      setGeneratedTeams(teams);
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
    if (!generatedTeams) return;
    
    try {
      await apiRequest("POST", "/api/team-generator/save", {
        teams: generatedTeams,
      });
      
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
    switch (format) {
      case "5-a-side": return 10;
      case "7-a-side": return 14;
      case "11-a-side": return 22;
      default: return 10;
    }
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-royal-light rounded-lg shadow-lg overflow-hidden">
        <div className="bg-royal-blue text-white p-4">
          <h3 className="font-montserrat font-bold text-xl">Random Team Generator</h3>
          <p className="text-sm text-royal-gold mt-1">Loading players...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-royal-light rounded-lg shadow-lg overflow-hidden">
        <div className="bg-royal-blue text-white p-4">
          <h3 className="font-montserrat font-bold text-xl">Random Team Generator</h3>
          <p className="text-sm text-royal-gold mt-1">Error loading players</p>
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
        <h3 className="font-montserrat font-bold text-xl">Random Team Generator</h3>
        <p className="text-sm text-royal-gold mt-1">Select players and generate balanced teams</p>
      </div>
      
      <div className="p-6">
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
        
        {/* Player Selection */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Select Players:</label>
          <div className="bg-white p-4 rounded-md shadow max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {players?.map(player => (
                <div key={player.id} className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`player-${player.id}`}
                      checked={selectedPlayers.includes(player.id)}
                      onChange={() => togglePlayerSelection(player.id)}
                      className="rounded text-royal-blue focus:ring-royal-blue mr-3" 
                    />
                    <label htmlFor={`player-${player.id}`} className="flex items-center">
                      {player.photoUrl ? (
                        <img src={player.photoUrl} alt={player.name} className="h-8 w-8 rounded-full mr-2 object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                          <i className="ri-user-line text-gray-400"></i>
                        </div>
                      )}
                      <span>{player.name}</span>
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
            className="px-6 py-3 bg-royal-gold text-royal-blue font-bold rounded-md hover:bg-yellow-400 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={generateTeams}
            disabled={selectedPlayers.length < getMinimumPlayers() || isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Teams"}
          </button>
        </div>
        
        {/* Generated Teams Display */}
        {generatedTeams && generatedTeams.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {generatedTeams.map((team, index) => (
                <div key={index} className="bg-white rounded-md shadow p-4">
                  <h3 className={`font-montserrat font-bold text-xl mb-4 text-center ${index === 0 ? 'text-royal-blue' : 'text-royal-gold'}`}>
                    {team.name}
                  </h3>
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
                          <span>{player.name}</span>
                        </div>
                        <span className="text-sm bg-royal-blue/10 text-royal-blue px-2 py-1 rounded">
                          {getPositionLabel(player.position)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-6 space-x-4">
              <button 
                className="px-4 py-2 bg-royal-blue text-white rounded-md font-medium"
                onClick={regenerateTeams}
              >
                <i className="ri-refresh-line mr-1"></i> Regenerate
              </button>
              <button 
                className="px-4 py-2 border border-royal-blue text-royal-blue rounded-md font-medium hover:bg-royal-blue/10 transition duration-200"
                onClick={saveTeams}
              >
                <i className="ri-save-line mr-1"></i> Save Teams
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeamGeneratorForm;
