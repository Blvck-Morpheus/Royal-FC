import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { MatchResultFormData, TeamGenerationRequest, ContactFormData } from "@shared/schema";

// Simple in-memory session storage for admin authentication
let adminSession: { authenticated: boolean } = { authenticated: false };

export async function registerRoutes(app: Express): Promise<Server> {
  // Prefix all API routes with /api
  
  // Players API
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Error fetching players" });
    }
  });

  app.get("/api/players/:id", async (req, res) => {
    try {
      const playerId = parseInt(req.params.id);
      const player = await storage.getPlayer(playerId);
      
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: "Error fetching player" });
    }
  });
  
  app.post("/api/players", async (req, res) => {
    try {
      // Check if admin is authenticated
      if (!adminSession.authenticated) {
        return res.status(401).json({ message: "Unauthorized. Admin access required." });
      }
      
      const playerData = req.body;
      const newPlayer = await storage.createPlayer(playerData);
      res.status(201).json(newPlayer);
    } catch (error) {
      res.status(500).json({ message: "Error creating player" });
    }
  });
  
  app.patch("/api/players/:id", async (req, res) => {
    try {
      // Check if admin is authenticated
      if (!adminSession.authenticated) {
        return res.status(401).json({ message: "Unauthorized. Admin access required." });
      }
      
      const playerId = parseInt(req.params.id);
      const playerData = req.body;
      
      const updatedPlayer = await storage.updatePlayer(playerId, playerData);
      
      if (!updatedPlayer) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      res.json(updatedPlayer);
    } catch (error) {
      res.status(500).json({ message: "Error updating player" });
    }
  });
  
  app.delete("/api/players/:id", async (req, res) => {
    try {
      // Check if admin is authenticated
      if (!adminSession.authenticated) {
        return res.status(401).json({ message: "Unauthorized. Admin access required." });
      }
      
      const playerId = parseInt(req.params.id);
      
      // In a real app, this would actually delete the player from storage
      // For this MVP, we just check if the player exists
      const player = await storage.getPlayer(playerId);
      
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      // In a real app:
      // await storage.deletePlayer(playerId);
      
      res.json({ message: "Player deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting player" });
    }
  });

  // Leaderboard API
  app.get("/api/players/leaderboard/:category?", async (req, res) => {
    try {
      const category = req.params.category || "goals";
      const players = await storage.getLeaderboard(category);
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Error fetching leaderboard" });
    }
  });
  
  // Update player stats from leaderboard
  app.patch("/api/players/:id/stats", async (req, res) => {
    try {
      // Check if admin is authenticated
      if (!adminSession.authenticated) {
        return res.status(401).json({ message: "Unauthorized. Admin access required." });
      }
      
      const playerId = parseInt(req.params.id);
      const statsData = req.body;
      
      const player = await storage.getPlayer(playerId);
      
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      // Update only the stats portion of the player
      const updatedPlayer = await storage.updatePlayer(playerId, {
        stats: {
          ...player.stats as any,
          ...statsData
        }
      });
      
      res.json(updatedPlayer);
    } catch (error) {
      res.status(500).json({ message: "Error updating player stats" });
    }
  });

  // Tournaments API
  app.get("/api/tournaments", async (req, res) => {
    try {
      const tournaments = await storage.getTournaments();
      res.json(tournaments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tournaments" });
    }
  });

  app.get("/api/tournaments/active", async (req, res) => {
    try {
      const tournaments = await storage.getActiveTournaments();
      res.json(tournaments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching active tournaments" });
    }
  });

  app.get("/api/tournaments/past", async (req, res) => {
    try {
      const tournaments = await storage.getPastTournaments();
      res.json(tournaments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching past tournaments" });
    }
  });

  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const tournamentId = parseInt(req.params.id);
      const tournament = await storage.getTournament(tournamentId);
      
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      res.json(tournament);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tournament" });
    }
  });

  // Fixtures API
  app.get("/api/fixtures", async (req, res) => {
    try {
      const fixtures = await storage.getFixtures();
      res.json(fixtures);
    } catch (error) {
      res.status(500).json({ message: "Error fetching fixtures" });
    }
  });

  app.get("/api/fixtures/upcoming", async (req, res) => {
    try {
      const fixtures = await storage.getUpcomingFixtures();
      res.json(fixtures);
    } catch (error) {
      res.status(500).json({ message: "Error fetching upcoming fixtures" });
    }
  });
  
  app.get("/api/fixtures/active", async (req, res) => {
    try {
      const fixtures = await storage.getActiveFixtures();
      res.json(fixtures);
    } catch (error) {
      res.status(500).json({ message: "Error fetching active fixtures" });
    }
  });
  
  app.patch("/api/fixtures/:id/score", async (req, res) => {
    try {
      // Check if admin is authenticated
      if (!adminSession.authenticated) {
        return res.status(401).json({ message: "Unauthorized. Admin access required." });
      }
      
      const fixtureId = parseInt(req.params.id);
      const { homeTeamScore, awayTeamScore } = req.body;
      
      if (isNaN(homeTeamScore) || isNaN(awayTeamScore)) {
        return res.status(400).json({ message: "Invalid score values" });
      }
      
      const updatedFixture = await storage.updateFixture(fixtureId, {
        homeTeamScore,
        awayTeamScore
      });
      
      if (!updatedFixture) {
        return res.status(404).json({ message: "Fixture not found" });
      }
      
      res.json(updatedFixture);
    } catch (error) {
      res.status(500).json({ message: "Error updating fixture score" });
    }
  });
  
  app.patch("/api/fixtures/:id/start", async (req, res) => {
    try {
      // Check if admin is authenticated
      if (!adminSession.authenticated) {
        return res.status(401).json({ message: "Unauthorized. Admin access required." });
      }
      
      const fixtureId = parseInt(req.params.id);
      
      const updatedFixture = await storage.updateFixture(fixtureId, {
        status: "in_progress",
        homeTeamScore: 0,
        awayTeamScore: 0
      });
      
      if (!updatedFixture) {
        return res.status(404).json({ message: "Fixture not found" });
      }
      
      res.json(updatedFixture);
    } catch (error) {
      res.status(500).json({ message: "Error starting fixture" });
    }
  });
  
  app.patch("/api/fixtures/:id/end", async (req, res) => {
    try {
      // Check if admin is authenticated
      if (!adminSession.authenticated) {
        return res.status(401).json({ message: "Unauthorized. Admin access required." });
      }
      
      const fixtureId = parseInt(req.params.id);
      const { homeTeamScore, awayTeamScore } = req.body;
      
      if (isNaN(homeTeamScore) || isNaN(awayTeamScore)) {
        return res.status(400).json({ message: "Invalid score values" });
      }
      
      const updatedFixture = await storage.updateFixture(fixtureId, {
        status: "completed",
        homeTeamScore,
        awayTeamScore
      });
      
      if (!updatedFixture) {
        return res.status(404).json({ message: "Fixture not found" });
      }
      
      // Update team standings
      await storage.recordMatchResult({
        fixtureId: fixtureId.toString(),
        homeTeamScore,
        awayTeamScore,
        scorers: []
      });
      
      res.json(updatedFixture);
    } catch (error) {
      res.status(500).json({ message: "Error ending fixture" });
    }
  });

  app.get("/api/fixtures/:id", async (req, res) => {
    try {
      const fixtureId = parseInt(req.params.id);
      const fixture = await storage.getFixture(fixtureId);
      
      if (!fixture) {
        return res.status(404).json({ message: "Fixture not found" });
      }
      
      res.json(fixture);
    } catch (error) {
      res.status(500).json({ message: "Error fetching fixture" });
    }
  });

  // Team Generator API
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
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error generating teams" });
    }
  });

  app.post("/api/team-generator/save", async (req, res) => {
    try {
      // In a real app, we would save the generated teams to storage
      // For this MVP, we just return success
      res.json({ message: "Teams saved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error saving teams" });
    }
  });
  
  app.post("/api/team-generator/record-result", async (req, res) => {
    try {
      const schema = z.object({
        teams: z.array(z.object({
          name: z.string(),
          players: z.array(z.object({
            id: z.number(),
            name: z.string(),
            position: z.string(),
            // other player fields optional
          })),
        })),
        winningTeamIndex: z.number(),
        isDraw: z.boolean().default(false)
      });
      
      const validatedData = schema.parse(req.body);
      
      // Update player stats based on match result
      const { teams, winningTeamIndex, isDraw } = validatedData;
      
      // Process all players in all teams
      for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
        const team = teams[teamIndex];
        
        for (const player of team.players) {
          const existingPlayer = await storage.getPlayer(player.id);
          if (!existingPlayer) continue;
          
          const stats = existingPlayer.stats as any || {};
          
          // Update player stats based on match result
          if (isDraw) {
            stats.teamDraws = (stats.teamDraws || 0) + 1;
          } else if (teamIndex === winningTeamIndex) {
            stats.teamWins = (stats.teamWins || 0) + 1;
          } else {
            stats.teamLosses = (stats.teamLosses || 0) + 1;
          }
          
          // Update games played count
          stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
          
          // Save updated player stats
          await storage.updatePlayer(player.id, { stats });
        }
      }
      
      res.json({ message: "Match result recorded successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error recording match result" });
    }
  });

  // Match Result API
  app.post("/api/match-results", async (req, res) => {
    try {
      // Check if admin is authenticated
      if (!adminSession.authenticated) {
        return res.status(401).json({ message: "Unauthorized. Admin access required." });
      }
      
      const schema = z.object({
        fixtureId: z.string(),
        homeTeamScore: z.number().min(0),
        awayTeamScore: z.number().min(0),
        scorers: z.array(
          z.object({
            playerId: z.string(),
            goals: z.number().min(1),
          })
        ).optional(),
      });
      
      const validatedData = schema.parse(req.body) as MatchResultFormData;
      const result = await storage.recordMatchResult(validatedData);
      
      if (!result) {
        return res.status(400).json({ message: "Failed to record match result" });
      }
      
      res.json({ message: "Match result recorded successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error recording match result" });
    }
  });

  // Contact Form API
  app.post("/api/contact", async (req, res) => {
    try {
      const schema = z.object({
        fullName: z.string().min(2, "Full name is required"),
        email: z.string().email("Invalid email address"),
        phone: z.string().min(6, "Phone number is required"),
        position: z.string().min(1, "Please select a position"),
        experience: z.string().min(1, "Please select your experience level"),
        message: z.string().min(10, "Please tell us a bit about yourself"),
        termsAccepted: z.boolean().refine(val => val === true, {
          message: "You must accept the terms and conditions"
        }),
      });
      
      const validatedData = schema.parse(req.body) as ContactFormData;
      const result = await storage.saveContactForm(validatedData);
      
      if (!result) {
        return res.status(400).json({ message: "Failed to save contact form" });
      }
      
      res.json({ message: "Contact form submitted successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error submitting contact form" });
    }
  });

  // Admin API
  app.post("/api/admin/login", async (req, res) => {
    try {
      const schema = z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      });
      
      const validatedData = schema.parse(req.body);
      const user = await storage.getUserByUsername(validatedData.username);
      
      if (!user || user.password !== validatedData.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set admin as authenticated
      adminSession.authenticated = true;
      
      res.json({ message: "Login successful" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error during login" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    adminSession.authenticated = false;
    res.json({ message: "Logout successful" });
  });

  app.get("/api/admin/check-auth", (req, res) => {
    if (adminSession.authenticated) {
      res.json({ authenticated: true });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
