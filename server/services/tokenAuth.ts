import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';

export interface TokenPayload {
  id: number;
  username: string;
  role: 'admin' | 'exco';
  iat?: number;
  exp?: number;
}

export class TokenAuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'royal-fc-jwt-secret-change-in-production';
  private static readonly JWT_EXPIRES_IN = '24h';

  /**
   * Generate JWT token for user
   */
  static generateToken(user: User): string {
    const payload: TokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    });
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Get user from token in request headers
   */
  static getUserFromToken(authHeader: string | undefined): TokenPayload | null {
    const token = this.extractTokenFromHeader(authHeader);
    if (!token) return null;
    
    return this.verifyToken(token);
  }
}
