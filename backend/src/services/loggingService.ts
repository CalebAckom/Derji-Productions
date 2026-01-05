import logger, {
  httpLogger,
  securityLogger,
  performanceLogger,
  databaseLogger,
  authLogger,
  fileLogger,
  emailLogger,
  withRequestContext,
} from '../config/logger';

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
}

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface SecurityEvent {
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface DatabaseEvent {
  operation: string;
  table: string;
  duration?: number;
  recordsAffected?: number;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface AuthEvent {
  event: string;
  userId?: string;
  email?: string;
  success: boolean;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface FileEvent {
  operation: string;
  filename: string;
  size?: number;
  mimeType?: string;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface EmailEvent {
  operation: string;
  recipient: string;
  subject?: string;
  success: boolean;
  provider?: string;
  metadata?: Record<string, any>;
}

export class LoggingService {
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  // Create a new logging service instance with additional context
  withContext(additionalContext: Partial<LogContext>): LoggingService {
    return new LoggingService({ ...this.context, ...additionalContext });
  }

  // Get logger with current context
  private getLogger() {
    if (this.context.requestId) {
      return withRequestContext(this.context.requestId, this.context.userId);
    }
    return logger;
  }

  // General logging methods
  info(message: string, metadata?: Record<string, any>) {
    this.getLogger().info(message, { ...this.context, ...metadata });
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.getLogger().warn(message, { ...this.context, ...metadata });
  }

  error(message: string, error?: Error, metadata?: Record<string, any>) {
    this.getLogger().error(message, {
      ...this.context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      ...metadata,
    });
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.getLogger().debug(message, { ...this.context, ...metadata });
  }

  // Performance logging
  logPerformance(metrics: PerformanceMetrics) {
    const { operation, duration, success, metadata = {} } = metrics;
    
    performanceLogger.info(`Performance: ${operation}`, {
      ...this.context,
      operation,
      duration: `${duration}ms`,
      success,
      ...metadata,
    });

    // Log slow operations as warnings
    if (duration > 1000) {
      performanceLogger.warn(`Slow operation: ${operation}`, {
        ...this.context,
        operation,
        duration: `${duration}ms`,
        threshold: '1000ms',
        success,
        ...metadata,
      });
    }
  }

  // Security event logging
  logSecurityEvent(event: SecurityEvent) {
    const { event: eventName, severity, userId, ip, userAgent, metadata = {} } = event;
    
    securityLogger.info(`Security event: ${eventName}`, {
      ...this.context,
      event: eventName,
      severity,
      userId: userId || this.context.userId,
      ip,
      userAgent,
      ...metadata,
    });
  }

  // Database operation logging
  logDatabaseOperation(event: DatabaseEvent) {
    const { operation, table, duration, recordsAffected, success, metadata = {} } = event;
    
    databaseLogger.info(`Database: ${operation} on ${table}`, {
      ...this.context,
      operation,
      table,
      duration: duration ? `${duration}ms` : undefined,
      recordsAffected,
      success,
      ...metadata,
    });

    if (!success) {
      databaseLogger.error(`Database operation failed: ${operation} on ${table}`, {
        ...this.context,
        operation,
        table,
        duration: duration ? `${duration}ms` : undefined,
        recordsAffected,
        success,
        ...metadata,
      });
    }
  }

  // Authentication event logging
  logAuthEvent(event: AuthEvent) {
    const { event: eventName, userId, email, success, ip, userAgent, metadata = {} } = event;
    
    authLogger[success ? 'info' : 'warn'](`Auth: ${eventName}`, {
      ...this.context,
      event: eventName,
      userId: userId || this.context.userId,
      email,
      success,
      ip,
      userAgent,
      ...metadata,
    });
  }

  // File operation logging
  logFileOperation(event: FileEvent) {
    const { operation, filename, size, mimeType, success, metadata = {} } = event;
    
    fileLogger[success ? 'info' : 'error'](`File: ${operation}`, {
      ...this.context,
      operation,
      filename,
      size: size ? `${size} bytes` : undefined,
      mimeType,
      success,
      ...metadata,
    });
  }

  // Email operation logging
  logEmailOperation(event: EmailEvent) {
    const { operation, recipient, subject, success, provider, metadata = {} } = event;
    
    emailLogger[success ? 'info' : 'error'](`Email: ${operation}`, {
      ...this.context,
      operation,
      recipient,
      subject,
      success,
      provider,
      ...metadata,
    });
  }

  // HTTP request logging
  logHttpRequest(method: string, url: string, statusCode: number, duration: number, metadata?: Record<string, any>) {
    httpLogger.info(`HTTP: ${method} ${url}`, {
      ...this.context,
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      ...metadata,
    });
  }

  // Business logic logging
  logBusinessEvent(event: string, success: boolean, metadata?: Record<string, any>) {
    const logLevel = success ? 'info' : 'warn';
    this.getLogger()[logLevel](`Business: ${event}`, {
      ...this.context,
      event,
      success,
      ...metadata,
    });
  }

  // Audit logging for compliance
  logAuditEvent(action: string, resource: string, userId?: string, metadata?: Record<string, any>) {
    securityLogger.info(`Audit: ${action} on ${resource}`, {
      ...this.context,
      action,
      resource,
      userId: userId || this.context.userId,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  // System health logging
  logHealthCheck(service: string, status: 'healthy' | 'unhealthy' | 'degraded', metadata?: Record<string, any>) {
    const logLevel = status === 'healthy' ? 'info' : status === 'degraded' ? 'warn' : 'error';
    
    this.getLogger()[logLevel](`Health: ${service} is ${status}`, {
      ...this.context,
      service,
      status,
      ...metadata,
    });
  }

  // Metrics and monitoring
  logMetric(name: string, value: number, unit: string, metadata?: Record<string, any>) {
    this.getLogger().info(`Metric: ${name}`, {
      ...this.context,
      metric: name,
      value,
      unit,
      ...metadata,
    });
  }

  // Error tracking with correlation
  logError(error: Error, context?: string, metadata?: Record<string, any>) {
    this.getLogger().error(`Error${context ? ` in ${context}` : ''}`, {
      ...this.context,
      context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...metadata,
    });
  }

  // Transaction logging for database operations
  logTransaction(operation: string, tables: string[], success: boolean, duration?: number, metadata?: Record<string, any>) {
    const logLevel = success ? 'info' : 'error';
    
    databaseLogger[logLevel](`Transaction: ${operation}`, {
      ...this.context,
      operation,
      tables,
      success,
      duration: duration ? `${duration}ms` : undefined,
      ...metadata,
    });
  }
}

// Factory function to create logging service with request context
export const createLoggingService = (context: LogContext = {}): LoggingService => {
  return new LoggingService(context);
};

// Express middleware to add logging service to request
export const loggingServiceMiddleware = (req: any, _res: any, next: Function) => {
  const requestId = req.headers['x-request-id'] as string;
  const userId = req.user?.id;
  
  req.loggingService = createLoggingService({
    requestId,
    userId,
  });
  
  next();
};

export default LoggingService;