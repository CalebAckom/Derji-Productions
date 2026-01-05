# CloudWatch Logging Troubleshooting Guide

## Current Configuration

Based on your `.env` file:
- **NODE_ENV**: production
- **AWS_REGION**: eu-west-1
- **CLOUDWATCH_LOG_GROUP**: cloudwatch-logger
- **INSTANCE_ID**: local-dev
- **LOG_LEVEL**: debug

## Expected CloudWatch Location

Your logs should appear in:
- **AWS Region**: eu-west-1 (Europe - Ireland)
- **Log Group**: `cloudwatch-logger`
- **Log Stream**: `production-2026-01-05-local-dev` (format: `{NODE_ENV}-{DATE}-{INSTANCE_ID}`)

## Troubleshooting Steps

### 1. Verify CloudWatch Console Region
Make sure you're looking in the **eu-west-1** region in the AWS CloudWatch console:
- Go to AWS CloudWatch Console
- Check the region selector in the top-right corner
- Ensure it shows "Europe (Ireland) eu-west-1"

### 2. Check Log Group Exists
- In CloudWatch Console, go to "Logs" → "Log groups"
- Look for log group named: `cloudwatch-logger`
- If it doesn't exist, the application should create it automatically

### 3. Check Log Streams
- Click on the `cloudwatch-logger` log group
- Look for log streams with pattern: `production-YYYY-MM-DD-local-dev`
- Today's stream should be: `production-2026-01-05-local-dev`

### 4. Verify Application is Running in Production Mode
Run this command to check:
```bash
npm run build
NODE_ENV=production npm start
```

### 5. Test CloudWatch Connectivity
Run the diagnostic scripts:
```bash
# Test CloudWatch permissions
npx tsx src/scripts/check-cloudwatch-permissions.ts

# Test production logging
npx tsx src/scripts/test-production-logging.ts
```

### 6. Check Application Logs for CloudWatch Errors
When starting the application in production mode, you should see:
```
CloudWatch logging initialized successfully for log group: cloudwatch-logger
Log stream pattern: production-YYYY-MM-DD-local-dev
```

If you see errors like:
- "Failed to initialize CloudWatch logging"
- "CloudWatch logging error"

Check the error details for specific issues.

### 7. Common Issues and Solutions

#### Issue: "Log group not found"
**Solution**: The application should create it automatically. If not, create manually:
```bash
aws logs create-log-group --log-group-name cloudwatch-logger --region eu-west-1
```

#### Issue: "Access denied"
**Solution**: Ensure your IAM user/role has these permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:DescribeLogGroups",
                "logs:DescribeLogStreams"
            ],
            "Resource": "*"
        }
    ]
}
```

#### Issue: "Wrong region"
**Solution**: Ensure AWS_REGION in .env matches the region you're checking in CloudWatch console.

#### Issue: "Logs delayed"
**Solution**: CloudWatch logs can take 1-2 minutes to appear. Wait and refresh.

#### Issue: "Log level too high"
**Solution**: Ensure LOG_LEVEL is set to 'info' or lower ('debug', 'info', 'warn', 'error').

### 8. Manual Verification

You can manually verify logs are being sent by checking the application startup messages:
1. Start the application with `NODE_ENV=production`
2. Look for CloudWatch initialization messages
3. Make some API requests to generate logs
4. Wait 2-3 minutes
5. Check CloudWatch console

### 9. Alternative: Check with AWS CLI

If you have AWS CLI configured:
```bash
# List log groups
aws logs describe-log-groups --log-group-name-prefix cloudwatch-logger --region eu-west-1

# List log streams
aws logs describe-log-streams --log-group-name cloudwatch-logger --region eu-west-1

# Get recent log events
aws logs get-log-events --log-group-name cloudwatch-logger --log-stream-name production-2026-01-05-local-dev --region eu-west-1
```

### 10. Debug Mode

Set LOG_LEVEL=debug in your .env file to see detailed CloudWatch logging information:
```
LOG_LEVEL=debug
```

This will show "Successfully logged to CloudWatch" messages for each log entry.

## Still Not Working?

If logs still don't appear after following these steps:

1. **Check Network Connectivity**: Ensure your server can reach AWS endpoints
2. **Verify Credentials**: Double-check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
3. **Check IAM Permissions**: Ensure the IAM user has CloudWatch Logs permissions
4. **Try Different Log Group**: Create a new log group name to test
5. **Check AWS Service Health**: Verify CloudWatch Logs service is operational in eu-west-1

## Contact Information

If you continue having issues, provide:
1. Application startup logs
2. Any error messages
3. AWS region you're checking
4. Screenshot of CloudWatch console showing log groups