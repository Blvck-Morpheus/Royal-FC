import express from 'express';
import { storage } from "./services/storage-impl";
import { z } from "zod";
import { TeamGenerationRequest, ContactFormData } from "@shared/schema";
import { requireAuth, requireAdmin, requireExco } from './middleware/auth';
import { AuthService } from './services/authService';
import { TokenAuthService } from './services/tokenAuth';

const router = express.Router();

// Players API
router.get("/players", async (req, res) => {
  try {
    const players = await storage.getPlayers();
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: "Error fetching players" });
  }
});

router.get("/players/:id", async (req, res) => {
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

router.post("/players", requireExco, async (req, res) => {
  try {
    const playerData = req.body;
    const newPlayer = await storage.createPlayer(playerData);
    res.status(201).json(newPlayer);
  } catch (error) {
    res.status(500).json({ message: "Error creating player" });
  }
});

router.put("/players/:id", requireExco, async (req, res) => {
  try {
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

router.delete("/players/:id", requireExco, async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);

    // Check if the player exists
    const player = await storage.getPlayer(playerId);

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Delete the player
    await storage.deletePlayer(playerId);

    res.json({ message: "Player deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting player" });
  }
});

// Add save roster endpoint
router.post("/players/save-roster", requireExco, async (req, res) => {
  try {
    const { players } = req.body;
    
    // Save the roster
    await storage.saveRoster(players);
    
    res.json({ message: "Roster saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving roster" });
  }
});

// Leaderboard API
router.get("/players/leaderboard/:category?", async (req, res) => {
  try {
    const category = req.params.category || "goals";
    const players = await storage.getLeaderboard(category);
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
});

// Update player stats from leaderboard
router.patch("/players/:id/stats", requireExco, async (req, res) => {
  try {
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

// Remove duplicate tournament routes - using the newer implementation below

// Fixtures API
router.get("/fixtures", async (req, res) => {
  try {
    const fixtures = await storage.getFixtures();
    res.json(fixtures);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fixtures" });
  }
});

router.get("/fixtures/upcoming", async (req, res) => {
  try {
    const fixtures = await storage.getUpcomingFixtures();
    res.json(fixtures);
  } catch (error) {
    res.status(500).json({ message: "Error fetching upcoming fixtures" });
  }
});

router.get("/fixtures/active", async (req, res) => {
  try {
    const fixtures = await storage.getActiveFixtures();
    res.json(fixtures);
  } catch (error) {
    res.status(500).json({ message: "Error fetching active fixtures" });
  }
});

router.patch("/fixtures/:id/score", async (req, res) => {
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

router.patch("/fixtures/:id/start", requireExco, async (req, res) => {
  try {
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

router.patch("/fixtures/:id/end", requireExco, async (req, res) => {
  try {
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

router.get("/fixtures/:id", async (req, res) => {
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
router.post("/team-generator", async (req, res) => {
  try {
    console.log("Team generation request:", req.body);
    
    const schema = z.object({
      format: z.enum(["5-a-side", "7-a-side", "11-a-side"]),
      playerIds: z.array(z.number()),
      balanceMethod: z.enum(["skill", "position", "mixed"]).default("mixed"),
      teamsCount: z.number().min(2).max(4).default(2),
      considerHistory: z.boolean().default(true),
      competitionMode: z.boolean().default(true)
    });

    const validatedData = schema.parse(req.body) as TeamGenerationRequest;
    console.log("Validated data:", validatedData);
    
    const teams = await storage.generateTeams(validatedData);
    console.log("Generated teams:", teams);

    res.json(teams);
  } catch (error) {
    console.error("Team generation error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    res.status(500).json({ 
      message: "Error generating teams", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

router.post("/team-generator/save", async (req, res) => {
  try {
    // In a real app, we would save the generated teams to storage
    // For this MVP, we just return success
    res.json({ message: "Teams saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving teams" });
  }
});

router.post("/team-generator/record-result", async (req, res) => {
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
router.post("/match-results", requireExco, async (req, res) => {
  try {
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
router.post("/contact", async (req, res) => {
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
router.post("/admin/login", async (req, res) => {
  try {
    console.log("Login attempt:", { ...req.body, password: '***' });
    
    const schema = z.object({
      username: z.string().min(1),
      password: z.string().min(1),
      loginType: z.enum(["admin", "exco"]),
    });

    const validatedData = schema.parse(req.body);
    
    // Authenticate user with proper password comparison
    const user = await AuthService.authenticateUser(validatedData.username, validatedData.password);
    
    console.log("Authentication result:", user ? { ...user, password: '***' } : null);

    if (!user) {
      console.log("Invalid credentials");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user role matches requested login type
    if (user.role !== validatedData.loginType) {
      console.log(`Role mismatch: user role ${user.role}, requested ${validatedData.loginType}`);
      return res.status(403).json({ 
        message: `You do not have ${validatedData.loginType} privileges. Your role is ${user.role}.` 
      });
    }

    // Set user session using AuthService (for local development)
    AuthService.setUserSession(req, user);
    
    // Generate JWT token for Vercel compatibility
    const token = TokenAuthService.generateToken(user);
    
    console.log("Login successful:", { userId: user.id, role: user.role });
    res.json({ 
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      },
      token 
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    res.status(500).json({ message: "Error during login" });
  }
});

router.post("/admin/logout", (req, res) => {
  AuthService.clearUserSession(req);
  res.json({ message: "Logout successful" });
});

router.get("/admin/check-auth", (req, res) => {
  if (AuthService.isAuthenticated(req)) {
    const user = AuthService.getUserFromSession(req);
    res.json(user);
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// User Management API
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await storage.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.post("/users", requireAdmin, async (req, res) => {
  try {
    const userData = req.body;
    
    // Validate that we're only creating exco members
    if (userData.role !== "exco") {
      return res.status(400).json({ message: "Can only create exco member accounts" });
    }

    // Create user with hashed password
    const newUser = await AuthService.createUser(userData.username, userData.password, userData.role);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

router.delete("/users/:id", requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Check if the user exists
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only allow deletion of exco members
    if (user.role !== "exco") {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }

    // Delete the user
    await storage.deleteUser(userId);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

// Tournament routes
router.get('/tournaments', async (req, res) => {
  try {
    const tournaments = await storage.getTournaments();
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tournaments' });
  }
});

router.post('/tournaments', requireExco, async (req, res) => {
  try {
    const tournament = await storage.createTournament(req.body);
    res.status(201).json(tournament);
  } catch (error) {
    console.error('Tournament creation error:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to create tournament' 
    });
  }
});

router.get('/tournaments/:id', async (req, res) => {
  try {
    const tournament = await storage.getTournamentById(parseInt(req.params.id));
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tournament' });
  }
});

router.post('/tournament-teams', requireExco, async (req, res) => {
  try {
    const team = await storage.createTournamentTeam(req.body);
    res.status(201).json(team);
  } catch (error) {
    console.error('Team creation error:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to create team' 
    });
  }
});

router.get('/tournaments/:id/teams', async (req, res) => {
  try {
    const teams = await storage.getTournamentTeams(parseInt(req.params.id));
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tournament teams' });
  }
});

router.patch('/tournaments/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const tournament = await storage.updateTournamentStatus(parseInt(req.params.id), status);
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update tournament status' });
  }
});

export default router;
