import { AuthService } from './authService';

describe('AuthService - Basic Tests', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'TestPassword123';
      const hashedPassword = await authService.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'TestPassword123';
      const hashedPassword = await authService.hashPassword(password);
      
      const isValid = await authService.comparePassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'TestPassword123';
      const wrongPassword = 'WrongPassword123';
      const hashedPassword = await authService.hashPassword(password);
      
      const isValid = await authService.comparePassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('generateAccessToken', () => {
    it('should generate valid access token', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = authService.generateAccessToken(user);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = authService.generateAccessToken(user);
      const decoded = authService.verifyAccessToken(token);

      expect(decoded.userId).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
      expect(decoded.type).toBe('access');
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        authService.verifyAccessToken(invalidToken);
      }).toThrow('Invalid access token');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate valid refresh token', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = authService.generateRefreshToken(user);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = authService.generateRefreshToken(user);
      const decoded = authService.verifyRefreshToken(token);

      expect(decoded.userId).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
      expect(decoded.type).toBe('refresh');
    });

    it('should throw error for invalid refresh token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        authService.verifyRefreshToken(invalidToken);
      }).toThrow('Invalid refresh token');
    });
  });

  describe('generateResetToken', () => {
    it('should generate valid reset token', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = authService.generateResetToken(user);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyResetToken', () => {
    it('should verify valid reset token', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = authService.generateResetToken(user);
      const decoded = authService.verifyResetToken(token);

      expect(decoded.userId).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
      expect(decoded.type).toBe('reset');
    });

    it('should throw error for invalid reset token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        authService.verifyResetToken(invalidToken);
      }).toThrow('Invalid reset token');
    });
  });
});