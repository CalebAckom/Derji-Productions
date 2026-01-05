import { Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AuthenticatedRequest } from '../types/auth';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid access token'
      });
      return;
    }

    // Verify token
    const decoded = authService.verifyAccessToken(token);

    // Get user from database
    const user = await authService.getUserById(decoded.userId);
    if (!user) {
      res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Invalid token',
      message: error instanceof Error ? error.message : 'Token verification failed'
    });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      _res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate first'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      _res.status(403).json({
        error: 'Insufficient permissions',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = authService.verifyAccessToken(token);
      const user = await authService.getUserById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't return an error, just continue without user
    next();
  }
};