# Data Model Documentation

This document provides detailed information about the data model used in the Royal FC Asaba All-Stars Club website.

## Overview

The data model consists of several interconnected entities that represent the core concepts of the football club website: users (admins), players, tournaments, teams, fixtures, and match results. These entities are defined in the `shared/schema.ts` file and are used throughout the application.

## Entity Relationships

Here's a high-level overview of how the entities relate to each other:

```
User (Admin)
  |
  v
Player <----> MatchResult
  |             ^
  |             |
  v             |
TournamentTeam  |
  |             |
  v             |
Tournament <--> Fixture
```

## Detailed Entity Descriptions

### User

Represents administrators and executives who have access to the admin panel.

```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "exco"] }).default("exco").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Key Fields:**
- `id`: Unique identifier
- `username`: Login username
- `password`: Password (should be hashed in production)
- `role`: Either "admin" (full access) or "exco" (limited access)

### Player

Represents a football player in the club.

```typescript
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(), // Goalkeeper, Defender, Midfielder, Forward
  jerseyNumber: integer("jersey_number").notNull(),
  photoUrl: text("photo_url"),
  stats: jsonb("stats").notNull().default({
    goals: 0,
    assists: 0,
    cleanSheets: 0,
    tackles: 0,
    saves: 0,
    gamesPlayed: 0,
    skillRating: 3, // 1-5 scale for player skill level
    teamWins: 0,    // how many times this player's team has won in team generator
    teamLosses: 0,  // how many times this player's team has lost in team generator
    teamDraws: 0    // how many times this player's team has drawn in team generator
  }),
  badges: jsonb("badges").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Key Fields:**
- `id`: Unique identifier
- `name`: Player's name
- `position`: Playing position (Goalkeeper, Defender, Midfielder, Forward)
- `jerseyNumber`: Player's jersey number
- `photoUrl`: URL to player's photo
- `stats`: JSON object containing various performance statistics
- `badges`: Array of achievement badges earned by the player

### Tournament

Represents a football tournament organized by the club.

