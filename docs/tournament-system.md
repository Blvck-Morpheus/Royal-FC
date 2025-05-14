# Tournament System Documentation

This document provides detailed information about the tournament system implemented for the Royal FC Asaba All-Stars Club website.

## Overview

The tournament system is designed to facilitate various intra-club competitions, track player and team performance, and enhance engagement through friendly competition. The system supports multiple tournament formats to accommodate different playing styles and club events.

## Tournament Data Model

### Core Entities

#### Tournament
```typescript
{
  id: number;
  name: string;
  status: "active" | "completed";
  startDate: Date;
  endDate: Date;
  description: string;
  format: "5-a-side" | "7-a-side" | "11-a-side";
  teams: TournamentTeam[];
  fixtures: Fixture[];
  createdAt: Date;
}
```

#### TournamentTeam
```typescript
{
  id: number;
  tournamentId: number;
  name: string;
  captainId: number | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  createdAt: Date;
}
```

#### Fixture
```typescript
{
  id: number;
  tournamentId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamCaptain: string | null;
  awayTeamCaptain: string | null;
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  date: Date;
  location: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  tournamentName: string;
  createdAt: Date;
}
```

#### MatchResult
```typescript
{
  id: number;
  fixtureId: number;
  playerId: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  tackles: number;
  saves: number;
  createdAt: Date;
}
```

## Tournament Formats

### 1. Mini-League (Round-Robin)

In this format, each team plays against every other team in the tournament. Points are awarded for wins (3 points) and draws (1 point), with standings determined by total points and goal difference.

#### Implementation Flow:

1. **Tournament Creation**
   - Admin creates tournament with format "5-a-side" or "7-a-side"
   - Teams are registered (manually or via team generator)
   - System generates fixtures for all teams to play each other

2. **Match Day**
   - Fixtures are played according to schedule
   - Admin records match results and player stats
   - Standings table updates automatically

3. **Completion**
   - Final standings determine the champion
   - Player stats are accumulated for leaderboards
   - Tournament status changes to "completed"

#### Code Example: Generating Round-Robin Fixtures

```typescript
function generateRoundRobinFixtures(teams: TournamentTeam[], tournamentId: number): Fixture[] {
  const fixtures: Fixture[] = [];
  
  // For each team, create a fixture against every other team
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      // Create fixture between teams[i] and teams[j]
      fixtures.push({
        tournamentId,
        homeTeamId: teams[i].id,
        awayTeamId: teams[j].id,
        homeTeamName: teams[i].name,
        awayTeamName: teams[j].name,
        homeTeamCaptain: null, // To be filled later
        awayTeamCaptain: null, // To be filled later
        date: new Date(), // To be scheduled
        location: "Main Pitch", // Default location
        status: "scheduled",
        tournamentName: "Tournament Name", // To be filled
      });
    }
  }
  
  return fixtures;
}
```

### 2. Knockout Tournament

In this format, teams compete in a single or double elimination bracket. Losers are eliminated, and winners advance to the next round until a champion is determined.

#### Implementation Flow:

1. **Tournament Creation**
   - Admin creates tournament with knockout format
   - Teams are registered (manually or via team generator)
   - System generates initial round fixtures

2. **Match Day**
   - Fixtures are played according to schedule
   - Admin records match results
   - Winners advance to next round automatically

3. **Completion**
   - Final match determines the champion
   - Tournament status changes to "completed"

#### Code Example: Generating Knockout Fixtures

```typescript
function generateKnockoutFixtures(teams: TournamentTeam[], tournamentId: number): Fixture[] {
  const fixtures: Fixture[] = [];
  
  // Shuffle teams for random matchups
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
  
  // Create first round fixtures
  for (let i = 0; i < shuffledTeams.length; i += 2) {
    // If we have an odd number of teams, the last team gets a bye
    if (i + 1 >= shuffledTeams.length) break;
    
    fixtures.push({
      tournamentId,
      homeTeamId: shuffledTeams[i].id,
      awayTeamId: shuffledTeams[i + 1].id,
      homeTeamName: shuffledTeams[i].name,
      awayTeamName: shuffledTeams[i + 1].name,
      homeTeamCaptain: null,
      awayTeamCaptain: null,
      date: new Date(), // To be scheduled
      location: "Main Pitch",
      status: "scheduled",
      tournamentName: "Tournament Name", // To be filled
      round: 1, // First round
    });
  }
  
  return fixtures;
}
```

### 3. Group Stage + Knockout

This hybrid format begins with teams divided into groups for round-robin play, followed by a knockout stage for the top finishers from each group.

#### Implementation Flow:

1. **Tournament Creation**
   - Admin creates tournament with group + knockout format
   - Teams are assigned to groups
   - System generates group stage fixtures

2. **Group Stage**
   - Teams play round-robin within their groups
   - Standings determine which teams advance

3. **Knockout Stage**
   - Top teams from each group enter knockout bracket
   - Winners advance until a champion is determined

4. **Completion**
   - Final match determines the champion
   - Tournament status changes to "completed"

## Recording Match Results

The system provides an interface for admins to record match results, which updates team standings and player statistics.

### Match Result Form

The match result form allows admins to:
- Select the fixture
- Enter the final score
- Record goal scorers and other stats
- Update match status

### Automatic Updates

When a match result is recorded:
1. The fixture status changes to "completed"
2. Team standings are updated (played, won, drawn, lost, points)
3. Player statistics are updated (goals, assists, clean sheets)
4. Leaderboards reflect the new stats

## Team Generator Integration

The team generator can be used to create balanced teams for tournaments:

1. Admin selects the tournament format (5-a-side, 7-a-side, 11-a-side)
2. Players are selected for participation
3. Balancing method is chosen (skill, position, mixed)
4. Teams are generated and can be saved directly to a tournament

## Implementation Guidelines

### Creating a New Tournament

1. Define tournament details (name, format, dates)
2. Create or generate teams
3. Generate fixtures based on format
4. Publish tournament to make it visible to players

### Recording Match Results

1. Select the fixture from the admin panel
2. Enter the final score
3. Record individual player contributions
4. Submit to update all related statistics

### Completing a Tournament

1. Ensure all fixtures have results recorded
2. Update tournament status to "completed"
3. Recognize winners and top performers

## Best Practices

1. **Data Consistency**: Ensure all match results are recorded accurately
2. **Regular Updates**: Keep fixtures and results current
3. **Balance**: Use the team generator to create fair competitions
4. **Recognition**: Highlight achievements to boost engagement

## Future Enhancements

1. **Advanced Formats**: Support for more complex tournament structures
2. **Automated Scheduling**: Smart fixture scheduling based on availability
3. **Historical Analysis**: Performance trends over multiple tournaments
4. **Predictive Features**: Team and player matchup predictions
