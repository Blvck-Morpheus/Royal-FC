import bcrypt from 'bcryptjs';
import { Request } from 'express';
import { User, InsertUser } from '@shared/schema';
import { storage } from './storage-impl';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare a password with its hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Authenticate a user with username and password
   */
  static async authenticateUser(username: string, password: string): Promise<User | null> {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return null;
      }

      const isValidPassword = await this.comparePassword(password, user.password);
      if (!isValidPassword) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  /**
   * Create a new user with hashed password
   */
  static async createUser(username: string, password: string, role: 'admin' | 'exco' = 'exco'): Promise<User> {
    const hashedPassword = await this.hashPassword(password);
    return storage.createUser({
      username,
      password: hashedPassword,
      role
    });
  }

  /**
   * Set user session
   */
  static setUserSession(req: Request, user: User): void {
    (req.session as any).user = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    (req.session as any).authenticated = true;
  }

  /**
   * Get user from session
   */
  static getUserFromSession(req: Request): User | null {
    const sessionUser = (req.session as any).user;
    if (!sessionUser || !(req.session as any).authenticated) {
      return null;
    }
    return sessionUser;
  }

  /**
   * Clear user session
   */
  static clearUserSession(req: Request): void {
    (req.session as any).user = null;
    (req.session as any).authenticated = false;
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
    });
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(req: Request): boolean {
    return !!(req.session as any).authenticated && !!(req.session as any).user;
  }

  /**
   * Check if user has admin role
   */
  static isAdmin(req: Request): boolean {
    const user = this.getUserFromSession(req);
    return user?.role === 'admin';
  }

  /**
   * Check if user has exco role
   */
  static isExco(req: Request): boolean {
    const user = this.getUserFromSession(req);
    return user?.role === 'exco' || user?.role === 'admin';
  }

  /**
   * Initialize default admin user if none exists
   */
  static async initializeDefaultAdmin(): Promise<void> {
    try {
      const existingAdmin = await storage.getUserByUsername('admin');
      if (!existingAdmin) {
        const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
        const adminUser = await this.createUser('admin', defaultPassword, 'admin');
        console.log('Default admin user created:', { 
          username: adminUser.username, 
          role: adminUser.role,
          id: adminUser.id 
        });
      } else {
        console.log('Admin user already exists:', existingAdmin.username);
      }

      // Also create a default exco user if none exists
      const existingExco = await storage.getUserByUsername('exco');
      if (!existingExco) {
        const excoPassword = process.env.DEFAULT_EXCO_PASSWORD || 'exco123';
        const excoUser = await this.createUser('exco', excoPassword, 'exco');
        console.log('Default exco user created:', { 
          username: excoUser.username, 
          role: excoUser.role,
          id: excoUser.id 
        });
      }
    } catch (error) {
      console.error('Error creating default admin:', error);
    }
  }
}