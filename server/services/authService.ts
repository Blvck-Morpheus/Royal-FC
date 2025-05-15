import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@shared/schema';
import { storage } from './storage-impl';

// Secret key for JWT - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'royal-fc-jwt-secret-key';
const JWT_EXPIRES_IN = '24h'; // Token expiration time

/**
 * Authentication service
 */
export class AuthService {
  /**
   * Register a new user
   * @param username Username
   * @param password Password (will be hashed)
   * @param role User role
   * @returns Created user
   */
  async registerUser(username: string, password: string, role: 'admin' | 'exco' = 'exco'): Promise<User> {
    // Check if user already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await storage.createUser({
      username,
      password: hashedPassword,
      role
    });

    return user;
  }

  /**
   * Login a user
   * @param username Username
   * @param password Password
   * @returns User data and token
   */
  async loginUser(username: string, password: string): Promise<{ user: User; token: string }> {
    // Get user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if password is already hashed (for backward compatibility)
    const isPasswordHashed = user.password.length > 20;

    // Compare passwords
    let isMatch: boolean;
    if (isPasswordHashed) {
      // If password is hashed, use bcrypt.compare
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // For backward compatibility, compare plaintext passwords
      isMatch = password === user.password;

      // If match, update to hashed password for future logins
      if (isMatch) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await storage.updateUser(user.id, { password: hashedPassword });
      }
    }

    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Create token
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Verify a JWT token
   * @param token JWT token
   * @returns Decoded user data
   */
  verifyToken(token: string): { id: number; username: string; role: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string };
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Generate a JWT token for a user
   * @param user User data
   * @returns JWT token
   */
  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Ensure admin user exists
   * Creates a default admin user if none exists
   */
  async ensureAdminExists(): Promise<void> {
    const adminUser = await storage.getUserByUsername('admin');
    
    if (!adminUser) {
      console.log('Creating default admin user');
      await this.registerUser('admin', 'password123', 'admin');
      console.log('Default admin user created');
    } else {
      console.log('Admin user already exists');
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
