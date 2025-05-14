import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../services/storage';

/**
 * Record match result
 */
export async function recordMatchResult(req: Request, res: Response) {
  try {
    const schema = z.object({
      fixtureId: z.string().min(1),
      homeTeamScore: z.number().int().min(0),
      awayTeamScore: z.number().int().min(0),
      scorers: z.array(
        z.object({
          playerId: z.string().min(1),
          goals: z.number().int().min(1)
        })
      ).optional()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Convert fixtureId to number
    const fixtureId = parseInt(validatedData.fixtureId);
    
    // Check if fixture exists
    const fixture = await storage.getFixture(fixtureId);
    if (!fixture) {
      return res.status(404).json({ message: "Fixture not found" });
    }
    
    // Check if fixture is already completed
    if (fixture.status === "completed") {
      return res.status(400).json({ message: "Fixture is already completed" });
    }
    
    // Record match result
    const success = await storage.recordMatchResult({
      ...validatedData,
      fixtureId
    });
    
    if (!success) {
      return res.status(500).json({ message: "Failed to record match result" });
    }
    
    res.json({ message: "Match result recorded successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    res.status(500).json({ message: "Error recording match result" });
  }
}

/**
 * Generate teams
 */
export async function generateTeams(req: Request, res: Response) {
  try {
    const schema = z.object({
      format: z.enum(["5-a-side", "7-a-side", "11-a-side"]),
      playerIds: z.array(z.number().int().positive()),
      balanceMethod: z.enum(["skill", "position", "mixed"]).default("mixed"),
      teamsCount: z.number().int().min(2).max(4).default(2),
      considerHistory: z.boolean().default(true),
      competitionMode: z.boolean().default(true)
    });
    
    const validatedData = schema.parse(req.body);
    
    // Check if we have enough players for the selected format
    const minPlayers = getMinimumPlayers(validatedData.format, validatedData.teamsCount);
    if (validatedData.playerIds.length < minPlayers) {
      return res.status(400).json({ 
        message: `Not enough players. You need at least ${minPlayers} players for ${validatedData.format} with ${validatedData.teamsCount} teams.` 
      });
    }
    
    // Generate teams
    const teams = await storage.generateTeams(validatedData);
    
    res.json(teams);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    res.status(500).json({ message: "Error generating teams" });
  }
}

/**
 * Get minimum number of players needed for a specific format and team count
 */
function getMinimumPlayers(format: string, teamsCount: number): number {
  let playersPerTeam = 5; // Default for 5-a-side
  
  switch (format) {
    case "5-a-side":
      playersPerTeam = 5;
      break;
    case "7-a-side":
      playersPerTeam = 7;
      break;
    case "11-a-side":
      playersPerTeam = 11;
      break;
  }
  
  return playersPerTeam * teamsCount;
}
