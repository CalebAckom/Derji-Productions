import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Store for tracking rate limit violations
const violationStore = new Map<string, { count: number; lastViolation: Date }>();

// Custom rate limit message handler
const rateLimitMessage = (req: Request, res: Response) => {
  const clientId = req.ip || 'unknown';
  const violation = violationStore.get(clientId) || { count: 0, lastViolation: new Date() };
  
  violation.count += 1;
  violation.lastViolation = new Date();
  violationStore.set(clientId, violation);

  return res.status(429).json({
    error: {
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      status: 429,
      timestamp: new Date().toISOString(),
      retryAfter: res.getHeader('Retry-After'),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
};

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit in development
  message: rateLimitMessage,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: Request) => {
    // Use IP address as key, but could be enhanced with user ID for authenticated requests
    return req.ip || 'unknown';
  },
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: rateLimitMessage,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// File upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 uploads per hour
  message: rateLimitMessage,
  standardHeaders: true,
  legacyHeaders: false,
});

// Contact form rate limiter
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 contact form submissions per hour
  message: rateLimitMessage,
  standardHeaders: true,
  legacyHeaders: false,
});

// Booking rate limiter
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 booking attempts per hour
  message: rateLimitMessage,
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin operations rate limiter (more lenient for authenticated admin users)
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // higher limit for admin operations
  message: rateLimitMessage,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise IP
    const user = (req as any).user;
    return user?.id || req.ip || 'unknown';
  },
});

// Progressive rate limiting - increases restrictions for repeat offenders
export const progressiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req: Request) => {
    const clientId = req.ip || 'unknown';
    const violation = violationStore.get(clientId);
    
    if (!violation) return 100; // Default limit
    
    // Reduce limit based on violation history
    const baseLimit = 100;
    const reductionFactor = Math.min(violation.count * 0.1, 0.8); // Max 80% reduction
    return Math.floor(baseLimit * (1 - reductionFactor));
  },
  message: rateLimitMessage,
  standardHeaders: true,
  legacyHeaders: false,
});

// Clean up old violation records periodically
setInterval(() => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  for (const [clientId, violation] of violationStore.entries()) {
    if (violation.lastViolation < oneHourAgo) {
      violationStore.delete(clientId);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour

export { violationStore };