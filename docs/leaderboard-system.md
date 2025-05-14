# Leaderboard System Documentation

This document provides detailed information about the Leaderboard System implemented for the Royal FC Asaba All-Stars Club website.

## Overview

The Leaderboard System tracks and displays player performance across various statistical categories, creating a competitive environment that encourages player engagement and improvement. It automatically updates based on match results and provides recognition for top performers.

## Key Features

1. **Multiple Categories**: Track different performance metrics (goals, assists, clean sheets, etc.)
2. **Visual Ranking**: Clear visual hierarchy for top performers
3. **Achievement Badges**: Recognition for exceptional performance
4. **Filtering Options**: View stats by tournament or all-time

## Data Model

### Player Stats Structure

The player stats are stored in the Player entity:

```typescript
interface PlayerStats {
  goals: number;
  assists: number;
  cleanSheets: number;
  tackles: number;
  saves: number;
  gamesPlayed: number;
  skillRating: number; // 1-5 scale for player skill level
  teamWins: number;    // how many times this player's team has won in team generator
  teamLosses: number;  // how many times this player's team has lost in team generator
  teamDraws: number;   // how many times this player's team has drawn in team generator
}

interface Player {
  id: number;
  name: string;
  position: string;
  jerseyNumber: number;
  photoUrl: string;
  stats: PlayerStats;
  badges: string[];
  createdAt: Date;
}
```

### Match Result Recording

When match results are recorded, player stats are updated:

```typescript
async recordMatchResult(data: MatchResultFormData): Promise<boolean> {
  try {
    // Update fixture with scores
    // ...
    
    // Record player stats
    if (data.scorers && data.scorers.length > 0) {
      for (const scorer of data.scorers) {
        if (!scorer.playerId) continue;
        
        const playerId = parseInt(scorer.playerId);
        const player = await this.getPlayer(playerId);
        if (!player) continue;
        
        // Update player stats
        const stats = { ...player.stats };
        stats.goals = (stats.goals || 0) + scorer.goals;
        stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
        
        await this.updatePlayer(playerId, { stats });
        
        // Record match result
        await this.createMatchResult({
          fixtureId,
          playerId,
          goals: scorer.goals,
          assists: 0,
          cleanSheet: false,
          tackles: 0,
          saves: 0
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error recording match result:", error);
    return false;
  }
}
```

## Leaderboard Categories

The leaderboard supports multiple statistical categories:

1. **Goals**: Total goals scored
2. **Assists**: Total assists provided
3. **Clean Sheets**: For goalkeepers
4. **Tackles**: Defensive contributions
5. **Saves**: For goalkeepers
6. **Games Played**: Participation metric

## Implementation

### Leaderboard Component

The `LeaderboardTable` component displays player rankings:

```tsx
const LeaderboardTable = () => {
  const [category, setCategory] = useState<LeaderboardCategory>("goals");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [editValues, setEditValues] = useState<Record<string, number>>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Fetch players data
  const { data: players, isLoading, error } = useQuery<Player[]>({
    queryKey: ['/api/players/leaderboard', category],
  });
  
  // Sort players based on selected category
  const sortedPlayers = useMemo(() => {
    if (!players) return [];
    
    return [...players].sort((a, b) => {
      const aStats = a.stats as any || {};
      const bStats = b.stats as any || {};
      
      // Get values for the requested category
      let aValue = 0;
      let bValue = 0;
      
      switch (category) {
        case "goals":
          aValue = aStats.goals || 0;
          bValue = bStats.goals || 0;
          break;
        case "assists":
          aValue = aStats.assists || 0;
          bValue = bStats.assists || 0;
          break;
        case "cleanSheets":
          aValue = aStats.cleanSheets || 0;
          bValue = bStats.cleanSheets || 0;
          break;
        case "tackles":
          aValue = aStats.tackles || 0;
          bValue = bStats.tackles || 0;
          break;
        case "saves":
          aValue = aStats.saves || 0;
          bValue = bStats.saves || 0;
          break;
      }
      
      // Sort by category value (descending)
      if (bValue !== aValue) {
        return bValue - aValue;
      }
      
      // If tied, sort by games played (ascending)
      return (aStats.gamesPlayed || 0) - (bStats.gamesPlayed || 0);
    });
  }, [players, category]);
  
  // Render leaderboard table
  return (
    // JSX implementation
  );
};
```

### Server-Side Implementation

The server provides an endpoint to fetch leaderboard data:

```typescript
// Get leaderboard data
app.get("/api/players/leaderboard", async (req, res) => {
  try {
    const category = req.query.category as string || "goals";
    const players = await storage.getLeaderboard(category);
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
});

// Implementation in storage.ts
async getLeaderboard(category: string = "goals"): Promise<Player[]> {
  const players = await this.getPlayers();
  
  // Sort players based on the requested category
  return players.sort((a, b) => {
    const aStats = a.stats as any || {};
    const bStats = b.stats as any || {};
    
    // Get values for the requested category
    let aValue = 0;
    let bValue = 0;
    
    switch (category) {
      case "goals":
        aValue = aStats.goals || 0;
        bValue = bStats.goals || 0;
        break;
      case "assists":
        aValue = aStats.assists || 0;
        bValue = bStats.assists || 0;
        break;
      // Other categories...
    }
    
    // Sort by category value (descending)
    return bValue - aValue;
  });
}
```

