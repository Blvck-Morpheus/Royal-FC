# Team Generator Documentation

This document provides detailed information about the Team Generator feature implemented for the Royal FC Asaba All-Stars Club website.

## Overview

The Team Generator is a core feature that creates balanced teams for matches and tournaments. It uses player data, including skill ratings, positions, and historical performance to ensure fair and competitive team distribution.

## Key Features

1. **Multiple Formats**: Support for 5-a-side, 7-a-side, and 11-a-side team configurations
2. **Balancing Methods**: Different algorithms for team balancing
3. **Competition Mode**: Tracking of generated team performance over time
4. **Tournament Integration**: Direct saving of generated teams to tournaments

## Team Generation Process

### Input Parameters

The Team Generator accepts the following parameters:

```typescript
interface TeamGenerationRequest {
  format: "5-a-side" | "7-a-side" | "11-a-side";
  playerIds: number[];
  balanceMethod: "skill" | "position" | "mixed";
  teamsCount: number;
  considerHistory: boolean;
  competitionMode: boolean;
}
```

### Output Format

The Team Generator produces an array of balanced teams:

```typescript
interface GeneratedTeam {
  name: string;
  players: Player[];
  totalSkill: number;
  matchHistory: {
    opponent: string;
    result: "win" | "loss" | "draw";
    date: Date;
  }[];
}
```

## Balancing Methods

### 1. Skill-Based Balancing

This method distributes players based on their skill ratings to ensure teams have similar overall skill levels.

```typescript
// Sort players by skill
const sortedPlayers = [...players].sort((a, b) => {
  const aSkill = (a.stats as any)?.skillRating || 3;
  const bSkill = (b.stats as any)?.skillRating || 3;
  return bSkill - aSkill; // Highest skill first
});

// Distribute in snake draft order to balance skills
// 0,1,2,3,3,2,1,0,0,1,2...
let teamIndex = 0;
let direction = 1;
for (const player of sortedPlayers) {
  teams[teamIndex].players.push(player);
  teams[teamIndex].totalSkill += ((player.stats as any)?.skillRating || 3);
  
  teamIndex += direction;
  
  // Change direction at the ends
  if (teamIndex >= teams.length - 1) direction = -1;
  if (teamIndex <= 0) direction = 1;
}
```

### 2. Position-Based Balancing

This method ensures each team has a balanced distribution of positions (goalkeepers, defenders, midfielders, forwards).

```typescript
// Group players by position
const positionGroups = {
  "Goalkeeper": players.filter(p => p.position === "Goalkeeper"),
  "Defender": players.filter(p => p.position === "Defender"),
  "Midfielder": players.filter(p => p.position === "Midfielder"),
  "Forward": players.filter(p => p.position === "Forward")
};

// Distribute each position group evenly among teams
Object.keys(positionGroups).forEach(pos => {
  let teamIndex = 0;
  for (const player of positionGroups[pos as keyof typeof positionGroups]) {
    teams[teamIndex].players.push(player);
    teamIndex = (teamIndex + 1) % teams.length;
  }
});
```

### 3. Mixed Balancing (Default)

This method combines both skill and position balancing for optimal team distribution.

```typescript
// First separate by position
const positionGroups = {
  "Goalkeeper": players.filter(p => p.position === "Goalkeeper"),
  "Defender": players.filter(p => p.position === "Defender"),
  "Midfielder": players.filter(p => p.position === "Midfielder"),
  "Forward": players.filter(p => p.position === "Forward")
};

// Sort each position group by skill
Object.keys(positionGroups).forEach(pos => {
  positionGroups[pos as keyof typeof positionGroups].sort((a, b) => {
    const aSkill = (a.stats as any)?.skillRating || 3;
    const bSkill = (b.stats as any)?.skillRating || 3;
    return bSkill - aSkill; // Highest skill first
  });
});

// Distribute in snake pattern within each position group
Object.keys(positionGroups).forEach(pos => {
  let teamIndex = 0;
  let direction = 1;
  
  for (const player of positionGroups[pos as keyof typeof positionGroups]) {
    teams[teamIndex].players.push(player);
    teams[teamIndex].totalSkill += ((player.stats as any)?.skillRating || 3);
    
    teamIndex += direction;
    
    // Change direction at the ends
    if (teamIndex >= teams.length - 1) direction = -1;
    if (teamIndex <= 0) direction = 1;
  }
});
```

