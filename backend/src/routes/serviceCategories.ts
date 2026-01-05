import { Router } from 'express';
import { serviceCategoryController } from '../controllers/serviceCategoryController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createServiceCategorySchema,
  updateServiceCategorySchema,
  deleteServiceCategorySchema,
} from '../schemas/service';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *         icon:
 *           type: string
 *         active:
 *           type: boolean
 *         sortOrder:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/service-categories:
 *   get:
 *     summary: Get all service categories
 *     tags: [Service Categories]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: includeServices
 *         schema:
 *           type: boolean
 *         description: Include services in response
 *     responses:
 *       200:
 *         description: Service categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ServiceCategory'
 */
router.get('/', serviceCategoryController.getAllCategories.bind(serviceCategoryController));

/**
 * @swagger
 * /api/service-categories/{identifier}:
 *   get:
 *     summary: Get service category by ID or slug
 *     tags: [Service Categories]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID or slug
 *       - in: query
 *         name: includeServices
 *         schema:
 *           type: boolean
 *         description: Include services in response
 *     responses:
 *       200:
 *         description: Service category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       $ref: '#/components/schemas/ServiceCategory'
 *       404:
 *         description: Category not found
 */
router.get('/:identifier', serviceCategoryController.getCategoryByIdOrSlug.bind(serviceCategoryController));

/**
 * @swagger
 * /api/service-categories:
 *   post:
 *     summary: Create a new service category (Admin only)
 *     tags: [Service Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               active:
 *                 type: boolean
 *                 default: true
 *               sortOrder:
 *                 type: integer
 *                 default: 0
 *     responses:
 *       201:
 *         description: Service category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       $ref: '#/components/schemas/ServiceCategory'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Category already exists
 */
router.post('/', authenticateToken, validate(createServiceCategorySchema), serviceCategoryController.createCategory.bind(serviceCategoryController));

/**
 * @swagger
 * /api/service-categories/{id}:
 *   put:
 *     summary: Update service category (Admin only)
 *     tags: [Service Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               active:
 *                 type: boolean
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Service category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       $ref: '#/components/schemas/ServiceCategory'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category conflict
 */
router.put('/:id', authenticateToken, validate(updateServiceCategorySchema), serviceCategoryController.updateCategory.bind(serviceCategoryController));

/**
 * @swagger
 * /api/service-categories/{id}:
 *   delete:
 *     summary: Delete service category (Admin only)
 *     tags: [Service Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Service category deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category has services
 */
router.delete('/:id', authenticateToken, validate(deleteServiceCategorySchema), serviceCategoryController.deleteCategory.bind(serviceCategoryController));

/**
 * @swagger
 * /api/service-categories/reorder:
 *   post:
 *     summary: Reorder service categories (Admin only)
 *     tags: [Service Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryOrders
 *             properties:
 *               categoryOrders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     sortOrder:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Service categories reordered successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 */
router.post('/reorder', authenticateToken, serviceCategoryController.reorderCategories.bind(serviceCategoryController));

export default router;