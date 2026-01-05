import { FileStorageService } from './fileStorageService';
import sharp from 'sharp';
import { S3_CONFIG } from '../config/aws';

// Mock AWS S3
jest.mock('../config/aws', () => ({
  s3: {
    upload: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Location: 'https://test-bucket.s3.amazonaws.com/test-file.jpg'
      })
    }),
    deleteObject: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
    }),
    deleteObjects: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Deleted: [{ Key: 'test-key' }],
        Errors: []
      })
    }),
    getSignedUrl: jest.fn().mockReturnValue('https://signed-url.com/test'),
    headBucket: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
    })
  },
  S3_CONFIG: {
    bucket: 'test-bucket',
    region: 'us-east-1',
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    allowedAudioTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac'],
  }
}));

// Mock logger
jest.mock('../config/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }
}));

describe('FileStorageService', () => {
  let service: FileStorageService;
  let testImageBuffer: Buffer;
  let testVideoBuffer: Buffer;
  let testAudioBuffer: Buffer;

  beforeAll(async () => {
    service = new FileStorageService();
    
    // Create test image buffer
    testImageBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    }).jpeg().toBuffer();

    // Create mock video buffer (just some bytes)
    testVideoBuffer = Buffer.from('fake video content');
    
    // Create mock audio buffer (just some bytes)
    testAudioBuffer = Buffer.from('fake audio content');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateFile', () => {
    it('should validate a valid image file', async () => {
      const result = await service.validateFile(testImageBuffer, 'test.jpg', 'image/jpeg');
      
      expect(result.isValid).toBe(true);
      expect(result.mimeType).toBe('image/jpeg');
      expect(result.fileSize).toBe(testImageBuffer.length);
    });

    it('should reject files that are too large', async () => {
      const largeBuffer = Buffer.alloc(S3_CONFIG.maxFileSize + 1);
      const result = await service.validateFile(largeBuffer, 'large.jpg', 'image/jpeg');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File size exceeds maximum');
    });

    it('should reject files that are too small', async () => {
      const tinyBuffer = Buffer.alloc(5);
      const result = await service.validateFile(tinyBuffer, 'tiny.jpg', 'image/jpeg');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too small or empty');
    });

    it('should reject disallowed MIME types', async () => {
      const result = await service.validateFile(testImageBuffer, 'test.exe', 'application/x-executable');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should reject mismatched file extensions', async () => {
      const result = await service.validateFile(testImageBuffer, 'test.txt', 'image/jpeg');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('does not match MIME type');
    });

    it('should reject dangerous file extensions', async () => {
      const result = await service.validateFile(testImageBuffer, 'malware.exe', 'image/jpeg');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('does not match MIME type');
    });

    it('should reject images with invalid dimensions', async () => {
      const invalidImageBuffer = Buffer.from('not an image');
      const result = await service.validateFile(invalidImageBuffer, 'invalid.jpg', 'image/jpeg');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Corrupted or invalid image file');
    });
  });

  describe('optimizeImage', () => {
    it('should optimize an image with default settings', async () => {
      const result = await service.optimizeImage(testImageBuffer);
      
      expect(result.optimized).toBeInstanceOf(Buffer);
      expect(result.thumbnail).toBeInstanceOf(Buffer);
      expect(result.dimensions).toHaveProperty('width');
      expect(result.dimensions).toHaveProperty('height');
    });

    it('should resize image when dimensions are specified', async () => {
      const result = await service.optimizeImage(testImageBuffer, {
        width: 50,
        height: 50
      });
      
      expect(result.optimized).toBeInstanceOf(Buffer);
      expect(result.dimensions.width).toBeLessThanOrEqual(50);
      expect(result.dimensions.height).toBeLessThanOrEqual(50);
    });

    it('should convert image to specified format', async () => {
      const result = await service.optimizeImage(testImageBuffer, {
        format: 'webp',
        quality: 90
      });
      
      expect(result.optimized).toBeInstanceOf(Buffer);
    });

    it('should skip thumbnail generation when disabled', async () => {
      const result = await service.optimizeImage(testImageBuffer, {
        thumbnail: false
      });
      
      expect(result.optimized).toBeInstanceOf(Buffer);
      expect(result.thumbnail).toBeUndefined();
    });
  });

  describe('uploadFile', () => {
    it('should upload an image file successfully', async () => {
      const result = await service.uploadFile(
        testImageBuffer,
        'test-image.jpg',
        'image/jpeg'
      );
      
      expect(result.url).toBe('https://test-bucket.s3.amazonaws.com/test-file.jpg');
      expect(result.key).toMatch(/^images\/\d{4}-\d{2}-\d{2}\/.+\.jpg$/);
      expect(result.mimeType).toBe('image/jpeg');
      expect(result.fileSize).toBeGreaterThan(0);
      expect(result.dimensions).toBeDefined();
    });

    it('should upload a video file with thumbnail', async () => {
      const result = await service.uploadFile(
        testVideoBuffer,
        'test-video.mp4',
        'video/mp4'
      );
      
      expect(result.url).toBe('https://test-bucket.s3.amazonaws.com/test-file.jpg');
      expect(result.key).toMatch(/^videos\/\d{4}-\d{2}-\d{2}\/.+\.mp4$/);
      expect(result.mimeType).toBe('video/mp4');
      expect(result.thumbnailUrl).toBeDefined();
    });

    it('should upload an audio file with thumbnail', async () => {
      const result = await service.uploadFile(
        testAudioBuffer,
        'test-audio.mp3',
        'audio/mpeg'
      );
      
      expect(result.url).toBe('https://test-bucket.s3.amazonaws.com/test-file.jpg');
      expect(result.key).toMatch(/^audio\/\d{4}-\d{2}-\d{2}\/.+\.mp3$/);
      expect(result.mimeType).toBe('audio/mpeg');
      expect(result.thumbnailUrl).toBeDefined();
    });

    it('should apply CDN URL when configured', async () => {
      // Create a new service instance with CDN URL
      const originalEnv = process.env['CDN_URL'];
      process.env['CDN_URL'] = 'https://cdn.example.com';
      
      // Create new service instance to pick up the env var
      const cdnService = new FileStorageService();
      
      const result = await cdnService.uploadFile(
        testImageBuffer,
        'test-image.jpg',
        'image/jpeg'
      );
      
      expect(result.url).toContain('cdn.example.com');
      
      // Clean up
      if (originalEnv) {
        process.env['CDN_URL'] = originalEnv;
      } else {
        delete process.env['CDN_URL'];
      }
    });

    it('should reject invalid files', async () => {
      const invalidBuffer = Buffer.alloc(S3_CONFIG.maxFileSize + 1);
      
      await expect(
        service.uploadFile(invalidBuffer, 'invalid.jpg', 'image/jpeg')
      ).rejects.toThrow('File size exceeds maximum');
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      await expect(
        service.deleteFile('test-key')
      ).resolves.not.toThrow();
    });

    it('should delete file and thumbnail', async () => {
      await expect(
        service.deleteFile('test-key', 'thumbnail-key')
      ).resolves.not.toThrow();
    });
  });

  describe('deleteFiles', () => {
    it('should delete multiple files successfully', async () => {
      await expect(
        service.deleteFiles(['key1', 'key2', 'key3'])
      ).resolves.not.toThrow();
    });

    it('should handle empty array', async () => {
      await expect(
        service.deleteFiles([])
      ).resolves.not.toThrow();
    });
  });

  describe('generateSignedUrl', () => {
    it('should generate a signed URL', async () => {
      const url = await service.generateSignedUrl('test-key', 3600);
      
      expect(url).toBe('https://signed-url.com/test');
    });

    it('should use default expiration time', async () => {
      const url = await service.generateSignedUrl('test-key');
      
      expect(url).toBe('https://signed-url.com/test');
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status', async () => {
      const health = await service.healthCheck();
      
      expect(health.status).toBe('healthy');
      expect(health.details).toHaveProperty('bucket');
      expect(health.details).toHaveProperty('region');
      expect(health.details).toHaveProperty('maxFileSize');
    });
  });

  describe('generateVideoThumbnail', () => {
    it('should generate a video thumbnail placeholder', async () => {
      const thumbnail = await service.generateVideoThumbnail(testVideoBuffer);
      
      expect(thumbnail).toBeInstanceOf(Buffer);
      expect(thumbnail.length).toBeGreaterThan(0);
    });
  });

  describe('generateAudioThumbnail', () => {
    it('should generate an audio thumbnail placeholder', async () => {
      const thumbnail = await service.generateAudioThumbnail();
      
      expect(thumbnail).toBeInstanceOf(Buffer);
      expect(thumbnail.length).toBeGreaterThan(0);
    });
  });
});