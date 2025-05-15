import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: string;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token from cookies and sets req.user
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = authService.verifyToken(token);
    
    // Set user in request
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

/**
 * Admin role middleware
 * Requires user to be authenticated and have admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  
  next();
};

/**
 * Exco role middleware
 * Requires user to be authenticated and have admin or exco role
 */
export const requireExco = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'exco') {
    return res.status(403).json({ message: 'Access denied. Exco role required.' });
  }
  
  next();
};
