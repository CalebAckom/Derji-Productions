import AWS from 'aws-sdk';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import crypto from 'crypto';
import { s3, S3_CONFIG } from '../config/aws';
import logger from '../config/logger';

export interface UploadResult {
  url: string;
  thumbnailUrl?: string;
  fileSize: number;
  dimensions?: { width: number; height: number };
  duration?: number;
  mimeType: string;
  key: string;
}

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  thumbnail?: boolean;
  thumbnailSize?: number;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  mimeType?: string;
  fileSize?: number;
  securityScan?: SecurityScanResult;
}

export interface SecurityScanResult {
  isSafe: boolean;
  threats: string[];
  fileHash: string;
}

export class FileStorageService {
  private readonly bucket: string;
  private readonly cdnUrl: string | undefined;
  private readonly virusScanEnabled: boolean;

  constructor() {
    this.bucket = S3_CONFIG.bucket;
    this.cdnUrl = process.env['CDN_URL'] || undefined;
    this.virusScanEnabled = process.env['ENABLE_VIRUS_SCAN'] === 'true';
  }

  /**
   * Calculate file hash for security scanning
   */
  private calculateFileHash(file: Buffer): string {
    return crypto.createHash('sha256').update(file).digest('hex');
  }

  /**
   * Basic security scan for malicious content
   */
  private async performSecurityScan(file: Buffer, mimeType: string): Promise<SecurityScanResult> {
    const fileHash = this.calculateFileHash(file);
    const threats: string[] = [];

    try {
      // Check for suspicious file signatures
      const fileSignature = file.slice(0, 16).toString('hex');
      
      // Known malicious signatures (simplified example)
      const maliciousSignatures = [
        '4d5a', // PE executable
        '7f454c46', // ELF executable
        'cafebabe', // Java class file
      ];

      for (const signature of maliciousSignatures) {
        if (fileSignature.toLowerCase().startsWith(signature)) {
          threats.push(`Suspicious file signature: ${signature}`);
        }
      }

      // Check for embedded scripts in images
      if (S3_CONFIG.allowedImageTypes.includes(mimeType)) {
        const fileContent = file.toString('utf8', 0, Math.min(file.length, 1024));
        const scriptPatterns = [
          /<script/i,
          /javascript:/i,
          /vbscript:/i,
          /onload=/i,
          /onerror=/i,
        ];

        for (const pattern of scriptPatterns) {
          if (pattern.test(fileContent)) {
            threats.push('Embedded script detected in image');
            break;
          }
        }
      }

      // Check file size anomalies
      if (S3_CONFIG.allowedImageTypes.includes(mimeType) && file.length > 10 * 1024 * 1024) {
        threats.push('Unusually large image file');
      }

      return {
        isSafe: threats.length === 0,
        threats,
        fileHash,
      };
    } catch (error) {
      logger.error('Security scan error:', error);
      return {
        isSafe: false,
        threats: ['Security scan failed'],
        fileHash,
      };
    }
  }

