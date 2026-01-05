import { Router } from 'express';
import { portfolioController } from '../controllers/portfolioController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createPortfolioItemSchema,
  updatePortfolioItemSchema,
  getPortfolioItemSchema,
  deletePortfolioItemSchema,
  portfolioFiltersSchema,
  createPortfolioMediaSchema,
  updatePortfolioMediaSchema,
  getPortfolioMediaSchema,
  deletePortfolioMediaSchema,
  bulkMediaOperationsSchema,
  uploadMediaSchema,
  featuredPortfolioSchema,
} from '../schemas/portfolio';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PortfolioItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *           enum: [photography, videography, sound]
 *         clientName:
 *           type: string
 *         projectDate:
 *           type: string
 *           format: date-time
 *         featured:
 *           type: boolean
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         media:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PortfolioMedia'
 *     PortfolioMedia:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         portfolioItemId:
 *           type: string
 *         mediaType:
 *           type: string
 *           enum: [image, video, audio]
 *         fileUrl:
 *           type: string
 *         thumbnailUrl:
 *           type: string
 *         fileSize:
 *           type: integer
 *         width:
 *           type: integer
 *         height:
 *           type: integer
 *         durationSeconds:
 *           type: integer
 *         altText:
 *           type: string
 *         sortOrder:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/portfolio:
 *   get:
 *     summary: Get all portfolio items with filtering and search
 *     tags: [Portfolio]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [photography, videography, sound]
 *         description: Filter by portfolio category
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter by featured status
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by project date from
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by project date to
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *       - in: query
 *         name: clientName
 *         schema:
 *           type: string
 *         description: Filter by client name
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, and client name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Portfolio items retrieved successfully
 */
router.get('/', validate(portfolioFiltersSchema), portfolioController.getAllPortfolioItems.bind(portfolioController));

/**
 * @swagger
 * /api/portfolio/featured:
 *   get:
 *     summary: Get featured portfolio items
 *     tags: [Portfolio]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Number of featured items to return
 *     responses:
 *       200:
 *         description: Featured portfolio items retrieved successfully
 */
router.get('/featured', validate(featuredPortfolioSchema), portfolioController.getFeaturedPortfolioItems.bind(portfolioController));

/**
 * @swagger
 * /api/portfolio/category/{category}:
 *   get:
 *     summary: Get portfolio items by category
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [photography, videography, sound]
 *         description: Portfolio category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Portfolio items retrieved successfully
 *       400:
 *         description: Invalid category
 */
router.get('/category/:category', portfolioController.getPortfolioItemsByCategory.bind(portfolioController));

/**
 * @swagger
 * /api/portfolio/{id}:
 *   get:
 *     summary: Get portfolio item by ID
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio item ID
 *     responses:
 *       200:
 *         description: Portfolio item retrieved successfully
 *       404:
 *         description: Portfolio item not found
 */
router.get('/:id', validate(getPortfolioItemSchema), portfolioController.getPortfolioItemById.bind(portfolioController));

/**
 * @swagger
 * /api/portfolio:
 *   post:
 *     summary: Create a new portfolio item (Admin only)
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [photography, videography, sound]
 *               clientName:
 *                 type: string
 *               projectDate:
 *                 type: string
 *                 format: date-time
 *               featured:
 *                 type: boolean
 *                 default: false
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Portfolio item created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Portfolio item already exists
 */
router.post('/', authenticateToken, validate(createPortfolioItemSchema), portfolioController.createPortfolioItem.bind(portfolioController));

/**
 * @swagger
 * /api/portfolio/{id}:
 *   put:
 *     summary: Update portfolio item (Admin only)
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [photography, videography, sound]
 *               clientName:
 *                 type: string
 *               projectDate:
 *                 type: string
 *                 format: date-time
 *               featured:
 *                 type: boolean
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Portfolio item updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Portfolio item not found
 *       409:
 *         description: Portfolio item conflict
 */
router.put('/:id', authenticateToken, validate(updatePortfolioItemSchema), portfolioController.updatePortfolioItem.bind(portfolioController));

/**
 * @swagger
 * /api/portfolio/{id}:
 *   delete:
 *     summary: Delete portfolio item (Admin only)
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio item ID
 *     responses:
 *       200:
 *         description: Portfolio item deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Portfolio item not found
 */
