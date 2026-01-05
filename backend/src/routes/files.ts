import { Router } from 'express';
import {
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFile,
  deleteMultipleFiles,
  generateSignedUrl,
  getFileInfo,
} from '../controllers/fileController';
import { uploadSingle, uploadMultiple } from '../middleware/fileUpload';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Upload single file
router.post('/upload', authenticateToken, uploadSingle('file'), uploadSingleFile);

// Upload multiple files
router.post('/upload/multiple', authenticateToken, uploadMultiple('files', 10), uploadMultipleFiles);

// Delete file
router.delete('/:key', authenticateToken, deleteFile);

// Delete multiple files
router.delete('/bulk-delete', authenticateToken, deleteMultipleFiles);

// Generate signed URL
router.get('/:key/signed-url', authenticateToken, generateSignedUrl);

// Get file info
router.get('/:key/info', authenticateToken, getFileInfo);

export default router;