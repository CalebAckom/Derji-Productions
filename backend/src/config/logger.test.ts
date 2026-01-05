import logger, { 
  createChildLogger, 
  withRequestContext, 
  loggingHealthCheck 
} from './logger';

describe('Logger Configuration', () => {
  test('should create logger instance', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  test('should create child logger with context', () => {
    const childLogger = createChildLogger('test-context', { testId: '123' });
    expect(childLogger).toBeDefined();
    expect(typeof childLogger.info).toBe('function');
  });

  test('should create logger with request context', () => {
    const requestLogger = withRequestContext('test-request-id', 'test-user-id');
    expect(requestLogger).toBeDefined();
    expect(typeof requestLogger.info).toBe('function');
  });

  test('should perform health check', () => {
    const health = loggingHealthCheck();
    expect(health).toBeDefined();
    expect(health.status).toBe('healthy');
    expect(health.timestamp).toBeDefined();
  });

  test('should log messages without errors', () => {
    expect(() => {
      logger.info('Test info message', { testData: 'test' });
      logger.warn('Test warning message');
      logger.error('Test error message');
      logger.debug('Test debug message');
    }).not.toThrow();
  });

  test('should handle structured logging', () => {
    expect(() => {
      logger.info('Structured log test', {
        requestId: 'test-123',
        userId: 'user-456',
        operation: 'test-operation',
        metadata: {
          key1: 'value1',
          key2: 123,
          key3: true,
        },
      });
    }).not.toThrow();
  });
});