import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import logger from '../config/logger';

// Rate limiter for contact form submissions
const contactFormLimiter = new RateLimiterMemory({
  keyPrefix: 'contact_form',
  points: 3, // Number of requests
  duration: 300, // Per 5 minutes (300 seconds)
  blockDuration: 900, // Block for 15 minutes if limit exceeded
});

// Rate limiter for general contact endpoint access
const contactEndpointLimiter = new RateLimiterMemory({
  keyPrefix: 'contact_endpoint',
  points: 10, // Number of requests
  duration: 60, // Per 1 minute
  blockDuration: 300, // Block for 5 minutes if limit exceeded
});

// Spam detection patterns
const SPAM_PATTERNS = [
  // Common spam keywords
  /\b(viagra|cialis|casino|lottery|winner|congratulations|urgent|act now|limited time)\b/i,
  // Excessive links
  /(https?:\/\/[^\s]+.*){3,}/i,
  // Excessive capitalization
  /[A-Z]{10,}/,
  // Repeated characters
  /(.)\1{5,}/,
  // Common spam phrases
  /\b(make money|work from home|guaranteed income|no experience required)\b/i,
  // Suspicious email patterns
  /\b[a-z0-9]{20,}@[a-z0-9]+\.[a-z]{2,}\b/i,
];

// Honeypot field names (should be empty if legitimate)
const HONEYPOT_FIELDS = ['website', 'url', 'homepage', 'company_website'];

interface SpamCheckResult {
  isSpam: boolean;
  reasons: string[];
  score: number;
}

/**
 * Analyzes content for spam indicators
 */
function analyzeSpamContent(content: string): SpamCheckResult {
  const reasons: string[] = [];
  let score = 0;

  // Check against spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      reasons.push('Contains suspicious keywords or patterns');
      score += 2;
      break; // Don't add multiple points for multiple pattern matches
    }
  }

  // Check for excessive length (potential spam)
  if (content.length > 5000) {
    reasons.push('Message is excessively long');
    score += 1;
  }

  // Check for minimal content (potential spam)
  if (content.trim().length < 10) {
    reasons.push('Message is too short');
    score += 1;
  }

  // Check for excessive repetition
  const words = content.toLowerCase().split(/\s+/);
  const wordCount = new Map<string, number>();
  
  for (const word of words) {
    if (word.length > 3) { // Only count meaningful words
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
  }

  const maxRepeats = Math.max(...Array.from(wordCount.values()));
  if (maxRepeats > 5) {
    reasons.push('Contains excessive word repetition');
    score += 1;
  }

  return {
    isSpam: score >= 3,
    reasons,
    score,
  };
}

/**
 * Rate limiting middleware for contact form submissions
 */
export const contactFormRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = req.ip || 'unknown';
    await contactFormLimiter.consume(key);
    next();
  } catch (rateLimiterRes: any) {
    const remainingTime = Math.round(rateLimiterRes.msBeforeNext / 1000);
    
    logger.warn('Contact form rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      remainingTime,
      service: 'SpamProtection',
    });

    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many contact form submissions. Please try again later.',
        retryAfter: remainingTime,
      },
    });
  }
};

/**
 * Rate limiting middleware for contact endpoint access
 */
export const contactEndpointRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = req.ip || 'unknown';
    await contactEndpointLimiter.consume(key);
    next();
  } catch (rateLimiterRes: any) {
    const remainingTime = Math.round(rateLimiterRes.msBeforeNext / 1000);
    
    logger.warn('Contact endpoint rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      remainingTime,
      service: 'SpamProtection',
    });

    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter: remainingTime,
      },
    });
  }
};

/**
 * Spam detection middleware for contact form submissions
 */
export const spamDetection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { name, email, message, subject } = req.body;

    // Check honeypot fields
    for (const field of HONEYPOT_FIELDS) {
      if (req.body[field] && req.body[field].trim() !== '') {
        logger.warn('Honeypot field detected - potential spam', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          field,
          value: req.body[field],
          service: 'SpamProtection',
        });

        // Return success to avoid revealing spam detection
        res.status(200).json({
          success: true,
          message: 'Thank you for your message. We will get back to you soon.',
        });
        return;
      }
    }

    // Analyze message content for spam
    const fullContent = `${name} ${email} ${subject || ''} ${message}`.toLowerCase();
    const spamAnalysis = analyzeSpamContent(fullContent);

    if (spamAnalysis.isSpam) {
      logger.warn('Spam detected in contact form submission', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        email,
        spamScore: spamAnalysis.score,
        spamReasons: spamAnalysis.reasons,
        service: 'SpamProtection',
      });

      // Return success to avoid revealing spam detection
      res.status(200).json({
        success: true,
        message: 'Thank you for your message. We will get back to you soon.',
      });
      return;
    }

    // Log potential spam (score >= 2 but < 3)
    if (spamAnalysis.score >= 2) {
      logger.info('Potential spam detected but allowed', {
        ip: req.ip,
        email,
        spamScore: spamAnalysis.score,
        spamReasons: spamAnalysis.reasons,
        service: 'SpamProtection',
      });
    }

    next();
  } catch (error) {
    logger.error('Error in spam detection middleware', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
      service: 'SpamProtection',
    });

    // Continue processing on error to avoid blocking legitimate requests
    next();
  }
};

/**
 * Middleware to add honeypot fields to response (for frontend forms)
 */
export const addHoneypotInfo = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Add honeypot field names to response headers for frontend to use
  res.set('X-Honeypot-Fields', HONEYPOT_FIELDS.join(','));
  next();
};