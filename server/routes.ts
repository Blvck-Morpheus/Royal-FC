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
