import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Player } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

type LeaderboardCategory = "goals" | "assists" | "cleanSheets";

const LeaderboardTable = () => {
  const [category, setCategory] = useState<LeaderboardCategory>("goals");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [editValues, setEditValues] = useState<Record<string, number>>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: players, isLoading, error } = useQuery<Player[]>({
    queryKey: ['/api/players/leaderboard', category],
  });
  
  // Check if user is logged in as admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/check-auth");
        if (response.ok) {
          const userData = await response.json();
          if (userData.authenticated) {
            setIsAdminMode(true);
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    checkAuth();
  }, []);
  
  // Update player stats mutation
  const updatePlayerStatsMutation = useMutation({
    mutationFn: async ({ playerId, stats }: { playerId: number, stats: Record<string, number> }) => {
      const res = await apiRequest("PATCH", `/api/players/${playerId}/stats`, stats);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players/leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      setIsEditDialogOpen(false);
      setPlayerToEdit(null);
      toast({
        title: "Player stats updated",
        description: "Player statistics have been successfully updated."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update player stats",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Loading leaderboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error loading leaderboard: {(error as Error).message}</p>
      </div>
    );
  }

  const getCategoryValue = (player: Player) => {
    switch (category) {
      case "goals":
        return player.stats.goals || 0;
      case "assists":
        return player.stats.assists || 0;
      case "cleanSheets":
        return player.stats.cleanSheets || 0;
      default:
        return 0;
    }
  };

  const getCategoryHeader = () => {
    switch (category) {
      case "goals":
        return "Goals";
      case "assists":
        return "Assists";
      case "cleanSheets":
        return "Clean Sheets";
      default:
        return "Stats";
    }
  };

  const getBadges = (player: Player) => {
    const badges = [];
    
    if (player.badges?.includes("goldenBoot")) {
      badges.push(
        <span key="golden-boot" className="text-xl text-royal-gold" title="Golden Boot Leader">
          <i className="ri-award-fill"></i>
        </span>
      );
    }
    
    if (player.badges?.includes("captain")) {
      badges.push(
        <span key="captain" className="text-xl text-royal-blue" title="Team Captain">
          <i className="ri-vip-crown-fill"></i>
        </span>
      );
    }
    
    if (player.badges?.includes("mostAssists")) {
      badges.push(
        <span key="assists" className="text-xl text-royal-blue" title="Most Assists">
          <i className="ri-magic-fill"></i>
        </span>
      );
    }
    
    if (player.badges?.includes("ironMan")) {
      badges.push(
        <span key="iron-man" className="text-xl text-gray-400" title="Iron Man (Most Minutes)">
          <i className="ri-shield-star-fill"></i>
        </span>
      );
    }
    
    if (player.badges?.includes("fairPlay")) {
      badges.push(
        <span key="fair-play" className="text-xl text-gray-400" title="Fair Play Award">
          <i className="ri-hand-heart-fill"></i>
        </span>
      );
    }
    
    if (player.badges?.includes("mostImproved")) {
      badges.push(
        <span key="improved" className="text-xl text-gray-400" title="Most Improved Player">
          <i className="ri-rocket-fill"></i>
        </span>
      );
    }
    
    return badges;
  };
  
  const handleEditPlayer = (player: Player) => {
    setPlayerToEdit(player);
    
    // Initialize edit values based on the player's current stats
    const stats = player.stats as any;
    setEditValues({
      goals: stats.goals || 0,
      assists: stats.assists || 0,
      cleanSheets: stats.cleanSheets || 0,
      tackles: stats.tackles || 0,
      saves: stats.saves || 0,
      gamesPlayed: stats.gamesPlayed || 0
    });
    
    setIsEditDialogOpen(true);
  };
  
  const handleSaveStats = () => {
    if (playerToEdit) {
      updatePlayerStatsMutation.mutate({
        playerId: playerToEdit.id,
        stats: editValues
      });
    }
  };
  
  const handleInputChange = (field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setEditValues(prev => ({
      ...prev,
      [field]: numValue >= 0 ? numValue : 0 // Ensure non-negative values
    }));
  };

  const sortedPlayers = players
    ? [...players].sort((a, b) => getCategoryValue(b) - getCategoryValue(a))
    : [];

  return (
    <>
      <div className="mb-8 max-w-xl mx-auto">
        <div className="flex justify-center border-b border-gray-200">
          <button 
            className={`px-6 py-3 font-semibold ${category === 'goals' ? 'text-royal-blue border-b-2 border-royal-blue' : 'text-gray-500 hover:text-royal-blue'}`}
            onClick={() => setCategory('goals')}
          >
            Top Scorers
          </button>
          <button 
            className={`px-6 py-3 font-semibold ${category === 'assists' ? 'text-royal-blue border-b-2 border-royal-blue' : 'text-gray-500 hover:text-royal-blue'}`}
            onClick={() => setCategory('assists')}
          >
            Top Assists
          </button>
          <button 
            className={`px-6 py-3 font-semibold ${category === 'cleanSheets' ? 'text-royal-blue border-b-2 border-royal-blue' : 'text-gray-500 hover:text-royal-blue'}`}
            onClick={() => setCategory('cleanSheets')}
          >
            Most Clean Sheets
          </button>
        </div>
      </div>
      
      {isAdminMode && (
        <div className="max-w-3xl mx-auto mb-4 bg-royal-blue/10 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-royal-blue">
              <i className="ri-admin-line mr-1"></i> Admin Mode
            </p>
            <p className="text-xs text-gray-600">Click on any player row to edit their stats</p>
          </div>
        </div>
      )}
      
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-royal-blue text-white">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Player</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">{getCategoryHeader()}</th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Games</th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Badges</th>
              {isAdminMode && (
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPlayers.slice(0, 10).map((player, index) => (
              <tr 
                key={player.id} 
                className={`hover:bg-royal-light transition-colors duration-200 ${isAdminMode ? 'cursor-pointer' : ''}`}
                onClick={isAdminMode ? () => handleEditPlayer(player) : undefined}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center justify-center h-6 w-6 rounded-full font-bold text-sm
                    ${index === 0 ? 'bg-royal-gold text-royal-blue' : 
                      index === 1 ? 'bg-gray-300 text-gray-700' : 
                      index === 2 ? 'bg-royal-gold/60 text-royal-blue' : 
                      'bg-gray-200 text-gray-700'}`}>
                    {index + 1}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0">
                      {player.photoUrl ? (
                        <img className="h-10 w-10 rounded-full object-cover" src={player.photoUrl} alt={player.name} />
                      ) : (
                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-royal-blue/10">
                          <i className="ri-user-line text-lg text-royal-blue/50"></i>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{player.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {player.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-royal-blue">
                  {getCategoryValue(player)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                  {player.stats.gamesPlayed || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center space-x-1">
                    {getBadges(player)}
                  </div>
                </td>
                {isAdminMode && (
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-royal-blue hover:text-royal-blue/80"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPlayer(player);
                      }}
                    >
                      <i className="ri-edit-line mr-1"></i> Edit
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Edit Player Stats Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Player Stats</DialogTitle>
            <DialogDescription>
              Update statistics for {playerToEdit?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Goals</label>
              <Input 
                type="number" 
                min="0"
                value={editValues.goals}
                onChange={(e) => handleInputChange('goals', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Assists</label>
              <Input 
                type="number" 
                min="0"
                value={editValues.assists}
                onChange={(e) => handleInputChange('assists', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Games Played</label>
              <Input 
                type="number" 
                min="0"
                value={editValues.gamesPlayed}
                onChange={(e) => handleInputChange('gamesPlayed', e.target.value)}
              />
            </div>
            
            {playerToEdit?.position === 'Goalkeeper' ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Clean Sheets</label>
                  <Input 
                    type="number" 
                    min="0"
                    value={editValues.cleanSheets}
                    onChange={(e) => handleInputChange('cleanSheets', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Saves</label>
                  <Input 
                    type="number" 
                    min="0"
                    value={editValues.saves}
                    onChange={(e) => handleInputChange('saves', e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {playerToEdit?.position === 'Defender' ? 'Tackles' : 'Clean Sheets'}
                </label>
                <Input 
                  type="number" 
                  min="0"
                  value={playerToEdit?.position === 'Defender' ? editValues.tackles : editValues.cleanSheets}
                  onChange={(e) => handleInputChange(
                    playerToEdit?.position === 'Defender' ? 'tackles' : 'cleanSheets', 
                    e.target.value
                  )}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveStats}
              className="bg-royal-blue"
              disabled={updatePlayerStatsMutation.isPending}
            >
              {updatePlayerStatsMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LeaderboardTable;
