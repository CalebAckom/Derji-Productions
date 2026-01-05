import morgan from 'morgan';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Add request ID to all requests
export const requestId = (req: Request, res: Response, next: Function): void => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.headers['x-request-id']);
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

// Development logging format
export const devLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms [:id] [:user]',
  {
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
    const logData = {
      timestamp: new Date().toISOString(),
      action,
      requestId: req.headers['x-request-id'],
      userId: user?.id || 'anonymous',
      userEmail: user?.email || 'anonymous',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.originalUrl,
      details: details || {},
    };

    console.log('SECURITY_LOG:', JSON.stringify(logData));
    next();
  };
};

// Error logging
export const errorLogger = (err: Error, req: Request, _res: Response, next: Function): void => {
  const user = (req as any).user;
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    request: {
      id: req.headers['x-request-id'],
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
  };

  console.error('ERROR_LOG:', JSON.stringify(errorLog, null, 2));
  next(err);
};

// Performance monitoring
export const performanceLogger = (req: Request, _res: Response, next: Function): void => {
  const startTime = Date.now();
  (req as any).startTime = startTime;

  // Log slow requests
  _res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (duration > 1000) { // Log requests taking more than 1 second
      const user = (req as any).user;
      console.warn('SLOW_REQUEST:', {
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
        requestId: req.headers['x-request-id'],
        method: req.method,
        url: req.originalUrl,
        status: _res.statusCode,
        userId: user?.id || 'anonymous',
        ip: req.ip,
      });
    }
  });

  next();
};

// API usage analytics
export const analyticsLogger = (req: Request, _res: Response, next: Function): void => {
  _res.on('finish', () => {
    const user = (req as any).user;
    const analyticsData = {
      timestamp: new Date().toISOString(),
      endpoint: `${req.method} ${req.route?.path || req.path}`,
      status: _res.statusCode,
      responseTime: Date.now() - ((req as any).startTime || Date.now()),
      userId: user?.id || null,
      userRole: user?.role || null,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
      requestId: req.headers['x-request-id'],
    };

    // In a real application, you might send this to an analytics service
    console.log('ANALYTICS:', JSON.stringify(analyticsData));
  });

  next();
};

// Health check for logging system
export const loggingHealthCheck = (): { status: string; timestamp: string } => {
  return {
    status: 'OK',
    timestamp: new Date().toISOString(),
  };
};