import dotenv from 'dotenv';
import path from 'path';
import AWS from 'aws-sdk';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const checkCloudWatchLogs = async () => {
  try {
    console.log('=== CloudWatch Logs Check ===');
    
    // Configure AWS
    AWS.config.update({
      accessKeyId: process.env['AWS_ACCESS_KEY_ID'],
      secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'],
      region: process.env['AWS_REGION'],
    });

    const cloudWatchLogs = new AWS.CloudWatchLogs();
    const logGroupName = process.env['CLOUDWATCH_LOG_GROUP'] || 'derji-productions-api';

    console.log('Region:', process.env['AWS_REGION']);
    console.log('Log Group:', logGroupName);

    // Check if log group exists
    console.log('\n1. Checking log group...');
    const logGroups = await cloudWatchLogs.describeLogGroups({
      logGroupNamePrefix: logGroupName,
    }).promise();

    const targetGroup = logGroups.logGroups?.find(group => group.logGroupName === logGroupName);
    if (!targetGroup) {
      console.log('❌ Log group not found!');
      return;
    }

    console.log('✅ Log group found');
    console.log('   Created:', targetGroup.creationTime ? new Date(targetGroup.creationTime).toISOString() : 'Unknown');
    console.log('   Retention:', targetGroup.retentionInDays || 'Never expire');

    // List log streams
    console.log('\n2. Checking log streams...');
    const logStreams = await cloudWatchLogs.describeLogStreams({
      logGroupName: logGroupName,
      orderBy: 'LastEventTime',
      descending: true,
      limit: 10,
    }).promise();

    if (!logStreams.logStreams || logStreams.logStreams.length === 0) {
      console.log('❌ No log streams found!');
      console.log('This means no logs have been sent to this log group yet.');
      return;
    }

    console.log(`✅ Found ${logStreams.logStreams.length} log streams:`);
    
    for (const stream of logStreams.logStreams) {
      const lastEventTime = stream.lastEventTime ? new Date(stream.lastEventTime).toISOString() : 'Never';
      const firstEventTime = stream.firstEventTime ? new Date(stream.firstEventTime).toISOString() : 'Never';
      
      console.log(`   📄 ${stream.logStreamName}`);
      console.log(`      First Event: ${firstEventTime}`);
      console.log(`      Last Event:  ${lastEventTime}`);
      console.log(`      Stored Bytes: ${stream.storedBytes || 0}`);
    }

    // Get recent log events from the most recent stream
    if (logStreams.logStreams.length > 0) {
      const mostRecentStream = logStreams.logStreams[0];
      console.log(`\n3. Recent log events from: ${mostRecentStream.logStreamName}`);
      
      try {
        const logEvents = await cloudWatchLogs.getLogEvents({
          logGroupName: logGroupName,
          logStreamName: mostRecentStream.logStreamName!,
          limit: 10,
          startFromHead: false, // Get most recent events
        }).promise();

        if (!logEvents.events || logEvents.events.length === 0) {
          console.log('❌ No log events found in this stream');
        } else {
          console.log(`✅ Found ${logEvents.events.length} recent log events:`);
          
          for (const event of logEvents.events) {
            const timestamp = new Date(event.timestamp!).toISOString();
            console.log(`   [${timestamp}] ${event.message}`);
          }
        }
      } catch (error) {
        console.log('❌ Could not retrieve log events:', error);
      }
    }

    // Check for today's expected log stream
    const today = new Date().toISOString().split('T')[0];
    const expectedStreamName = `${process.env['NODE_ENV']}-${today}-${process.env['INSTANCE_ID'] || 'default'}`;
    
    console.log(`\n4. Checking for today's expected stream: ${expectedStreamName}`);
    
    const todayStream = logStreams.logStreams.find(stream => stream.logStreamName === expectedStreamName);
    if (todayStream) {
      console.log('✅ Today\'s log stream found!');
      const lastEventTime = todayStream.lastEventTime ? new Date(todayStream.lastEventTime).toISOString() : 'Never';
      console.log(`   Last activity: ${lastEventTime}`);
    } else {
      console.log('❌ Today\'s expected log stream not found');
      console.log('   This suggests the application hasn\'t sent logs today, or is using a different stream name');
    }

  } catch (error) {
    console.error('Failed to check CloudWatch logs:', error);
  }
};

// Run the check
checkCloudWatchLogs().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Log check script failed:', error);
  process.exit(1);
});