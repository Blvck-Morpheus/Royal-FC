import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../services/storage';
import { Tournament, InsertTournament } from '@shared/schema';

/**
 * Get all tournaments
 */
export async function getTournaments(req: Request, res: Response) {
  try {
    const tournaments = await storage.getTournaments();
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tournaments" });
  }
}

/**
 * Get tournament by ID
 */
export async function getTournamentById(req: Request, res: Response) {
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
}

/**
 * Create a new tournament
 */
export async function createTournament(req: Request, res: Response) {
  try {
    const schema = z.object({
      name: z.string().min(1),
      status: z.enum(["active", "completed"]).default("active"),
      startDate: z.string().transform(str => new Date(str)),
      endDate: z.string().transform(str => new Date(str)),
      description: z.string().optional(),
      format: z.enum(["5-a-side", "7-a-side", "11-a-side"])
    }).refine(data => {
      return new Date(data.startDate) <= new Date(data.endDate);
    }, {
      message: "End date must be after start date",
      path: ["endDate"]
    });
    
    const validatedData = schema.parse(req.body) as InsertTournament;
    const tournament = await storage.createTournament(validatedData);
    
    res.status(201).json(tournament);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    res.status(500).json({ message: "Error creating tournament" });
  }
}

/**
 * Update a tournament
 */
export async function updateTournament(req: Request, res: Response) {
  try {
    const tournamentId = parseInt(req.params.id);
    const tournament = await storage.getTournament(tournamentId);
    
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }
    
    const schema = z.object({
      name: z.string().min(1).optional(),
      status: z.enum(["active", "completed"]).optional(),
      startDate: z.string().transform(str => new Date(str)).optional(),
      endDate: z.string().transform(str => new Date(str)).optional(),
      description: z.string().optional(),
      format: z.enum(["5-a-side", "7-a-side", "11-a-side"]).optional()
    });
    
    const validatedData = schema.parse(req.body) as Partial<Tournament>;
    
    // Check if both dates are provided and validate their relationship
    if (validatedData.startDate && validatedData.endDate) {
      if (new Date(validatedData.startDate) > new Date(validatedData.endDate)) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: [{ path: ["endDate"], message: "End date must be after start date" }] 
        });
      }
    }
    
    const updatedTournament = await storage.updateTournament(tournamentId, validatedData);
    
    res.json(updatedTournament);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    res.status(500).json({ message: "Error updating tournament" });
  }
}

/**
 * Delete a tournament
 */
export async function deleteTournament(req: Request, res: Response) {
  try {
    const tournamentId = parseInt(req.params.id);
    const tournament = await storage.getTournament(tournamentId);
    
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }
    
    await storage.deleteTournament(tournamentId);
    
    res.json({ message: "Tournament deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting tournament" });
  }
}

/**
 * Get active tournaments
 */
export async function getActiveTournaments(req: Request, res: Response) {
  try {
    const tournaments = await storage.getActiveTournaments();
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching active tournaments" });
  }
}

/**
 * Get past tournaments
 */
export async function getPastTournaments(req: Request, res: Response) {
  try {
    const tournaments = await storage.getPastTournaments();
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching past tournaments" });
  }
}
