import cors from 'cors';
import { Request } from 'express';

// Define allowed origins based on environment
const getAllowedOrigins = (): string[] => {
  const origins: string[] = [];
  
  // Always allow localhost in development
  if (process.env['NODE_ENV'] !== 'production') {
    origins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173', // Vite default port
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173'
    );
  }

  // Add production frontend URL
  if (process.env['FRONTEND_URL']) {
    origins.push(process.env['FRONTEND_URL']);
  }

  // Add additional allowed origins from environment
  if (process.env['ALLOWED_ORIGINS']) {
    const additionalOrigins = process.env['ALLOWED_ORIGINS'].split(',').map(origin => origin.trim());
    origins.push(...additionalOrigins);
  }

  // Default production domains
  if (process.env['NODE_ENV'] === 'production') {
    origins.push(
      'https://derji-productions.vercel.app',
      'https://derji-productions.com',
      'https://www.derji-productions.com'
    );
  }

  return origins;
};

// CORS configuration
export const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Log unauthorized origin attempts
    console.warn('CORS: Blocked request from unauthorized origin:', origin);
    return callback(new Error('Not allowed by CORS'), false);
  },
  
  credentials: true, // Allow cookies and authorization headers
  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
    'X-API-Key',
    'Cache-Control',
    'Pragma',
  ],
  
  exposedHeaders: [
    'X-Request-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'Retry-After',
  ],
  
  maxAge: 86400, // 24 hours - how long browsers can cache preflight responses
  
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

// Create CORS middleware
export const corsMiddleware = cors(corsOptions);

// Preflight handler for complex requests
export const preflightHandler = (req: Request, res: any, next: Function): void => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', Array.isArray(corsOptions.allowedHeaders) ? corsOptions.allowedHeaders.join(',') : corsOptions.allowedHeaders);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }
  next();
};

// Security headers middleware
export const securityHeaders = (req: Request, res: any, next: Function): void => {
  // Prevent clickjacking
  res.header('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.header('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.header('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy (basic)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
  
  res.header('Content-Security-Policy', csp);
  
  // HSTS (only in production with HTTPS)
  if (process.env['NODE_ENV'] === 'production' && req.secure) {
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};