import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import the logger after environment is loaded
import logger from '../config/logger';

const testProductionLogging = async () => {
  console.log('=== Production Logging Test ===');
  console.log('NODE_ENV:', process.env['NODE_ENV']);
  console.log('LOG_LEVEL:', process.env['LOG_LEVEL']);
  console.log('AWS_REGION:', process.env['AWS_REGION']);
  console.log('CLOUDWATCH_LOG_GROUP:', process.env['CLOUDWATCH_LOG_GROUP']);

  console.log('\nSending test logs...');

  // Send various log levels
  logger.info('Production logging test - INFO level', {
    test: true,
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'],
    logLevel: 'info',
  });

  logger.warn('Production logging test - WARN level', {
    test: true,
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'],
    logLevel: 'warn',
  });

  logger.error('Production logging test - ERROR level', {
    test: true,
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'],
    logLevel: 'error',
    error: 'This is a test error for CloudWatch',
  });

  // Test with request context
  const requestLogger = logger.child({
    requestId: 'test-request-123',
    userId: 'test-user-456',
  });

  requestLogger.info('Production logging test with context', {
    test: true,
    operation: 'test-operation',
    metadata: {
      key1: 'value1',
      key2: 123,
    },
  });

  console.log('Test logs sent!');
  console.log('\nWait 30-60 seconds, then check CloudWatch:');
  console.log(`Region: ${process.env['AWS_REGION']}`);
  console.log(`Log Group: ${process.env['CLOUDWATCH_LOG_GROUP']}`);
  console.log(`Log Stream: production-${new Date().toISOString().split('T')[0]}-${process.env['INSTANCE_ID'] || 'default'}`);

  // Wait a bit for logs to be sent
  console.log('\nWaiting 10 seconds for logs to be transmitted...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('Test complete! Check CloudWatch Logs console.');
};

// Run the test
testProductionLogging().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Production logging test failed:', error);
  process.exit(1);
});