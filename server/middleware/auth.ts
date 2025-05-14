import { Request, Response, NextFunction } from 'express';
import { User } from '@shared/schema';

// Simple in-memory session storage for admin authentication
// In a real app, this would be replaced with a proper session store
export let adminSession: { 
  authenticated: boolean;
  user?: User;
} = { 
  authenticated: false 
};

/**
 * Middleware to require authentication for protected routes
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!adminSession.authenticated || !adminSession.user) {
    return res.status(401).json({ message: "Unauthorized. Admin access required." });
  }
  next();
}

/**
 * Middleware to require admin role for protected routes
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!adminSession.authenticated || !adminSession.user) {
    return res.status(401).json({ message: "Unauthorized. Admin access required." });
  }
  
  if (adminSession.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden. Admin role required." });
  }
  
  next();
}

/**
 * Reset the admin session (for testing and development)
 */
export function resetAdminSession() {
  adminSession = { authenticated: false };
}
