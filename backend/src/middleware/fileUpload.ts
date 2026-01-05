import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { S3_CONFIG } from '../config/aws';
import logger from '../config/logger';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    ...S3_CONFIG.allowedImageTypes,
    ...S3_CONFIG.allowedVideoTypes,
    ...S3_CONFIG.allowedAudioTypes
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: S3_CONFIG.maxFileSize,
    files: 10, // Maximum 10 files per request
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const singleUpload = upload.single(fieldName);
    
    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: {
              code: 'FILE_TOO_LARGE',
              message: `File size exceeds maximum allowed size of ${S3_CONFIG.maxFileSize / (1024 * 1024)}MB`,
              timestamp: new Date().toISOString(),
              requestId: req.headers['x-request-id'] || 'unknown'
            }
          });
        }
        
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            error: {
              code: 'TOO_MANY_FILES',
              message: 'Too many files uploaded',
              timestamp: new Date().toISOString(),
              requestId: req.headers['x-request-id'] || 'unknown'
            }
          });
        }

        logger.error('Multer error:', err);
        return res.status(400).json({
          error: {
            code: 'UPLOAD_ERROR',
            message: err.message,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
      }

      if (err) {
        logger.error('File upload error:', err);
        return res.status(400).json({
          error: {
            code: 'INVALID_FILE',
            message: err.message,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
      }

      next();
    });
  };
};

// Middleware for multiple file upload
export const uploadMultiple = (fieldName: string, maxCount: number = 10) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const multipleUpload = upload.array(fieldName, maxCount);
    
    multipleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: {
              code: 'FILE_TOO_LARGE',
              message: `File size exceeds maximum allowed size of ${S3_CONFIG.maxFileSize / (1024 * 1024)}MB`,
              timestamp: new Date().toISOString(),
              requestId: req.headers['x-request-id'] || 'unknown'
            }
          });
        }
        
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            error: {
              code: 'TOO_MANY_FILES',
              message: `Too many files uploaded. Maximum allowed: ${maxCount}`,
              timestamp: new Date().toISOString(),
              requestId: req.headers['x-request-id'] || 'unknown'
            }
          });
        }

        logger.error('Multer error:', err);
        return res.status(400).json({
          error: {
            code: 'UPLOAD_ERROR',
            message: err.message,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
      }

      if (err) {
        logger.error('File upload error:', err);
        return res.status(400).json({
          error: {
            code: 'INVALID_FILE',
            message: err.message,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
      }

      next();
    });
  };
};

// Middleware for fields with mixed file types
export const uploadFields = (fields: { name: string; maxCount: number }[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const fieldsUpload = upload.fields(fields);
    
    fieldsUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: {
              code: 'FILE_TOO_LARGE',
              message: `File size exceeds maximum allowed size of ${S3_CONFIG.maxFileSize / (1024 * 1024)}MB`,
              timestamp: new Date().toISOString(),
              requestId: req.headers['x-request-id'] || 'unknown'
            }
          });
        }
        
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            error: {
              code: 'TOO_MANY_FILES',
              message: 'Too many files uploaded',
              timestamp: new Date().toISOString(),
              requestId: req.headers['x-request-id'] || 'unknown'
            }
          });
        }

        logger.error('Multer error:', err);
        return res.status(400).json({
          error: {
            code: 'UPLOAD_ERROR',
            message: err.message,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
      }

      if (err) {
        logger.error('File upload error:', err);
        return res.status(400).json({
          error: {
            code: 'INVALID_FILE',
            message: err.message,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
      }

      next();
    });
  };
};

// Utility function to check if file is an image
export const isImageFile = (mimeType: string): boolean => {
  return S3_CONFIG.allowedImageTypes.includes(mimeType);
};

// Utility function to check if file is a video
export const isVideoFile = (mimeType: string): boolean => {
  return S3_CONFIG.allowedVideoTypes.includes(mimeType);
};

// Utility function to check if file is audio
export const isAudioFile = (mimeType: string): boolean => {
  return S3_CONFIG.allowedAudioTypes.includes(mimeType);
};

// Utility function to get file category
export const getFileCategory = (mimeType: string): 'image' | 'video' | 'audio' | 'unknown' => {
  if (isImageFile(mimeType)) return 'image';
  if (isVideoFile(mimeType)) return 'video';
  if (isAudioFile(mimeType)) return 'audio';
  return 'unknown';
};