## Achievement Badges

The system awards badges for exceptional performance:

### Badge Types

1. **Golden Boot**: Top goal scorer
2. **Playmaker**: Most assists
3. **Wall**: Most clean sheets (goalkeeper)
4. **Iron Defense**: Most tackles
5. **Safe Hands**: Most saves (goalkeeper)
6. **MVP**: Best overall performance

### Badge Assignment

Badges are assigned based on performance thresholds and rankings:

```typescript
function assignBadges(players: Player[]): void {
  // Sort players by goals
  const goalScorers = [...players].sort((a, b) => 
    (b.stats.goals || 0) - (a.stats.goals || 0)
  );
  
  // Assign Golden Boot to top scorer
  if (goalScorers.length > 0 && goalScorers[0].stats.goals > 0) {
    const topScorer = goalScorers[0];
    if (!topScorer.badges.includes("goldenBoot")) {
      topScorer.badges.push("goldenBoot");
    }
  }
  
  // Similar logic for other badge types
  // ...
}
```

## User Interface

### Category Selection

Users can switch between different statistical categories:

```tsx
<div className="flex justify-center mb-6">
  <div className="inline-flex bg-white rounded-lg shadow-sm">
    <button
      className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
        category === "goals" 
          ? "bg-royal-blue text-white" 
          : "bg-white text-gray-700 hover:bg-gray-100"
      }`}
      onClick={() => setCategory("goals")}
    >
      Goals
    </button>
    <button
      className={`px-4 py-2 text-sm font-medium ${
        category === "assists" 
          ? "bg-royal-blue text-white" 
          : "bg-white text-gray-700 hover:bg-gray-100"
      }`}
      onClick={() => setCategory("assists")}
    >
      Assists
    </button>
    {/* Other category buttons */}
  </div>
</div>
```

### Leaderboard Table

The leaderboard displays players ranked by their performance:

```tsx
<table className="min-w-full divide-y divide-gray-200">
  <thead>
    <tr className="bg-royal-blue text-white">
      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Rank</th>
      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Player</th>
      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Position</th>
      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">{getCategoryHeader()}</th>
      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Games</th>
      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Badges</th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {sortedPlayers.slice(0, 10).map((player, index) => (
      <tr key={player.id} className="hover:bg-royal-light transition-colors duration-200">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`flex items-center justify-center h-6 w-6 rounded-full font-bold text-sm
            ${index === 0 ? 'bg-royal-gold text-royal-blue' : 
              index === 1 ? 'bg-gray-300 text-gray-700' : 
              index === 2 ? 'bg-royal-gold/60 text-royal-blue' : 
              'bg-gray-200 text-gray-700'}`}>
            {index + 1}
          </div>
        </td>
        {/* Other table cells */}
      </tr>
    ))}
  </tbody>
</table>
```

### Badge Display

Badges are displayed as icons with tooltips:

```tsx
function getBadges(player: Player) {
  return player.badges.map(badge => {
    let icon = "";
    let tooltip = "";
    
    switch (badge) {
      case "goldenBoot":
        icon = "ri-football-line";
        tooltip = "Golden Boot";
        break;
      case "playmaker":
        icon = "ri-magic-line";
        tooltip = "Playmaker";
        break;
      // Other badge types
    }
    
    return (
      <Tooltip key={badge} content={tooltip}>
        <div className="h-6 w-6 rounded-full bg-royal-gold flex items-center justify-center">
          <i className={`${icon} text-royal-blue text-xs`}></i>
        </div>
      </Tooltip>
    );
  });
}
```

## Admin Features

Admins can edit player statistics directly from the leaderboard:

```tsx
const handleEditPlayer = (player: Player) => {
  setPlayerToEdit(player);
  setEditValues({
    goals: player.stats.goals || 0,
    assists: player.stats.assists || 0,
    cleanSheets: player.stats.cleanSheets || 0,
    tackles: player.stats.tackles || 0,
    saves: player.stats.saves || 0,
    gamesPlayed: player.stats.gamesPlayed || 0
  });
  setIsEditDialogOpen(true);
};

const handleSaveEdit = async () => {
  if (!playerToEdit) return;
  
  try {
    const updatedStats = {
      ...playerToEdit.stats,
      ...editValues
    };
    
    const response = await apiRequest("PUT", `/api/players/${playerToEdit.id}`, {
      stats: updatedStats
    });
    
    if (response.ok) {
      // Success handling
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/players/leaderboard'] });
    }
  } catch (error) {
    // Error handling
  }
};
```

## Best Practices

1. **Real-Time Updates**: Ensure leaderboard updates promptly after match results
2. **Visual Hierarchy**: Make top performers stand out visually
3. **Context**: Provide context for stats (games played, position)
4. **Recognition**: Use badges to recognize different types of achievement
5. **Transparency**: Make it clear how rankings are calculated

## Future Enhancements

1. **Tournament Filtering**: View leaderboards for specific tournaments
2. **Time Period Filtering**: View stats by season or month
3. **Advanced Statistics**: Add more complex performance metrics
4. **Player Progression**: Show improvement over time
5. **Comparative Analysis**: Compare players head-to-head
