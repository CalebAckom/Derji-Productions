import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService';
import { AuthenticatedRequest } from '../types/auth';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
});

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);

      const result = await authService.register(
        validatedData.email,
        validatedData.password,
        validatedData.firstName,
        validatedData.lastName
      );

      res.status(201).json({
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid input data',
          details: error.errors
        });
        return;
      }

      if (error instanceof Error) {
        if (error.message === 'User already exists with this email') {
          res.status(409).json({
            error: 'Conflict',
            message: error.message
          });
          return;
        }
      }

      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to register user'
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);

      const result = await authService.login(
        validatedData.email,
        validatedData.password
      );

      res.status(200).json({
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid input data',
          details: error.errors
        });
        return;
      }

      if (error instanceof Error) {
        if (error.message === 'Invalid email or password') {
          res.status(401).json({
            error: 'Authentication failed',
            message: error.message
          });
          return;
        }
      }

      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to login'
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = refreshTokenSchema.parse(req.body);

      const result = await authService.refreshToken(validatedData.refreshToken);

      res.status(200).json({
        message: 'Token refreshed successfully',
        data: result
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid input data',
          details: error.errors
        });
        return;
      }

      if (error instanceof Error) {
        if (error.message.includes('Invalid refresh token') || error.message === 'User not found') {
          res.status(401).json({
            error: 'Authentication failed',
            message: 'Invalid or expired refresh token'
          });
          return;
        }
      }

      console.error('Token refresh error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to refresh token'
      });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);

      const resetToken = await authService.forgotPassword(validatedData.email);

      // In a real application, you would send this token via email
      // For now, we'll return it in the response (NOT recommended for production)
      res.status(200).json({
        message: 'Password reset token generated',
        // TODO: Remove this in production - send via email instead
        resetToken: process.env['NODE_ENV'] === 'development' ? resetToken : undefined
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid input data',
          details: error.errors
        });
        return;
      }

      // Always return success message for security (don't reveal if email exists)
      res.status(200).json({
        message: 'If a user with this email exists, a password reset link has been sent'
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);

      await authService.resetPassword(
        validatedData.token,
        validatedData.newPassword
      );

      res.status(200).json({
        message: 'Password reset successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid input data',
          details: error.errors
        });
        return;
      }

      if (error instanceof Error) {
        if (error.message.includes('Invalid reset token')) {
          res.status(401).json({
            error: 'Authentication failed',
            message: 'Invalid or expired reset token'
          });
          return;
        }
      }

      console.error('Password reset error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to reset password'
      });
    }
  }

  async logout(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // In a stateless JWT system, logout is handled client-side by removing the token
      // For enhanced security, you could maintain a blacklist of tokens
      res.status(200).json({
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to logout'
      });
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Please authenticate first'
        });
        return;
      }

      res.status(200).json({
        message: 'Profile retrieved successfully',
        data: {
          user: req.user
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get profile'
      });
    }
  }
}

export const authController = new AuthController();