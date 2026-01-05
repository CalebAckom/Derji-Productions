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

/**
 * @swagger
 * components:
 *   schemas:
 *     FileUploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: Unique file identifier/key
 *             url:
 *               type: string
 *               description: Public URL to access the file
 *             thumbnailUrl:
 *               type: string
 *               description: URL to the generated thumbnail (if applicable)
 *             filename:
 *               type: string
 *               description: Original filename
 *             mimeType:
 *               type: string
 *               description: File MIME type
 *             fileSize:
 *               type: number
 *               description: File size in bytes
 *             dimensions:
 *               type: object
 *               properties:
 *                 width:
 *                   type: number
 *                 height:
 *                   type: number
 *               description: Image dimensions (for image files)
 *             category:
 *               type: string
 *               enum: [image, video, audio, unknown]
 *               description: File category based on MIME type
 *             uploadedAt:
 *               type: string
 *               format: date-time
 *               description: Upload timestamp
 *     BulkUploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             uploaded:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FileUploadResponse/properties/data'
 *             failed:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   filename:
 *                     type: string
 *                   error:
 *                     type: string
 *             summary:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                 successful:
 *                   type: number
 *                 failed:
 *                   type: number
 *     SignedUrlResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             signedUrl:
 *               type: string
 *               description: Pre-signed URL for secure file access
 *             expiresIn:
 *               type: number
 *               description: URL expiration time in seconds
 *             generatedAt:
 *               type: string
 *               format: date-time
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *             message:
 *               type: string
 *             timestamp:
 *               type: string
 *               format: date-time
 *             requestId:
 *               type: string
 */

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: Upload a single file
 *     description: Upload a single file with automatic optimization, thumbnail generation, and security validation
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (images, videos, or audio)
 *               width:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10000
 *                 description: Target width for image optimization (optional)
 *               height:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10000
 *                 description: Target height for image optimization (optional)
 *               quality:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 85
 *                 description: Image quality (1-100, optional)
 *               format:
 *                 type: string
 *                 enum: [jpeg, png, webp]
 *                 description: Target image format (optional)
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 *       400:
 *         description: Bad request - invalid file or parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       413:
 *         description: File too large - exceeds maximum file size limit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       415:
 *         description: Unsupported media type - file type not allowed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/upload', authenticateToken, uploadSingle('file'), uploadSingleFile);

/**
 * @swagger
 * /api/files/upload/multiple:
 *   post:
 *     summary: Upload multiple files
 *     description: Upload multiple files in a single request with batch processing and individual error handling
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
 *                 description: Array of files to upload (max 10 files)
 *               width:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10000
 *                 description: Target width for image optimization (applies to all images)
 *               height:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10000
 *                 description: Target height for image optimization (applies to all images)
 *               quality:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 85
 *                 description: Image quality (applies to all images)
 *               format:
 *                 type: string
 *                 enum: [jpeg, png, webp]
 *                 description: Target image format (applies to all images)
 *     responses:
 *       201:
 *         description: Files processed successfully (some may have failed individually)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkUploadResponse'
 *       400:
 *         description: Bad request - no files provided or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/upload/multiple', authenticateToken, uploadMultiple('files', 10), uploadMultipleFiles);

/**
 * @swagger
 * /api/files/{key}:
 *   delete:
 *     summary: Delete a file
 *     description: Delete a file and its associated thumbnail from storage
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: File key/ID to delete (URL encoded if contains special characters)
 *         example: "images%2F2026-01-05%2Ffile-id.jpg"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               thumbnailKey:
 *                 type: string
 *                 description: Optional thumbnail key to delete (if different from auto-generated)
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - missing file key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:key', authenticateToken, deleteFile);

/**
 * @swagger
 * /api/files/bulk-delete:
 *   delete:
 *     summary: Delete multiple files
 *     description: Delete multiple files in a single batch operation
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - keys
 *             properties:
 *               keys:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 maxItems: 100
 *                 description: Array of file keys to delete
 *                 example: ["images/2026-01-05/file1.jpg", "videos/2026-01-05/file2.mp4"]
 *     responses:
 *       200:
 *         description: Files deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - missing or invalid keys
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/bulk-delete', authenticateToken, deleteMultipleFiles);

/**
 * @swagger
 * /api/files/{key}/signed-url:
 *   get:
 *     summary: Generate signed URL for private file access
 *     description: Generate a time-limited signed URL for secure access to private files
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: File key/ID (URL encoded if contains special characters)
 *         example: "images%2F2026-01-05%2Ffile-id.jpg"
 *       - in: query
 *         name: expiresIn
 *         schema:
 *           type: integer
 *           minimum: 60
 *           maximum: 604800
 *           default: 3600
 *         description: URL expiration time in seconds (1 minute to 7 days)
 *     responses:
 *       200:
 *         description: Signed URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignedUrlResponse'
 *       400:
 *         description: Bad request - missing file key or invalid expiration time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:key/signed-url', authenticateToken, generateSignedUrl);

/**
 * @swagger
 * /api/files/{key}/info:
 *   get:
 *     summary: Get file information
 *     description: Retrieve metadata and information about a specific file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: File key/ID (URL encoded if contains special characters)
 *         example: "images%2F2026-01-05%2Ffile-id.jpg"
 *     responses:
 *       200:
 *         description: File information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     message:
 *                       type: string
 *       400:
 *         description: Bad request - missing file key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:key/info', authenticateToken, getFileInfo);

export default router;