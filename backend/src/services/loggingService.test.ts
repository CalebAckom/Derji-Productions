import { LoggingService, createLoggingService } from './loggingService';

describe('LoggingService', () => {
  let loggingService: LoggingService;

  beforeEach(() => {
    loggingService = createLoggingService({
      requestId: 'test-request-123',
      userId: 'test-user-456',
    });
  });

  test('should create logging service instance', () => {
    expect(loggingService).toBeDefined();
    expect(loggingService).toBeInstanceOf(LoggingService);
  });

  test('should create logging service with context', () => {
    const service = createLoggingService({
      requestId: 'test-123',
      userId: 'user-456',
      correlationId: 'corr-789',
    });
    expect(service).toBeDefined();
  });

  test('should create child service with additional context', () => {
    const childService = loggingService.withContext({
      sessionId: 'session-123',
    });
    expect(childService).toBeDefined();
    expect(childService).toBeInstanceOf(LoggingService);
  });

  test('should log general messages without errors', () => {
    expect(() => {
      loggingService.info('Test info message', { data: 'test' });
      loggingService.warn('Test warning message');
      loggingService.error('Test error message');
      loggingService.debug('Test debug message');
    }).not.toThrow();
  });

  test('should log performance metrics', () => {
    expect(() => {
      loggingService.logPerformance({
        operation: 'test-operation',
        duration: 150,
        success: true,
        metadata: { endpoint: '/api/test' },
      });
    }).not.toThrow();
  });

  test('should log security events', () => {
    expect(() => {
      loggingService.logSecurityEvent({
        event: 'login_attempt',
        severity: 'medium',
        userId: 'user-123',
        ip: '192.168.1.1',
        userAgent: 'test-agent',
      });
    }).not.toThrow();
  });

  test('should log database operations', () => {
    expect(() => {
      loggingService.logDatabaseOperation({
        operation: 'SELECT',
        table: 'users',
        duration: 50,
        recordsAffected: 1,
        success: true,
      });
    }).not.toThrow();
  });

  test('should log authentication events', () => {
    expect(() => {
      loggingService.logAuthEvent({
        event: 'login_success',
        userId: 'user-123',
        email: 'test@example.com',
        success: true,
        ip: '192.168.1.1',
      });
    }).not.toThrow();
  });

  test('should log file operations', () => {
    expect(() => {
      loggingService.logFileOperation({
        operation: 'upload',
        filename: 'test.jpg',
        size: 1024,
        mimeType: 'image/jpeg',
        success: true,
      });
    }).not.toThrow();
  });

  test('should log email operations', () => {
    expect(() => {
      loggingService.logEmailOperation({
        operation: 'send',
        recipient: 'test@example.com',
        subject: 'Test Email',
        success: true,
        provider: 'sendgrid',
      });
    }).not.toThrow();
  });

  test('should log HTTP requests', () => {
    expect(() => {
      loggingService.logHttpRequest('GET', '/api/test', 200, 150);
    }).not.toThrow();
  });

  test('should log business events', () => {
    expect(() => {
      loggingService.logBusinessEvent('user_registration', true, {
        userId: 'user-123',
        source: 'web',
      });
    }).not.toThrow();
  });

  test('should log audit events', () => {
    expect(() => {
      loggingService.logAuditEvent('user_created', 'user', 'admin-123', {
        targetUserId: 'user-456',
      });
    }).not.toThrow();
  });

  test('should log health checks', () => {
    expect(() => {
      loggingService.logHealthCheck('database', 'healthy', {
        connectionCount: 5,
      });
    }).not.toThrow();
  });

  test('should log metrics', () => {
    expect(() => {
      loggingService.logMetric('response_time', 150, 'milliseconds', {
        endpoint: '/api/test',
      });
    }).not.toThrow();
  });

  test('should log errors with context', () => {
    const error = new Error('Test error');
    expect(() => {
      loggingService.logError(error, 'test-context', {
        operation: 'test-operation',
      });
    }).not.toThrow();
  });

  test('should log database transactions', () => {
    expect(() => {
      loggingService.logTransaction('user_creation', ['users', 'profiles'], true, 200);
    }).not.toThrow();
  });
});