import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../services/storage';
import { adminSession } from '../middleware/auth';
import config from '../config';

/**
 * Login
 */
export async function login(req: Request, res: Response) {
  try {
    const schema = z.object({
      username: z.string().min(1),
      password: z.string().min(1)
    });
    
    const validatedData = schema.parse(req.body);
    
    // In a real app, we would get the user from the database
    // For now, we'll use the admin credentials from config
    if (validatedData.username !== config.adminUsername || validatedData.password !== config.adminPassword) {
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
}

/**
 * Check authentication status
 */
export function checkAuth(req: Request, res: Response) {
  if (adminSession.authenticated) {
    // In a real app, we'd get the user from the session
    res.json({ authenticated: true, role: "admin" });
  } else {
    res.json({ authenticated: false });
  }
}

/**
 * Logout
 */
export function logout(req: Request, res: Response) {
  adminSession.authenticated = false;
  res.json({ message: "Logged out successfully" });
}
