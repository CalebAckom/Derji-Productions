import { Request, Response } from 'express';
import { fileStorageService, ImageOptimizationOptions } from '../services/fileStorageService';
import logger from '../config/logger';
import { getFileCategory } from '../middleware/fileUpload';

export interface FileUploadRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

/**
 * Upload single file
 */
export const uploadSingleFile = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    
    if (!file) {
      return res.status(400).json({
        error: {
          code: 'NO_FILE',
          message: 'No file provided',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }

    const { buffer, originalname, mimetype } = file;
    
    // Parse optimization options from request body
    const optimizationOptions: ImageOptimizationOptions = {};
    
    if (req.body.width) {
      optimizationOptions.width = parseInt(req.body.width);
    }
    
    if (req.body.height) {
      optimizationOptions.height = parseInt(req.body.height);
    }
    
    if (req.body.quality) {
      optimizationOptions.quality = parseInt(req.body.quality);
    }
    
    if (req.body.format) {
      optimizationOptions.format = req.body.format;
    }

    // Upload file
    const result = await fileStorageService.uploadFile(
      buffer,
      originalname,
      mimetype,
      optimizationOptions
    );

    logger.info(`File uploaded successfully: ${originalname}`, {
      key: result.key,
      size: result.fileSize,
      mimeType: result.mimeType
    });

    res.status(201).json({
      success: true,
      data: {
        id: result.key,
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        filename: originalname,
        mimeType: result.mimeType,
        fileSize: result.fileSize,
        dimensions: result.dimensions,
        category: getFileCategory(result.mimeType),
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Single file upload error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      error: {
        code: 'UPLOAD_FAILED',
        message: errorMessage,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
};

/**
 * Upload multiple files
 */
export const uploadMultipleFiles = async (req: Request, res: Response) => {
  try {
    const files = (req as any).files as Express.Multer.File[] | undefined;
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        error: {
          code: 'NO_FILES',
          message: 'No files provided',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }

    // Parse optimization options from request body
    const optimizationOptions: ImageOptimizationOptions = {};
    
    if (req.body.width) {
      optimizationOptions.width = parseInt(req.body.width);
    }
    
    if (req.body.height) {
      optimizationOptions.height = parseInt(req.body.height);
    }
    
    if (req.body.quality) {
      optimizationOptions.quality = parseInt(req.body.quality);
    }
    
    if (req.body.format) {
      optimizationOptions.format = req.body.format;
    }

    // Upload all files
    const uploadPromises = files.map(async (file) => {
      try {
        const result = await fileStorageService.uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          optimizationOptions
        );

        return {
          success: true,
          data: {
            id: result.key,
            url: result.url,
            thumbnailUrl: result.thumbnailUrl,
            filename: file.originalname,
            mimeType: result.mimeType,
            fileSize: result.fileSize,
            dimensions: result.dimensions,
            category: getFileCategory(result.mimeType),
            uploadedAt: new Date().toISOString()
          }
        };
      } catch (error) {
        logger.error(`Failed to upload file ${file.originalname}:`, error);
        return {
          success: false,
          filename: file.originalname,
          error: error instanceof Error ? error.message : 'Upload failed'
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    logger.info(`Bulk upload completed: ${successful.length} successful, ${failed.length} failed`);

    res.status(201).json({
      success: true,
      data: {
        uploaded: successful.map(r => r.data),
        failed: failed.map(r => ({ filename: r.filename, error: r.error })),
        summary: {
          total: files.length,
          successful: successful.length,
          failed: failed.length
        }
      }
    });
  } catch (error) {
    logger.error('Multiple file upload error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      error: {
        code: 'BULK_UPLOAD_FAILED',
        message: errorMessage,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
};

/**
 * Delete file
 */
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { thumbnailKey } = req.body;

    if (!key) {
      return res.status(400).json({
        error: {
          code: 'MISSING_KEY',
          message: 'File key is required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }

    await fileStorageService.deleteFile(key, thumbnailKey);

    logger.info(`File deleted successfully: ${key}`);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    logger.error('File deletion error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      error: {
        code: 'DELETE_FAILED',
        message: errorMessage,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
};

/**
 * Delete multiple files
 */
export const deleteMultipleFiles = async (req: Request, res: Response) => {
  try {
    const { keys } = req.body;

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({
        error: {
          code: 'MISSING_KEYS',
          message: 'File keys array is required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }

    await fileStorageService.deleteFiles(keys);

    logger.info(`Multiple files deleted successfully: ${keys.length} files`);

    res.status(200).json({
      success: true,
      message: `${keys.length} files deleted successfully`
    });
  } catch (error) {
    logger.error('Multiple file deletion error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      error: {
        code: 'BULK_DELETE_FAILED',
        message: errorMessage,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
};

/**
 * Generate signed URL for private file access
 */
export const generateSignedUrl = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { expiresIn = 3600 } = req.query;

    if (!key) {
      return res.status(400).json({
        error: {
          code: 'MISSING_KEY',
          message: 'File key is required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }

    const signedUrl = await fileStorageService.generateSignedUrl(
      key,
      parseInt(expiresIn as string)
    );

    res.status(200).json({
      success: true,
      data: {
        signedUrl,
        expiresIn: parseInt(expiresIn as string),
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Signed URL generation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      error: {
        code: 'SIGNED_URL_FAILED',
        message: errorMessage,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
};

/**
 * Get file information
 */
export const getFileInfo = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        error: {
          code: 'MISSING_KEY',
          message: 'File key is required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }

    // In a real implementation, you would fetch file metadata from your database
    // For now, we'll return basic information
    res.status(200).json({
      success: true,
      data: {
        key,
        message: 'File info endpoint - implement database lookup for full metadata'
      }
    });
  } catch (error) {
    logger.error('Get file info error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      error: {
        code: 'FILE_INFO_FAILED',
        message: errorMessage,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      }
    });
  }
};