  /**
   * Validate uploaded file for security and type constraints
   */
  async validateFile(file: Buffer, originalName: string, mimeType: string): Promise<FileValidationResult> {
    try {
      // Check file size
      if (file.length > S3_CONFIG.maxFileSize) {
        return {
          isValid: false,
          error: `File size exceeds maximum allowed size of ${S3_CONFIG.maxFileSize / (1024 * 1024)}MB`
        };
      }

      // Check minimum file size (prevent empty files)
      if (file.length < 10) {
        return {
          isValid: false,
          error: 'File is too small or empty'
        };
      }

      // Check MIME type
      const allowedTypes = [
        ...S3_CONFIG.allowedImageTypes,
        ...S3_CONFIG.allowedVideoTypes,
        ...S3_CONFIG.allowedAudioTypes
      ];

      if (!allowedTypes.includes(mimeType)) {
        return {
          isValid: false,
          error: `File type ${mimeType} is not allowed`
        };
      }

      // Validate file extension matches MIME type
      const ext = path.extname(originalName).toLowerCase();
      const mimeToExtMap: Record<string, string[]> = {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/webp': ['.webp'],
        'image/gif': ['.gif'],
        'video/mp4': ['.mp4'],
        'video/webm': ['.webm'],
        'video/quicktime': ['.mov'],
        'audio/mpeg': ['.mp3'],
        'audio/wav': ['.wav'],
        'audio/ogg': ['.ogg'],
        'audio/aac': ['.aac'],
      };

      const expectedExtensions = mimeToExtMap[mimeType];
      if (expectedExtensions && !expectedExtensions.includes(ext)) {
        return {
          isValid: false,
          error: `File extension ${ext} does not match MIME type ${mimeType}`
        };
      }

      // Additional security checks for images
      if (S3_CONFIG.allowedImageTypes.includes(mimeType)) {
        try {
          const metadata = await sharp(file).metadata();
          if (!metadata.width || !metadata.height) {
            return {
              isValid: false,
              error: 'Invalid image file - no dimensions found'
            };
          }

          // Check for reasonable image dimensions
          if (metadata.width > 10000 || metadata.height > 10000) {
            return {
              isValid: false,
              error: 'Image dimensions too large (max 10000x10000)'
            };
          }
        } catch (error) {
          return {
            isValid: false,
            error: 'Corrupted or invalid image file'
          };
        }
      }

      // Check for malicious file extensions
      const dangerousExtensions = [
        '.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.jar',
        '.vbs', '.ps1', '.sh', '.php', '.asp', '.jsp', '.py', '.rb'
      ];
      if (dangerousExtensions.includes(ext)) {
        return {
          isValid: false,
          error: 'File extension not allowed for security reasons'
        };
      }

      // Perform security scan
      const securityScan = await this.performSecurityScan(file, mimeType);
      if (!securityScan.isSafe) {
        return {
          isValid: false,
          error: `Security scan failed: ${securityScan.threats.join(', ')}`,
          securityScan
        };
      }

      return {
        isValid: true,
        mimeType,
        fileSize: file.length,
        securityScan
      };
    } catch (error) {
      logger.error('File validation error:', error);
      return {
        isValid: false,
        error: 'File validation failed'
      };
    }
  }

  /**
   * Optimize image using Sharp with advanced options
   */
  async optimizeImage(file: Buffer, options: ImageOptimizationOptions = {}): Promise<{
    optimized: Buffer;
    thumbnail?: Buffer;
    dimensions: { width: number; height: number };
  }> {
    try {
      const {
        width,
        height,
        quality = 85,
        format = 'jpeg',
        thumbnail = true,
        thumbnailSize = 300
      } = options;

      let pipeline = sharp(file);

      // Get original dimensions
      const metadata = await pipeline.metadata();
      const originalWidth = metadata.width || 0;
      const originalHeight = metadata.height || 0;

      // Auto-orient based on EXIF data
      pipeline = pipeline.rotate();

      // Resize if dimensions specified
      if (width || height) {
        pipeline = pipeline.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Strip metadata for privacy and smaller file size
      pipeline = pipeline.withMetadata({});

      // Convert format and optimize
      let optimized: Buffer;
      switch (format) {
        case 'jpeg':
          optimized = await pipeline
            .jpeg({ 
              quality,
              progressive: true,
              mozjpeg: true
            })
            .toBuffer();
          break;
        case 'png':
          optimized = await pipeline
            .png({ 
              quality,
              compressionLevel: 9,
              progressive: true
            })
            .toBuffer();
          break;
        case 'webp':
          optimized = await pipeline
            .webp({ 
              quality,
              effort: 6
            })
            .toBuffer();
          break;
        default:
          optimized = await pipeline
            .jpeg({ 
              quality,
              progressive: true,
              mozjpeg: true
            })
            .toBuffer();
      }

      // Generate thumbnail if requested
      let thumbnailBuffer: Buffer | undefined;
      if (thumbnail) {
        thumbnailBuffer = await sharp(file)
          .rotate() // Auto-orient
          .resize(thumbnailSize, thumbnailSize, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 80, progressive: true })
          .toBuffer();
      }

      // Get final dimensions
      const finalMetadata = await sharp(optimized).metadata();

      return {
        optimized,
        ...(thumbnailBuffer && { thumbnail: thumbnailBuffer }),
        dimensions: {
          width: finalMetadata.width || originalWidth,
          height: finalMetadata.height || originalHeight
        }
      };
    } catch (error) {
      logger.error('Image optimization error:', error);
      throw new Error('Failed to optimize image');
    }
  }