router.delete('/:id', authenticateToken, validate(deletePortfolioItemSchema), portfolioController.deletePortfolioItem.bind(portfolioController));

/**
 * @swagger
 * /api/portfolio/{portfolioItemId}/media:
 *   get:
 *     summary: Get media for portfolio item
 *     tags: [Portfolio Media]
 *     parameters:
 *       - in: path
 *         name: portfolioItemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio item ID
 *     responses:
 *       200:
 *         description: Portfolio media retrieved successfully
 *       404:
 *         description: Portfolio item not found
 */
router.get('/:portfolioItemId/media', validate(getPortfolioMediaSchema), portfolioController.getPortfolioMedia.bind(portfolioController));

/**
 * @swagger
 * /api/portfolio/{portfolioItemId}/media/upload:
 *   post:
 *     summary: Upload media files to portfolio item (Admin only)
 *     tags: [Portfolio Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: portfolioItemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio item ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Media files uploaded successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Portfolio item not found
 */
router.post('/:portfolioItemId/media/upload', authenticateToken, validate(uploadMediaSchema), portfolioController.uploadMedia.bind(portfolioController));

/**
 * @swagger
 * /api/portfolio/media:
 *   post:
 *     summary: Create portfolio media (Admin only)
 *     tags: [Portfolio Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - portfolioItemId
 *               - mediaType
 *               - fileUrl
 *             properties:
 *               portfolioItemId:
 *                 type: string
 *               mediaType:
 *                 type: string
 *                 enum: [image, video, audio]
 *               fileUrl:
 *                 type: string
 *               thumbnailUrl:
 *                 type: string
 *               fileSize:
 *                 type: integer
 *               width:
 *                 type: integer
 *               height:
 *                 type: integer
 *               durationSeconds:
 *                 type: integer
 *               altText:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Portfolio media created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Portfolio item not found
 */
router.post('/media', authenticateToken, validate(createPortfolioMediaSchema), portfolioController.createPortfolioMedia.bind(portfolioController));

/**
 * @swagger
 * /api/portfolio/media/{id}:
 *   put:
 *     summary: Update portfolio media (Admin only)
 *     tags: [Portfolio Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Media ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mediaType:
 *                 type: string
 *                 enum: [image, video, audio]
 *               fileUrl:
 *                 type: string
 *               thumbnailUrl:
 *                 type: string
 *               fileSize:
 *                 type: integer
 *               width:
 *                 type: integer
 *               height:
 *                 type: integer
 *               durationSeconds:
 *                 type: integer
 *               altText:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Portfolio media updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Media not found
 */
router.put('/media/:id', authenticateToken, validate(updatePortfolioMediaSchema), portfolioController.updatePortfolioMedia.bind(portfolioController));

/**
 * @swagger
 * /api/portfolio/media/{id}:
 *   delete:
 *     summary: Delete portfolio media (Admin only)
 *     tags: [Portfolio Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Media ID
 *     responses:
 *       200:
 *         description: Portfolio media deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Media not found
 */
router.delete('/media/:id', authenticateToken, validate(deletePortfolioMediaSchema), portfolioController.deletePortfolioMedia.bind(portfolioController));

/**
 * @swagger
 * /api/portfolio/media/bulk:
 *   post:
 *     summary: Perform bulk operations on portfolio media (Admin only)
 *     tags: [Portfolio Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operation
 *               - mediaIds
 *             properties:
 *               operation:
 *                 type: string
 *                 enum: [delete, update, reorder]
 *               mediaIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               data:
 *                 type: object
 *                 properties:
 *                   mediaType:
 *                     type: string
 *                     enum: [image, video, audio]
 *                   fileUrl:
 *                     type: string
 *                   thumbnailUrl:
 *                     type: string
 *                   fileSize:
 *                     type: integer
 *                   width:
 *                     type: integer
 *                   height:
 *                     type: integer
 *                   durationSeconds:
 *                     type: integer
 *                   altText:
 *                     type: string
 *                   sortOrder:
 *                     type: integer
 *     responses:
 *       200:
 *         description: Bulk operation completed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       404:
 *         description: One or more media items not found
 */
router.post('/media/bulk', authenticateToken, validate(bulkMediaOperationsSchema), portfolioController.bulkMediaOperations.bind(portfolioController));

export default router;