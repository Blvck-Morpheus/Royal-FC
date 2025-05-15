import express from 'express';
import { z } from 'zod';
import { authService } from '../services/authService';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (admin only)
 * @access  Admin
 */
router.post('/register', authenticate, requireAdmin, async (req, res) => {
  try {
    const schema = z.object({
      username: z.string().min(3, 'Username must be at least 3 characters'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      role: z.enum(['admin', 'exco']).default('exco')
    });

    const validatedData = schema.parse(req.body);
    
    // Only allow creating exco members through this interface
    if (validatedData.role === 'admin') {
      return res.status(400).json({ message: 'Cannot create additional admin users' });
    }

    const user = await authService.registerUser(
      validatedData.username,
      validatedData.password,
      validatedData.role
    );

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const schema = z.object({
      username: z.string().min(1, 'Username is required'),
      password: z.string().min(1, 'Password is required'),
      loginType: z.enum(['admin', 'exco']).optional()
    });

    const validatedData = schema.parse(req.body);

    const { user, token } = await authService.loginUser(
      validatedData.username,
      validatedData.password
    );

    // Check if user role matches requested login type
    if (validatedData.loginType && user.role !== validatedData.loginType) {
      return res.status(403).json({
        message: `You do not have ${validatedData.loginType} privileges. Your role is ${user.role}.`
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      message: 'Login successful',
      user: userWithoutPassword
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    
    if (error instanceof Error) {
      return res.status(401).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, (req, res) => {
  res.json({
    user: req.user,
    authenticated: true
  });
});

export default router;