## Historical Performance Consideration

When `considerHistory` is enabled, the Team Generator takes into account past performance of players when they've been on the same team:

```typescript
if (considerHistory) {
  // Calculate player compatibility scores based on past results
  const playerCompatibility = calculatePlayerCompatibility(players);
  
  // Adjust team assignments based on compatibility scores
  optimizeTeamsByCompatibility(teams, playerCompatibility);
}
```

## Competition Mode

When `competitionMode` is enabled, the system tracks the performance of generated teams over time:

1. Team results are recorded (wins, losses, draws)
2. Player stats are updated with team performance (teamWins, teamLosses, teamDraws)
3. This data influences future team generation when `considerHistory` is enabled

## User Interface

The Team Generator UI provides the following controls:

1. **Format Selection**: Choose between 5-a-side, 7-a-side, or 11-a-side
2. **Player Selection**: Select which players will participate
3. **Advanced Settings**:
   - Balancing method
   - Number of teams
   - Consider history option
   - Competition mode toggle
4. **Generation Button**: Creates teams based on selected parameters
5. **Regenerate Button**: Creates new teams with the same parameters
6. **Save Teams**: Option to save generated teams for a tournament

## Implementation in the Codebase

### Client-Side Component

The `TeamGeneratorForm` component handles the user interface for team generation:

```tsx
const TeamGeneratorForm = () => {
  const [format, setFormat] = useState<"5-a-side" | "7-a-side" | "11-a-side">("5-a-side");
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [generatedTeams, setGeneratedTeams] = useState<GeneratedTeam[] | null>(null);
  const [balanceMethod, setBalanceMethod] = useState<"skill" | "position" | "mixed">("mixed");
  const [teamsCount, setTeamsCount] = useState<number>(2);
  const [considerHistory, setConsiderHistory] = useState<boolean>(true);
  const [competitionMode, setCompetitionMode] = useState<boolean>(true);
  
  // Fetch players from API
  const { data: players } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });

  // Generate teams function
  const generateTeams = async () => {
    // Implementation details...
  };
  
  // Render form controls and team display
  return (
    // JSX implementation...
  );
};
```

### Server-Side Implementation

The server handles the team generation logic:

```typescript
// API endpoint in routes.ts
app.post("/api/team-generator", async (req, res) => {
  try {
    const schema = z.object({
      format: z.enum(["5-a-side", "7-a-side", "11-a-side"]),
      playerIds: z.array(z.number()),
      balanceMethod: z.enum(["skill", "position", "mixed"]).default("mixed"),
      teamsCount: z.number().min(2).max(4).default(2),
      considerHistory: z.boolean().default(true),
      competitionMode: z.boolean().default(true)
    });
    
    const validatedData = schema.parse(req.body) as TeamGenerationRequest;
    const teams = await storage.generateTeams(validatedData);
    
    res.json(teams);
  } catch (error) {
    // Error handling...
  }
});

// Implementation in storage.ts
async generateTeams(data: TeamGenerationRequest): Promise<GeneratedTeam[]> {
  // Implementation details...
}
```

## Integration with Tournaments

The Team Generator can be used to create teams for tournaments:

1. Admin creates a new tournament
2. Uses the Team Generator to create balanced teams
3. Saves the generated teams to the tournament
4. System automatically creates tournament teams and assigns players

## Best Practices

1. **Player Data Accuracy**: Ensure player skill ratings and positions are up-to-date
2. **Format Selection**: Choose the appropriate format based on available players
3. **Balancing Method**: Use "mixed" for most balanced teams in general play
4. **Competition Mode**: Enable to track team performance over time
5. **Regular Rotation**: Generate new teams periodically to maintain freshness

## Future Enhancements

1. **Custom Balancing Rules**: Allow admins to define custom balancing criteria
2. **Player Preferences**: Consider player preferences for teammates or positions
3. **Time-Based Availability**: Generate teams based on player availability
4. **Performance Prediction**: Predict match outcomes based on generated teams
5. **Visual Team Strength**: Visual representation of team balance and strengths
