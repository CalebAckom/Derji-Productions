import dotenv from 'dotenv';
import path from 'path';
import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('=== CloudWatch Logging Diagnostic ===');
console.log('NODE_ENV:', process.env['NODE_ENV']);
console.log('AWS_REGION:', process.env['AWS_REGION']);
console.log('AWS_ACCESS_KEY_ID:', process.env['AWS_ACCESS_KEY_ID'] ? 'Set' : 'Not set');
console.log('AWS_SECRET_ACCESS_KEY:', process.env['AWS_SECRET_ACCESS_KEY'] ? 'Set' : 'Not set');
console.log('CLOUDWATCH_LOG_GROUP:', process.env['CLOUDWATCH_LOG_GROUP']);
console.log('INSTANCE_ID:', process.env['INSTANCE_ID']);

// Test CloudWatch configuration
const testCloudWatchLogging = async () => {
  try {
    console.log('\n=== Testing CloudWatch Configuration ===');
    
    const logGroupName = process.env['CLOUDWATCH_LOG_GROUP'] || 'derji-productions-api';
    const date = new Date().toISOString().split('T')[0];
    const logStreamName = `${process.env['NODE_ENV']}-${date}-${process.env['INSTANCE_ID'] || 'default'}`;
    
    console.log('Log Group Name:', logGroupName);
    console.log('Log Stream Name:', logStreamName);
    
    const cloudWatchConfig = {
      logGroupName,
      logStreamName,
      awsAccessKeyId: process.env['AWS_ACCESS_KEY_ID'],
      awsSecretKey: process.env['AWS_SECRET_ACCESS_KEY'],
      awsRegion: process.env['AWS_REGION'],
      messageFormatter: (logObject: any) => {
        return JSON.stringify(logObject);
      },
      level: 'info',
      createLogGroup: true,
      createLogStream: true,
      submissionInterval: 2000,
      submissionRetryCount: 1,
      batchSize: 20,
      awsConfig: {
        region: process.env['AWS_REGION'],
      },
    };

    console.log('\n=== Creating CloudWatch Transport ===');
    
    const cloudWatchTransport = new WinstonCloudWatch(cloudWatchConfig);
    
    const testLogger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        cloudWatchTransport
      ],
    });

    console.log('CloudWatch transport created successfully');
    
    // Test logging
    console.log('\n=== Testing Log Messages ===');
    
    testLogger.info('CloudWatch test message 1', {
      test: true,
      timestamp: new Date().toISOString(),
      environment: process.env['NODE_ENV'],
    });
    
    testLogger.warn('CloudWatch test warning', {
      test: true,
      level: 'warning',
    });
    
    testLogger.error('CloudWatch test error', {
      test: true,
      level: 'error',
      error: 'This is a test error message',
    });
    
    console.log('Test messages sent to CloudWatch');
    console.log('Check your CloudWatch console in a few minutes for the logs');
    console.log(`Log Group: ${logGroupName}`);
    console.log(`Log Stream: ${logStreamName}`);
    
    // Wait a bit for logs to be sent
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n=== Test Complete ===');
    console.log('If you don\'t see logs in CloudWatch, check:');
    console.log('1. AWS credentials have CloudWatch permissions');
    console.log('2. Log group exists or can be created');
    console.log('3. Network connectivity to AWS');
    console.log('4. AWS region is correct');
    
  } catch (error) {
    console.error('CloudWatch test failed:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    console.log('\n=== Troubleshooting Steps ===');
    console.log('1. Verify AWS credentials are correct');
    console.log('2. Check IAM permissions for CloudWatch Logs');
    console.log('3. Ensure log group exists or can be created');
    console.log('4. Check network connectivity');
    console.log('5. Verify AWS region setting');
  }
};

// Run the test
testCloudWatchLogging().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Test script failed:', error);
  process.exit(1);
});