  /**
   * Generate thumbnail for video files (placeholder implementation)
   */
  async generateVideoThumbnail(_file: Buffer): Promise<Buffer> {
    try {
      // In production, you would use ffmpeg to extract a frame
      // For now, create a video placeholder thumbnail
      const placeholder = await sharp({
        create: {
          width: 300,
          height: 200,
          channels: 3,
          background: { r: 30, g: 30, b: 30 }
        }
      })
      .composite([
        {
          input: Buffer.from(`
            <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          `),
          top: 70,
          left: 120
        }
      ])
      .jpeg({ quality: 80 })
      .toBuffer();

      return placeholder;
    } catch (error) {
      logger.error('Video thumbnail generation error:', error);
      throw new Error('Failed to generate video thumbnail');
    }
  }

  /**
   * Generate thumbnail for audio files
   */
  async generateAudioThumbnail(): Promise<Buffer> {
    try {
      // Create an audio waveform placeholder
      const placeholder = await sharp({
        create: {
          width: 300,
          height: 200,
          channels: 3,
          background: { r: 20, g: 20, b: 40 }
        }
      })
      .composite([
        {
          input: Buffer.from(`
            <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          `),
          top: 70,
          left: 120
        }
      ])
      .jpeg({ quality: 80 })
      .toBuffer();

      return placeholder;
    } catch (error) {
      logger.error('Audio thumbnail generation error:', error);
      throw new Error('Failed to generate audio thumbnail');
    }
  }

  /**
   * Upload file to S3 with enhanced configuration
   */
  async uploadToS3(file: Buffer, key: string, mimeType: string): Promise<string> {
    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: mimeType,
        // ACL: 'public-read', // Removed - bucket doesn't allow ACLs
        CacheControl: 'max-age=31536000', // 1 year cache
        Metadata: {
          'uploaded-at': new Date().toISOString(),
          'file-hash': this.calculateFileHash(file),
        },
        ServerSideEncryption: 'AES256', // Encrypt at rest
      };

