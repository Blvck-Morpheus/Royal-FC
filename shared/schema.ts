import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model for admin access
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Player model
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
    gamesPlayed: 0
  }),
  badges: jsonb("badges").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

// Tournament model
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

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
});

export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournaments.$inferSelect & {
  teams: TournamentTeam[];
  fixtures: Fixture[];
};

// Tournament team model for tracking team performance in tournaments
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

export const insertTournamentTeamSchema = createInsertSchema(tournamentTeams).omit({
  id: true,
  createdAt: true,
});

export type InsertTournamentTeam = z.infer<typeof insertTournamentTeamSchema>;
export type TournamentTeam = typeof tournamentTeams.$inferSelect;

// Fixture model for matches
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
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  tournamentName: text("tournament_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFixtureSchema = createInsertSchema(fixtures).omit({
  id: true,
  createdAt: true,
});

export type InsertFixture = z.infer<typeof insertFixtureSchema>;
export type Fixture = typeof fixtures.$inferSelect;

// Match Results (for tracking individual player stats in matches)
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

export const insertMatchResultSchema = createInsertSchema(matchResults).omit({
  id: true,
  createdAt: true,
});

export type InsertMatchResult = z.infer<typeof insertMatchResultSchema>;
export type MatchResult = typeof matchResults.$inferSelect;

// Generated team for team generator feature
export type GeneratedTeam = {
  name: string;
  players: Player[];
};

// Match Result Form values
export type MatchResultFormData = {
  fixtureId: string;
  homeTeamScore: number;
  awayTeamScore: number;
  scorers: {
    playerId: string;
    goals: number;
  }[];
};

// Team Generation Request
export type TeamGenerationRequest = {
  format: "5-a-side" | "7-a-side" | "11-a-side";
  playerIds: number[];
};

// Contact form data
export type ContactFormData = {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  message: string;
  termsAccepted: boolean;
};
