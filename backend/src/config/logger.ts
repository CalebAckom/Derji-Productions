import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import WinstonCloudWatch from 'winston-cloudwatch';
import path from 'path';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for console output
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(logColors);

// Custom format for structured logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, requestId, userId, ...meta } = info;
    
    const logEntry = {
      timestamp,
      level,
      message,
      requestId: requestId || null,
      userId: userId || null,
      service: 'derji-productions-api',
      environment: process.env['NODE_ENV'] || 'development',
      ...meta,
    };

    return JSON.stringify(logEntry);
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, requestId, userId, ...meta } = info;
    
    let logMessage = `${timestamp} [${level}]: ${message}`;
    
    if (requestId) {
      logMessage += ` [RequestID: ${requestId}]`;
    }
    
    if (userId) {
      logMessage += ` [UserID: ${userId}]`;
    }
    
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }
    
    return logMessage;
  })
);

// Create transports array
const transports: winston.transport[] = [];

// Console transport for development
if (process.env['NODE_ENV'] !== 'production') {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: consoleFormat,
    })
  );
}

// File transports with rotation
const logsDir = path.join(__dirname, '../../logs');

// General application logs
transports.push(
  new DailyRotateFile({
    filename: path.join(logsDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info',
    format: structuredFormat,
  })
);

// Error logs
transports.push(
  new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: structuredFormat,
  })
);

// HTTP access logs
transports.push(
  new DailyRotateFile({
    filename: path.join(logsDir, 'access-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '7d',
    level: 'http',
    format: structuredFormat,
  })
);

// Security logs
transports.push(
  new DailyRotateFile({
    filename: path.join(logsDir, 'security-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '90d',
    level: 'warn',
    format: structuredFormat,
  })
);

// Performance logs
transports.push(
  new DailyRotateFile({
    filename: path.join(logsDir, 'performance-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '7d',
    level: 'info',
    format: structuredFormat,
  })
);

// CloudWatch transport for production
if (process.env['NODE_ENV'] === 'production' && process.env['AWS_REGION']) {
  const cloudWatchConfig = {
    logGroupName: process.env['CLOUDWATCH_LOG_GROUP'] || 'derji-productions-api',
    logStreamName: () => {
      const date = new Date().toISOString().split('T')[0];
      return `${process.env['NODE_ENV']}-${date}-${process.env['INSTANCE_ID'] || 'default'}`;
    },
    awsAccessKeyId: process.env['AWS_ACCESS_KEY_ID'] || '',
    awsSecretKey: process.env['AWS_SECRET_ACCESS_KEY'] || '',
    awsRegion: process.env['AWS_REGION'] || '',
    messageFormatter: (logObject: any) => {
      return JSON.stringify(logObject);
    },
    level: 'info',
    format: structuredFormat,
    createLogGroup: true,
    createLogStream: true,
    submissionInterval: 2000, // Send logs every 2 seconds
    submissionRetryCount: 3,
    batchSize: 20,
    awsConfig: {
      region: process.env['AWS_REGION'],
    },
  };

  try {
    const cloudWatchTransport = new WinstonCloudWatch(cloudWatchConfig);
    
    // Add error handling for CloudWatch transport
    cloudWatchTransport.on('error', (error) => {
      console.error('CloudWatch logging error:', error);
    });
    
    cloudWatchTransport.on('logged', (info) => {
      if (process.env['LOG_LEVEL'] === 'debug') {
        console.log('Successfully logged to CloudWatch:', info.message);
      }
    });
    
    transports.push(cloudWatchTransport);
    console.log(`CloudWatch logging initialized successfully for log group: ${cloudWatchConfig.logGroupName}`);
    console.log(`Log stream pattern: ${process.env['NODE_ENV']}-YYYY-MM-DD-${process.env['INSTANCE_ID'] || 'default'}`);
  } catch (error) {
    console.warn('Failed to initialize CloudWatch logging:', error);
  }
}

// Create the logger instance
const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || (process.env['NODE_ENV'] === 'production' ? 'info' : 'debug'),
  levels: logLevels,
  format: structuredFormat,
  transports,
  exitOnError: false,
});

// Create specialized loggers for different concerns
export const createChildLogger = (context: string, metadata?: Record<string, any>) => {
  return logger.child({ context, ...metadata });
};

// Specialized loggers
export const httpLogger = createChildLogger('http');
export const securityLogger = createChildLogger('security');
export const performanceLogger = createChildLogger('performance');
export const databaseLogger = createChildLogger('database');
export const authLogger = createChildLogger('auth');
export const fileLogger = createChildLogger('file');
export const emailLogger = createChildLogger('email');

// Log correlation utilities
export const withRequestContext = (requestId: string, userId?: string) => {
  return logger.child({ requestId, userId });
};

// Performance monitoring utilities
export const logPerformance = (operation: string, startTime: number, metadata?: Record<string, any>) => {
  const duration = Date.now() - startTime;
  performanceLogger.info(`Operation completed: ${operation}`, {
    operation,
    duration: `${duration}ms`,
    ...metadata,
  });

  // Log slow operations as warnings
  if (duration > 1000) {
    performanceLogger.warn(`Slow operation detected: ${operation}`, {
      operation,
      duration: `${duration}ms`,
      threshold: '1000ms',
      ...metadata,
    });
  }
};

// Security event logging
export const logSecurityEvent = (event: string, severity: 'low' | 'medium' | 'high' | 'critical', metadata?: Record<string, any>) => {
  const logLevel = severity === 'critical' ? 'error' : severity === 'high' ? 'warn' : 'info';
  
  securityLogger[logLevel](`Security event: ${event}`, {
    event,
    severity,
    ...metadata,
  });
};

// Database operation logging
export const logDatabaseOperation = (operation: string, table: string, duration?: number, metadata?: Record<string, any>) => {
  databaseLogger.info(`Database operation: ${operation}`, {
    operation,
    table,
    duration: duration ? `${duration}ms` : undefined,
    ...metadata,
  });
};

// Authentication event logging
export const logAuthEvent = (event: string, userId?: string, success: boolean = true, metadata?: Record<string, any>) => {
  const logLevel = success ? 'info' : 'warn';
  
  authLogger[logLevel](`Auth event: ${event}`, {
    event,
    userId,
    success,
    ...metadata,
  });
};

// File operation logging
export const logFileOperation = (operation: string, filename: string, size?: number, metadata?: Record<string, any>) => {
  fileLogger.info(`File operation: ${operation}`, {
    operation,
    filename,
    size: size ? `${size} bytes` : undefined,
    ...metadata,
  });
};

// Email operation logging
export const logEmailOperation = (operation: string, recipient: string, success: boolean = true, metadata?: Record<string, any>) => {
  const logLevel = success ? 'info' : 'error';
  
  emailLogger[logLevel](`Email operation: ${operation}`, {
    operation,
    recipient,
    success,
    ...metadata,
  });
};

// Health check for logging system
export const loggingHealthCheck = () => {
  try {
    logger.info('Logging system health check', { timestamp: new Date().toISOString() });
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Graceful shutdown
export const closeLogger = () => {
  return new Promise<void>((resolve) => {
    logger.end(() => {
      resolve();
    });
  });
};

export default logger;