import express from 'express';
import { storage } from "./services/storage-impl";
import { z } from "zod";
import { MatchResultFormData, TeamGenerationRequest, ContactFormData } from "@shared/schema";
import { adminSession } from './middleware/auth';
import { requireAdmin } from './middleware';

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

router.post("/players", async (req, res) => {
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

router.put("/players/:id", async (req, res) => {
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

router.delete("/players/:id", async (req, res) => {
  try {
    // Check if admin is authenticated
    if (!adminSession.authenticated) {
      return res.status(401).json({ message: "Unauthorized. Admin access required." });
    }

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
router.post("/players/save-roster", async (req, res) => {
  try {
    // Check if admin is authenticated
    if (!adminSession.authenticated) {
      return res.status(401).json({ message: "Unauthorized. Admin access required." });
    }

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
router.patch("/players/:id/stats", async (req, res) => {
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
router.get("/tournaments", async (req, res) => {
  try {
    const tournaments = await storage.getTournaments();
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tournaments" });
  }
});

router.get("/tournaments/active", async (req, res) => {
  try {
    const tournaments = await storage.getActiveTournaments();
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching active tournaments" });
  }
});

router.get("/tournaments/past", async (req, res) => {
  try {
    const tournaments = await storage.getPastTournaments();
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching past tournaments" });
  }
});

router.get("/tournaments/:id", async (req, res) => {
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

router.patch("/fixtures/:id/start", async (req, res) => {
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

router.patch("/fixtures/:id/end", async (req, res) => {
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
router.post("/match-results", async (req, res) => {
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
    console.log("Request headers:", req.headers);

    // Log the raw request body
    console.log("Raw request body:", req.body);

    // Ensure admin user exists
    const adminUser = await storage.getUserByUsername("admin");
    if (!adminUser) {
      console.log("Admin user not found, creating default admin user");
      await storage.createUser({
        username: "admin",
        password: "password123",
        role: "admin"
      });
      console.log("Default admin user created");
    } else {
      console.log("Admin user exists:", { id: adminUser.id, username: adminUser.username, role: adminUser.role });
    }

    const schema = z.object({
      username: z.string().min(1),
      password: z.string().min(1),
      loginType: z.enum(["admin", "exco"]).optional(), // Make loginType optional for compatibility
    });

    // Try to validate the data
    let validatedData;
    try {
      validatedData = schema.parse(req.body);
      console.log("Validated data:", { ...validatedData, password: '***' });
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return res.status(400).json({
        message: "Invalid input data",
        details: validationError instanceof z.ZodError ? validationError.errors : "Unknown validation error"
      });
    }

    // For backward compatibility, default to admin if loginType is not provided
    if (!validatedData.loginType) {
      validatedData.loginType = "admin";
      console.log("LoginType not provided, defaulting to admin");
    }

    // Get user by username
    const user = await storage.getUserByUsername(validatedData.username);
    console.log("Found user:", user ? { ...user, password: '***' } : null);

    // Check credentials
    if (!user || user.password !== validatedData.password) {
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

    // Set admin session
    adminSession.authenticated = true;
    adminSession.user = user;

    console.log("Login successful:", { userId: user.id, role: user.role });

    // Return a simplified user object to avoid any potential issues
    const userResponse = {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    };

    console.log("Sending response:", userResponse);

    // Set explicit content type and stringify the response manually
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(userResponse));
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    res.status(500).json({ message: "Error during login" });
  }
});

// Direct admin login endpoint - simplified for maximum compatibility
router.post("/admin/direct-login", (req, res) => {
  console.log("Direct admin login attempt");

  // Create a hardcoded admin user
  const adminUser = {
    id: 1,
    username: "admin",
    password: "password123",
    role: "admin",
    createdAt: new Date()
  };

  // Set admin session
  adminSession.authenticated = true;
  adminSession.user = adminUser;

  console.log("Direct admin login successful");

  // Return a simplified user object
  const userResponse = {
    id: adminUser.id,
    username: adminUser.username,
    role: adminUser.role,
    authenticated: true
  };

  // Set explicit content type and stringify the response manually
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(userResponse));
});

router.post("/admin/logout", (req, res) => {
  console.log("Logout request received");
  adminSession.authenticated = false;
  adminSession.user = undefined;

  console.log("User logged out, session cleared");

  // Set explicit content type and stringify the response manually
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ message: "Logout successful" }));
});

router.get("/admin/check-auth", async (req, res) => {
  console.log("Check auth request received");

  // Ensure admin user exists
  const adminUser = await storage.getUserByUsername("admin");
  if (!adminUser) {
    console.log("Admin user not found in check-auth, creating default admin user");
    await storage.createUser({
      username: "admin",
      password: "password123",
      role: "admin"
    });
    console.log("Default admin user created in check-auth");
  } else {
    console.log("Admin user exists in check-auth:", { id: adminUser.id, username: adminUser.username, role: adminUser.role });
  }

  console.log("Admin session:", {
    authenticated: adminSession.authenticated,
    user: adminSession.user ? {
      id: adminSession.user.id,
      username: adminSession.user.username,
      role: adminSession.user.role
    } : null
  });

  if (adminSession.authenticated && adminSession.user) {
    // Return a simplified user object to avoid any potential issues
    const userResponse = {
      id: adminSession.user.id,
      username: adminSession.user.username,
      role: adminSession.user.role,
      createdAt: adminSession.user.createdAt,
      authenticated: true
    };

    console.log("Auth check successful, returning:", userResponse);

    // Set explicit content type and stringify the response manually
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(userResponse));
  } else {
    console.log("Auth check failed, user not authenticated");

    // Set explicit content type and stringify the response manually
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ authenticated: false }));
  }
});

// User Management API
router.get("/users", async (req, res) => {
  try {
    // Check if admin is authenticated
    if (!adminSession.authenticated) {
      return res.status(401).json({ message: "Unauthorized. Admin access required." });
    }

    const users = await storage.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.post("/users", async (req, res) => {
  try {
    // Check if admin is authenticated
    if (!adminSession.authenticated) {
      return res.status(401).json({ message: "Unauthorized. Admin access required." });
    }

    const userData = req.body;

    // Validate that we're only creating exco members
    if (userData.role !== "exco") {
      return res.status(400).json({ message: "Can only create exco member accounts" });
    }

    const newUser = await storage.createUser(userData);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    // Check if admin is authenticated
    if (!adminSession.authenticated) {
      return res.status(401).json({ message: "Unauthorized. Admin access required." });
    }

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

router.post('/tournaments', requireAdmin, async (req, res) => {
  try {
    const tournament = await storage.createTournament(req.body);
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create tournament' });
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

router.post('/tournament-teams', requireAdmin, async (req, res) => {
  try {
    const team = await storage.createTournamentTeam(req.body);
    res.json(team);
  } catch (error) {
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
