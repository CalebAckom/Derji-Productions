export interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh' | 'reset';
}

export interface AuthenticatedRequest extends Express.Request {
  user?: User;
}