```typescript
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"), // active, completed
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  description: text("description"),
  format: text("format").notNull(), // 5-a-side, 7-a-side, 11-a-side
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Key Fields:**
- `id`: Unique identifier
- `name`: Tournament name
- `status`: Current status (active or completed)
- `startDate`: Tournament start date
- `endDate`: Tournament end date
- `format`: Game format (5-a-side, 7-a-side, 11-a-side)

**Virtual Fields (in code):**
- `teams`: Array of teams participating in the tournament
- `fixtures`: Array of fixtures (matches) in the tournament

### TournamentTeam

Represents a team participating in a tournament.

```typescript
export const tournamentTeams = pgTable("tournament_teams", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull(),
  name: text("name").notNull(),
  captainId: integer("captain_id"), // Can be null if not assigned yet
  played: integer("played").notNull().default(0),
  won: integer("won").notNull().default(0),
  drawn: integer("drawn").notNull().default(0),
  lost: integer("lost").notNull().default(0),
  goalsFor: integer("goals_for").notNull().default(0),
  goalsAgainst: integer("goals_against").notNull().default(0),
  points: integer("points").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Key Fields:**
- `id`: Unique identifier
- `tournamentId`: Reference to the tournament
- `name`: Team name
- `captainId`: Reference to the player who is the team captain (optional)
- `played`, `won`, `drawn`, `lost`: Match statistics
- `goalsFor`, `goalsAgainst`: Goal statistics
- `points`: Total points earned in the tournament

### Fixture

Represents a match between two teams.

```typescript
export const fixtures = pgTable("fixtures", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull(),
  homeTeamId: integer("home_team_id").notNull(),
  awayTeamId: integer("away_team_id").notNull(),
  homeTeamName: text("home_team_name").notNull(),
  awayTeamName: text("away_team_name").notNull(),
  homeTeamCaptain: text("home_team_captain"),
  awayTeamCaptain: text("away_team_captain"),
  homeTeamScore: integer("home_team_score"),
  awayTeamScore: integer("away_team_score"),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  tournamentName: text("tournament_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Key Fields:**
- `id`: Unique identifier
- `tournamentId`: Reference to the tournament
- `homeTeamId`, `awayTeamId`: References to the teams playing
- `homeTeamName`, `awayTeamName`: Team names (denormalized for convenience)
- `homeTeamScore`, `awayTeamScore`: Match scores (null until recorded)
- `date`: Scheduled date and time
- `location`: Match venue
- `status`: Current status of the match

### MatchResult

Represents individual player statistics from a match.

```typescript
export const matchResults = pgTable("match_results", {
  id: serial("id").primaryKey(),
  fixtureId: integer("fixture_id").notNull(),
  playerId: integer("player_id").notNull(),
  goals: integer("goals").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  cleanSheet: boolean("clean_sheet").notNull().default(false),
  tackles: integer("tackles").notNull().default(0),
  saves: integer("saves").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Key Fields:**
- `id`: Unique identifier
- `fixtureId`: Reference to the fixture (match)
- `playerId`: Reference to the player
- `goals`, `assists`, `cleanSheet`, `tackles`, `saves`: Individual performance statistics

## Data Flow

### Recording Match Results

When a match result is recorded:

1. The `Fixture` is updated with scores and status
2. `TournamentTeam` records are updated with new statistics
3. Individual `MatchResult` records are created for player contributions
4. `Player` statistics are updated to reflect new totals

```typescript
async recordMatchResult(data: MatchResultFormData): Promise<boolean> {
  try {
    const fixtureId = parseInt(data.fixtureId);
    const fixture = await this.getFixture(fixtureId);
    if (!fixture) return false;
    
    // Update fixture with scores
    await this.updateFixture(fixtureId, {
      homeTeamScore: data.homeTeamScore,
      awayTeamScore: data.awayTeamScore,
      status: "completed"
    });
    
    // Find the teams
    const homeTeam = await this.getTournamentTeam(fixture.homeTeamId);
    const awayTeam = await this.getTournamentTeam(fixture.awayTeamId);
    
    // Update team statistics
    // ...
    
    // Record player stats
    if (data.scorers && data.scorers.length > 0) {
      for (const scorer of data.scorers) {
        // Update player stats
        // ...
        
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

### Team Generation

When teams are generated:

1. Players are selected based on input parameters
2. Teams are created based on balancing method
3. If in competition mode, team results are tracked
4. Generated teams can be saved to a tournament

```typescript
async generateTeams(data: TeamGenerationRequest): Promise<GeneratedTeam[]> {
  try {
    const players = await this.getPlayersByIds(data.playerIds);
    if (!players.length) return [];
    
    // Determine how many players per team
    // ...
    
    // Initialize teams
    // ...
    
    // Apply balancing method
    // ...
    
    // Consider historical performance if enabled
    if (data.considerHistory) {
      // Adjust teams based on past performance
      // ...
    }
    
    return teams;
  } catch (error) {
    console.error("Error generating teams:", error);
    return [];
  }
}
```

## Storage Implementation

The application uses a storage interface that can be implemented in different ways:

```typescript
export interface IStorage {
  // User (Admin) methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Player methods
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayers(): Promise<Player[]>;
  // ...

  // Tournament methods
  getTournament(id: number): Promise<Tournament | undefined>;
  getTournaments(): Promise<Tournament[]>;
  // ...

  // Special methods for business logic
  recordMatchResult(data: MatchResultFormData): Promise<boolean>;
  generateTeams(data: TeamGenerationRequest): Promise<GeneratedTeam[]>;
  getLeaderboard(category: string): Promise<Player[]>;
  // ...
}
```

The current implementation uses in-memory storage (`MemStorage`), but this can be replaced with a database implementation.

## Data Validation

Data validation is performed using Zod schemas:

```typescript
export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
```

These schemas are used to validate data before it's stored or updated.

## Best Practices

1. **Type Safety**: Use TypeScript types and Zod schemas for validation
2. **Referential Integrity**: Maintain proper relationships between entities
3. **Denormalization**: Store derived data where appropriate for performance
4. **Validation**: Validate all data before storage
5. **Error Handling**: Handle and log errors appropriately

## Future Enhancements

1. **Database Implementation**: Replace in-memory storage with PostgreSQL
2. **Transactions**: Use database transactions for complex operations
3. **Caching**: Implement caching for frequently accessed data
4. **Soft Deletes**: Add soft delete functionality for data recovery
5. **Audit Logging**: Track changes to important data
