import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configure AWS SDK
const awsAccessKeyId = process.env['AWS_ACCESS_KEY_ID'];
const awsSecretAccessKey = process.env['AWS_SECRET_ACCESS_KEY'];
const awsRegion = process.env['AWS_REGION'] || 'us-east-1';

// Only configure AWS if credentials are provided
if (awsAccessKeyId && awsSecretAccessKey) {
  AWS.config.update({
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
    region: awsRegion,
  });
}

// Create S3 instance
export const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {
    Bucket: process.env['AWS_S3_BUCKET'],
  },
});

// S3 configuration
export const S3_CONFIG = {
  bucket: process.env['AWS_S3_BUCKET'] || 'derji-productions-media',
  region: process.env['AWS_REGION'] || 'us-east-1',
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
  allowedAudioTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac'],
};