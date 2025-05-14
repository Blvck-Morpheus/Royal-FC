import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../services/storage';
import { Player, InsertPlayer } from '@shared/schema';

/**
 * Get all players
 */
export async function getPlayers(req: Request, res: Response) {
  try {
    const players = await storage.getPlayers();
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: "Error fetching players" });
  }
}

/**
 * Get player by ID
 */
export async function getPlayerById(req: Request, res: Response) {
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
}

/**
 * Create a new player
 */
export async function createPlayer(req: Request, res: Response) {
  try {
    const schema = z.object({
      name: z.string().min(1),
      position: z.string().min(1),
      jerseyNumber: z.number().int().min(1),
      photoUrl: z.string().optional(),
      stats: z.object({
        goals: z.number().int().min(0).default(0),
        assists: z.number().int().min(0).default(0),
        cleanSheets: z.number().int().min(0).default(0),
        tackles: z.number().int().min(0).default(0),
        saves: z.number().int().min(0).default(0),
        gamesPlayed: z.number().int().min(0).default(0),
        skillRating: z.number().int().min(1).max(5).default(3)
      }).default({})
    });
    
    const validatedData = schema.parse(req.body) as InsertPlayer;
    const player = await storage.createPlayer(validatedData);
    
    res.status(201).json(player);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    res.status(500).json({ message: "Error creating player" });
  }
}

/**
 * Update a player
 */
export async function updatePlayer(req: Request, res: Response) {
  try {
    const playerId = parseInt(req.params.id);
    const player = await storage.getPlayer(playerId);
    
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    
    const schema = z.object({
      name: z.string().min(1).optional(),
      position: z.string().min(1).optional(),
      jerseyNumber: z.number().int().min(1).optional(),
      photoUrl: z.string().optional(),
      stats: z.object({
        goals: z.number().int().min(0).optional(),
        assists: z.number().int().min(0).optional(),
        cleanSheets: z.number().int().min(0).optional(),
        tackles: z.number().int().min(0).optional(),
        saves: z.number().int().min(0).optional(),
        gamesPlayed: z.number().int().min(0).optional(),
        skillRating: z.number().int().min(1).max(5).optional()
      }).optional(),
      badges: z.array(z.string()).optional()
    });
    
    const validatedData = schema.parse(req.body) as Partial<Player>;
    const updatedPlayer = await storage.updatePlayer(playerId, validatedData);
    
    res.json(updatedPlayer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    res.status(500).json({ message: "Error updating player" });
  }
}

/**
 * Delete a player
 */
export async function deletePlayer(req: Request, res: Response) {
  try {
    const playerId = parseInt(req.params.id);
    const player = await storage.getPlayer(playerId);
    
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    
    await storage.deletePlayer(playerId);
    
    res.json({ message: "Player deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting player" });
  }
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(req: Request, res: Response) {
  try {
    const category = req.query.category as string || "goals";
    const players = await storage.getLeaderboard(category);
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
}