      // Add content encoding for compressible files
      if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('xml')) {
        params.ContentEncoding = 'gzip';
      }

      logger.info(`Attempting S3 upload`, { 
        bucket: this.bucket, 
        key,
        size: file.length,
        mimeType,
        region: S3_CONFIG.region
      });

      const result = await s3.upload(params).promise();
      logger.info(`File uploaded to S3: ${key}`, { 
        bucket: this.bucket, 
        size: file.length,
        mimeType,
        location: result.Location
      });
      
      return result.Location;
    } catch (error) {
      logger.error('S3 upload error details:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any).code,
        statusCode: (error as any).statusCode,
        region: (error as any).region,
        bucket: this.bucket,
        key,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFromS3(key: string): Promise<void> {
    try {
      const params: AWS.S3.DeleteObjectRequest = {
        Bucket: this.bucket,
        Key: key,
      };

      await s3.deleteObject(params).promise();
      logger.info(`File deleted from S3: ${key}`);
    } catch (error) {
      logger.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  /**
   * Generate signed URL for private files
   */
  async generateSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
        Expires: expiresIn,
      };

      const signedUrl = s3.getSignedUrl('getObject', params);
      logger.info(`Generated signed URL for: ${key}`, { expiresIn });
      
      return signedUrl;
    } catch (error) {
      logger.error('Signed URL generation error:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Main upload method that handles the complete upload process
   */
  async uploadFile(
    file: Buffer,
    originalName: string,
    mimeType: string,
    options: ImageOptimizationOptions = {}
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = await this.validateFile(file, originalName, mimeType);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Generate unique key with organized folder structure
      const ext = path.extname(originalName);
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const category = this.getFileCategory(mimeType);
      const key = `${category}/${timestamp}/${uuidv4()}${ext}`;
      
      let finalFile = file;
      let thumbnailUrl: string | undefined;
      let dimensions: { width: number; height: number } | undefined;

      // Process based on file type
      if (S3_CONFIG.allowedImageTypes.includes(mimeType)) {
        // Optimize image
        const optimized = await this.optimizeImage(file, options);
        finalFile = optimized.optimized;
        dimensions = optimized.dimensions;

        // Upload thumbnail if generated
        if (optimized.thumbnail) {
          const thumbnailKey = `thumbnails/${timestamp}/${uuidv4()}.jpg`;
          thumbnailUrl = await this.uploadToS3(optimized.thumbnail, thumbnailKey, 'image/jpeg');
        }
      } else if (S3_CONFIG.allowedVideoTypes.includes(mimeType)) {
        // Generate video thumbnail
        try {
          const thumbnail = await this.generateVideoThumbnail(file);
          const thumbnailKey = `thumbnails/${timestamp}/${uuidv4()}.jpg`;
          thumbnailUrl = await this.uploadToS3(thumbnail, thumbnailKey, 'image/jpeg');
        } catch (error) {
          logger.warn('Failed to generate video thumbnail:', error);
        }
      } else if (S3_CONFIG.allowedAudioTypes.includes(mimeType)) {
        // Generate audio thumbnail
        try {
          const thumbnail = await this.generateAudioThumbnail();
          const thumbnailKey = `thumbnails/${timestamp}/${uuidv4()}.jpg`;
          thumbnailUrl = await this.uploadToS3(thumbnail, thumbnailKey, 'image/jpeg');
        } catch (error) {
          logger.warn('Failed to generate audio thumbnail:', error);
        }
      }

      // Upload main file
      const url = await this.uploadToS3(finalFile, key, mimeType);

      // Use CDN URL if configured
      const finalUrl = this.cdnUrl ? url.replace(new URL(url).origin, this.cdnUrl) : url;
      const finalThumbnailUrl = thumbnailUrl && this.cdnUrl 
        ? thumbnailUrl.replace(new URL(thumbnailUrl).origin, this.cdnUrl) 
        : thumbnailUrl;

      logger.info(`File upload completed: ${originalName}`, {
        key,
        size: finalFile.length,
        mimeType,
        hasThumbnail: !!thumbnailUrl,
        dimensions
      });

      return {
        url: finalUrl,
        ...(finalThumbnailUrl && { thumbnailUrl: finalThumbnailUrl }),
        fileSize: finalFile.length,
        ...(dimensions && { dimensions }),
        mimeType,
        key,
      };
    } catch (error) {
      logger.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Delete file and its thumbnail
   */
  async deleteFile(key: string, thumbnailKey?: string): Promise<void> {
    try {
      // Delete main file
      await this.deleteFromS3(key);

      // Delete thumbnail if exists
      if (thumbnailKey) {
        await this.deleteFromS3(thumbnailKey);
      }

      logger.info(`File deletion completed: ${key}`, { thumbnailKey });
    } catch (error) {
      logger.error('File deletion error:', error);
      throw error;
    }
  }

  /**
   * Bulk delete files
   */
  async deleteFiles(keys: string[]): Promise<void> {
    try {
      if (keys.length === 0) return;

      const deleteParams: AWS.S3.DeleteObjectsRequest = {
        Bucket: this.bucket,
        Delete: {
          Objects: keys.map(key => ({ Key: key })),
          Quiet: false,
        },
      };

      const result = await s3.deleteObjects(deleteParams).promise();
      
      if (result.Errors && result.Errors.length > 0) {
        logger.error('Some files failed to delete:', result.Errors);
        throw new Error(`Failed to delete ${result.Errors.length} files`);
      }

      logger.info(`Bulk deletion completed: ${keys.length} files`);
    } catch (error) {
      logger.error('Bulk file deletion error:', error);
      throw error;
    }
  }

  /**
   * Get file category based on MIME type
   */
  private getFileCategory(mimeType: string): string {
    if (S3_CONFIG.allowedImageTypes.includes(mimeType)) return 'images';
    if (S3_CONFIG.allowedVideoTypes.includes(mimeType)) return 'videos';
    if (S3_CONFIG.allowedAudioTypes.includes(mimeType)) return 'audio';
    return 'files';
  }

  /**
   * Health check for file storage service
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      // Test S3 connection
      await s3.headBucket({ Bucket: this.bucket }).promise();
      
      return {
        status: 'healthy',
        details: {
          bucket: this.bucket,
          region: S3_CONFIG.region,
          cdnEnabled: !!this.cdnUrl,
          virusScanEnabled: this.virusScanEnabled,
          maxFileSize: `${S3_CONFIG.maxFileSize / (1024 * 1024)}MB`,
          allowedTypes: {
            images: S3_CONFIG.allowedImageTypes.length,
            videos: S3_CONFIG.allowedVideoTypes.length,
            audio: S3_CONFIG.allowedAudioTypes.length,
          }
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          bucket: this.bucket,
        }
      };
    }
  }
}

export const fileStorageService = new FileStorageService();