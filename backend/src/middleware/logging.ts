import morgan from 'morgan';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger, { 
  httpLogger, 
  performanceLogger as perfLoggerInstance,
  withRequestContext,
  logSecurityEvent
} from '../config/logger';

// Add request ID to all requests
export const requestId = (req: Request, res: Response, next: Function): void => {
  const reqId = (req.headers['x-request-id'] as string) || uuidv4();
  req.headers['x-request-id'] = reqId;
  res.setHeader('X-Request-ID', reqId);
  
  // Add request context to logger
  (req as any).logger = withRequestContext(reqId);
  
  next();
};

// Custom morgan token for request ID
morgan.token('id', (req: Request) => req.headers['x-request-id'] as string);

// Custom morgan token for user ID (if authenticated)
morgan.token('user', (req: Request) => {
  const user = (req as any).user;
  return user ? user.id : 'anonymous';
});

// Custom morgan token for response time in milliseconds
morgan.token('response-time-ms', (req: Request, _res: Response) => {
  const startTime = (req as any).startTime;
  if (!startTime) return '0';
  return `${Date.now() - startTime}ms`;
});

// Custom morgan stream to integrate with Winston
const morganStream = {
  write: (message: string) => {
    httpLogger.http(message.trim());
  },
};

// Development logging format
export const devLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms [:id] [:user]',
  {
    stream: morganStream,
    skip: (req: Request) => {
      // Skip logging for health checks in development
      return req.path === '/health';
    },
  }
);

// Production logging format (more detailed)
export const prodLogger = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms [:id] [:user]',
  {
    stream: morganStream,
    skip: (req: Request) => {
      // Skip logging for health checks in production
      return req.path === '/health';
    },
  }
);

// Security logging for sensitive operations
export const securityLogger = (action: string, details?: any) => {
  return (req: Request, _res: Response, next: Function): void => {
    const user = (req as any).user;
    const requestId = req.headers['x-request-id'] as string;
    
    logSecurityEvent(action, 'medium', {
      requestId,
      userId: user?.id || 'anonymous',
      userEmail: user?.email || 'anonymous',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.originalUrl,
      details: details || {},
    });
    
    next();
  };
};

// Error logging
export const errorLogger = (err: Error, req: Request, _res: Response, next: Function): void => {
  const user = (req as any).user;
  const requestId = req.headers['x-request-id'] as string;
  const reqLogger = (req as any).logger || withRequestContext(requestId, user?.id);
  
  reqLogger.error('Request error occurred', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
    },
    user: user ? {
      id: user.id,
      email: user.email,
      role: user.role,
    } : null,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  
  next(err);
};

// Performance monitoring
export const performanceLogger = (req: Request, _res: Response, next: Function): void => {
  const startTime = Date.now();
  (req as any).startTime = startTime;

  // Log slow requests
  _res.on('finish', () => {
    const duration = Date.now() - startTime;
    const user = (req as any).user;
    const requestId = req.headers['x-request-id'] as string;
    
    if (duration > 1000) { // Log requests taking more than 1 second
      perfLoggerInstance.warn(`Slow operation detected: HTTP Request`, {
        requestId,
        method: req.method,
        url: req.originalUrl,
        status: _res.statusCode,
        userId: user?.id || 'anonymous',
        ip: req.ip,
        duration: `${duration}ms`,
        operation: 'HTTP Request',
        slow: true,
      });
    }
  });

  next();
};

// API usage analytics
export const analyticsLogger = (req: Request, _res: Response, next: Function): void => {
  _res.on('finish', () => {
    const user = (req as any).user;
    const requestId = req.headers['x-request-id'] as string;
    const duration = Date.now() - ((req as any).startTime || Date.now());
    
    httpLogger.info('API Request Analytics', {
      requestId,
      endpoint: `${req.method} ${req.route?.path || req.path}`,
      status: _res.statusCode,
      responseTime: `${duration}ms`,
      userId: user?.id || null,
      userRole: user?.role || null,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
    });
  });

  next();
};

// Health check for logging system
export const loggingHealthCheck = (): { status: string; timestamp: string } => {
  try {
    logger.info('Logging middleware health check');
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'ERROR',
      timestamp: new Date().toISOString(),
    };
  }
};