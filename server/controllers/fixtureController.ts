import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../services/storage';
import { Fixture, InsertFixture } from '@shared/schema';

/**
 * Get all fixtures
 */
export async function getFixtures(req: Request, res: Response) {
  try {
    const fixtures = await storage.getFixtures();
    res.json(fixtures);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fixtures" });
  }
}

/**
 * Get fixture by ID
 */
export async function getFixtureById(req: Request, res: Response) {
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
}

/**
 * Get fixtures by tournament
 */
export async function getFixturesByTournament(req: Request, res: Response) {
  try {
    const tournamentId = parseInt(req.params.tournamentId);
    const fixtures = await storage.getFixturesByTournament(tournamentId);
    res.json(fixtures);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fixtures" });
  }
}

/**
 * Get upcoming fixtures
 */
export async function getUpcomingFixtures(req: Request, res: Response) {
  try {
    const fixtures = await storage.getUpcomingFixtures();
    res.json(fixtures);
  } catch (error) {
    res.status(500).json({ message: "Error fetching upcoming fixtures" });
  }
}

/**
 * Get active fixtures
 */
export async function getActiveFixtures(req: Request, res: Response) {
  try {
    const fixtures = await storage.getActiveFixtures();
    res.json(fixtures);
  } catch (error) {
    res.status(500).json({ message: "Error fetching active fixtures" });
  }
}

/**
 * Create a new fixture
 */
export async function createFixture(req: Request, res: Response) {
  try {
    const schema = z.object({
      tournamentId: z.number().int().positive(),
      homeTeamId: z.number().int().positive(),
      awayTeamId: z.number().int().positive(),
      homeTeamName: z.string().min(1),
      awayTeamName: z.string().min(1),
      homeTeamCaptain: z.string().optional(),
      awayTeamCaptain: z.string().optional(),
      date: z.string().transform(str => new Date(str)),
      location: z.string().min(1),
      status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled"),
      tournamentName: z.string().optional()
    }).refine(data => {
      return data.homeTeamId !== data.awayTeamId;
    }, {
      message: "Home team and away team must be different",
      path: ["awayTeamId"]
    });
    
    const validatedData = schema.parse(req.body) as InsertFixture;
    
    // Check if tournament exists
    const tournament = await storage.getTournament(validatedData.tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }
    
    // Check if teams exist
    const homeTeam = await storage.getTournamentTeam(validatedData.homeTeamId);
    if (!homeTeam) {
      return res.status(404).json({ message: "Home team not found" });
    }
    
    const awayTeam = await storage.getTournamentTeam(validatedData.awayTeamId);
    if (!awayTeam) {
      return res.status(404).json({ message: "Away team not found" });
    }
    
    // Set tournament name if not provided
    if (!validatedData.tournamentName) {
      validatedData.tournamentName = tournament.name;
    }
    
    const fixture = await storage.createFixture(validatedData);
    
    res.status(201).json(fixture);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    res.status(500).json({ message: "Error creating fixture" });
  }
}

/**
 * Update a fixture
 */
export async function updateFixture(req: Request, res: Response) {
  try {
    const fixtureId = parseInt(req.params.id);
    const fixture = await storage.getFixture(fixtureId);
    
    if (!fixture) {
      return res.status(404).json({ message: "Fixture not found" });
    }
    
    const schema = z.object({
      homeTeamScore: z.number().int().min(0).optional(),
      awayTeamScore: z.number().int().min(0).optional(),
      date: z.string().transform(str => new Date(str)).optional(),
      location: z.string().min(1).optional(),
      status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
      homeTeamCaptain: z.string().optional(),
      awayTeamCaptain: z.string().optional()
    });
    
    const validatedData = schema.parse(req.body) as Partial<Fixture>;
    const updatedFixture = await storage.updateFixture(fixtureId, validatedData);
    
    res.json(updatedFixture);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    res.status(500).json({ message: "Error updating fixture" });
  }
}
