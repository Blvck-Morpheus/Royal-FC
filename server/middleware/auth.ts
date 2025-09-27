import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthenticatedRequest } from '../services/authService';
import { TokenAuthService, TokenPayload } from '../services/tokenAuth';

/**
 * Middleware to require authentication for protected routes (supports both session and token)
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Try token-based auth first (for Vercel compatibility)
  const tokenUser = TokenAuthService.getUserFromToken(req.headers.authorization);
  if (tokenUser) {
    (req as AuthenticatedRequest).user = tokenUser as any;
    return next();
  }

  // Fallback to session-based auth
  if (!AuthService.isAuthenticated(req)) {
    return res.status(401).json({ message: "Unauthorized. Admin access required." });
  }
  
  // Add user to request object for convenience
  (req as AuthenticatedRequest).user = AuthService.getUserFromSession(req) || undefined;
  next();
}

/**
 * Middleware to require admin role for protected routes
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Try token-based auth first
  const tokenUser = TokenAuthService.getUserFromToken(req.headers.authorization);
  if (tokenUser) {
    if (tokenUser.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden. Admin role required." });
    }
    (req as AuthenticatedRequest).user = tokenUser as any;
    return next();
  }

  // Fallback to session-based auth
  if (!AuthService.isAuthenticated(req)) {
    return res.status(401).json({ message: "Unauthorized. Admin access required." });
  }
  
  if (!AuthService.isAdmin(req)) {
    return res.status(403).json({ message: "Forbidden. Admin role required." });
  }
  
  // Add user to request object for convenience
  (req as AuthenticatedRequest).user = AuthService.getUserFromSession(req) || undefined;
  next();
}

/**
 * Middleware to require exco role for protected routes
 */
export function requireExco(req: Request, res: Response, next: NextFunction) {
  // Try token-based auth first
  const tokenUser = TokenAuthService.getUserFromToken(req.headers.authorization);
  if (tokenUser) {
    if (tokenUser.role !== 'exco' && tokenUser.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden. Exco role required." });
    }
    (req as AuthenticatedRequest).user = tokenUser as any;
    return next();
  }

  // Fallback to session-based auth
  if (!AuthService.isAuthenticated(req)) {
    return res.status(401).json({ message: "Unauthorized. Admin access required." });
  }
  
  if (!AuthService.isExco(req)) {
    return res.status(403).json({ message: "Forbidden. Exco role required." });
  }
  
  // Add user to request object for convenience
  (req as AuthenticatedRequest).user = AuthService.getUserFromSession(req) || undefined;
  next();
}

/**
 * Optional authentication middleware - doesn't fail if not authenticated
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // Try token-based auth first
  const tokenUser = TokenAuthService.getUserFromToken(req.headers.authorization);
  if (tokenUser) {
    (req as AuthenticatedRequest).user = tokenUser as any;
    return next();
  }

  // Fallback to session-based auth
  if (AuthService.isAuthenticated(req)) {
    (req as AuthenticatedRequest).user = AuthService.getUserFromSession(req) || undefined;
  }
  next();
}
