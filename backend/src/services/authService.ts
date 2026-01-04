import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthResult, User, JWTPayload } from '../types/auth';

const prisma = new PrismaClient();

export class AuthService {
  private readonly JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';
  private readonly JWT_REFRESH_SECRET = process.env['JWT_REFRESH_SECRET'] || 'your-refresh-secret-key';
  private readonly JWT_RESET_SECRET = process.env['JWT_RESET_SECRET'] || 'your-reset-secret-key';
  private readonly ACCESS_TOKEN_EXPIRES_IN = '15m';
  private readonly REFRESH_TOKEN_EXPIRES_IN = '7d';
  private readonly RESET_TOKEN_EXPIRES_IN = '1h';

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateAccessToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'access'
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
      issuer: 'derji-productions',
      audience: 'derji-productions-client'
    });
  }

  generateRefreshToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh'
    };

    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'derji-productions',
      audience: 'derji-productions-client'
    });
  }

  generateResetToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'reset'
    };

    return jwt.sign(payload, this.JWT_RESET_SECRET, {
      expiresIn: this.RESET_TOKEN_EXPIRES_IN,
      issuer: 'derji-productions',
      audience: 'derji-productions-client'
    });
  }

  verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'derji-productions',
        audience: 'derji-productions-client'
      }) as JWTPayload;

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_REFRESH_SECRET, {
        issuer: 'derji-productions',
        audience: 'derji-productions-client'
      }) as JWTPayload;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  verifyResetToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_RESET_SECRET, {
        issuer: 'derji-productions',
        audience: 'derji-productions-client'
      }) as JWTPayload;

      if (decoded.type !== 'reset') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid reset token');
    }
  }

  async register(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const dbUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        role: 'admin' // Default role
      }
    });

    const user: User = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt
    };

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 // 15 minutes in seconds
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    // Find user
    const dbUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!dbUser) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await this.comparePassword(password, dbUser.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const user: User = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt
    };

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 // 15 minutes in seconds
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    // Verify refresh token
    const decoded = this.verifyRefreshToken(refreshToken);

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!dbUser) {
      throw new Error('User not found');
    }

    const user: User = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt
    };

    // Generate new tokens
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

    return {
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60 // 15 minutes in seconds
    };
  }

  async forgotPassword(email: string): Promise<string> {
    // Find user
    const dbUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!dbUser) {
      // Don't reveal if user exists or not for security
      throw new Error('If a user with this email exists, a password reset link has been sent');
    }

    const user: User = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt
    };

    // Generate reset token
    const resetToken = this.generateResetToken(user);

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Verify reset token
    const decoded = this.verifyResetToken(token);

    // Hash new password
    const passwordHash = await this.hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash }
    });
  }

  async getUserById(userId: string): Promise<User | null> {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!dbUser) {
      return null;
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt
    };
  }
}

export const authService = new AuthService();