import { Router } from 'express';
import { serviceController } from '../controllers/serviceController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createServiceSchema,
  updateServiceSchema,
  getServiceSchema,
  deleteServiceSchema,
  serviceFiltersSchema,
  serviceAvailabilitySchema,
} from '../schemas/service';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         category:
 *           type: string
 *         categoryId:
 *           type: string
 *         subcategory:
 *           type: string
 *         description:
 *           type: string
 *         basePrice:
 *           type: number
 *         priceType:
 *           type: string
 *           enum: [fixed, hourly, package]
 *         duration:
 *           type: integer
 *           description: Duration in minutes
 *         features:
 *           type: object
 *         active:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ServiceAvailability:
 *       type: object
 *       properties:
 *         serviceId:
 *           type: string
 *         serviceName:
 *           type: string
 *         available:
 *           type: boolean
 *         restrictions:
 *           type: array
 *           items:
 *             type: string
 *         bookedSlots:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 */

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all services with filtering and search
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by service category ID
 *       - in: query
 *         name: categorySlug
 *         schema:
 *           type: string
 *         description: Filter by service category slug
 *       - in: query
 *         name: subcategory
 *         schema:
 *           type: string
 *         description: Filter by service subcategory
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, description, and subcategory
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: number
 *         description: Maximum price filter
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
 *         description: Services retrieved successfully
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
 *                     services:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Service'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalCount:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 */
router.get('/', validate(serviceFiltersSchema), serviceController.getAllServices.bind(serviceController));

/**
 * @swagger
 * /api/services/categories:
 *   get:
 *     summary: Get service categories with counts
 *     tags: [Services]
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
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           subcategories:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                 count:
 *                                   type: integer
 */
router.get('/categories', serviceController.getServiceCategories.bind(serviceController));

/**
 * @swagger
 * /api/services/category/{categorySlug}:
 *   get:
 *     summary: Get services by category slug
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: categorySlug
 *         required: true
 *         schema:
 *           type: string
 *         description: Service category slug
 *     responses:
 *       200:
 *         description: Services retrieved successfully
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
 *                     services:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Service'
 *       404:
 *         description: Category not found
 */
router.get('/category/:categorySlug', serviceController.getServicesByCategory.bind(serviceController));

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service retrieved successfully
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
 *                     service:
 *                       $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 */
router.get('/:id', validate(getServiceSchema), serviceController.getServiceById.bind(serviceController));

/**
 * @swagger
 * /api/services/{id}/availability:
 *   get:
 *     summary: Get service availability
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Specific date to check availability (optional)
 *     responses:
 *       200:
 *         description: Service availability retrieved successfully
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
 *                     availability:
 *                       $ref: '#/components/schemas/ServiceAvailability'
 *       404:
 *         description: Service not found
 */
router.get('/:id/availability', validate(serviceAvailabilitySchema), serviceController.getServiceAvailability.bind(serviceController));

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create a new service (Admin only)
 *     tags: [Services]
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
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               categoryId:
 *                 type: string
 *                 description: ID of the service category
 *               subcategory:
 *                 type: string
 *               description:
 *                 type: string
 *               basePrice:
 *                 type: number
 *               priceType:
 *                 type: string
 *                 enum: [fixed, hourly, package]
 *                 default: fixed
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *               features:
 *                 type: object
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Service created successfully
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
 *                     service:
 *                       $ref: '#/components/schemas/Service'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Service already exists
 */
router.post('/', authenticateToken, validate(createServiceSchema), serviceController.createService.bind(serviceController));

/**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     summary: Update service (Admin only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               categoryId:
 *                 type: string
 *                 description: ID of the service category
 *               subcategory:
 *                 type: string
 *               description:
 *                 type: string
 *               basePrice:
 *                 type: number
 *               priceType:
 *                 type: string
 *                 enum: [fixed, hourly, package]
 *               duration:
 *                 type: integer
 *               features:
 *                 type: object
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Service updated successfully
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
 *                     service:
 *                       $ref: '#/components/schemas/Service'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Service not found
 *       409:
 *         description: Service conflict
 */
router.put('/:id', authenticateToken, validate(updateServiceSchema), serviceController.updateService.bind(serviceController));

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Delete service (Admin only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Service not found
 *       409:
 *         description: Service has active bookings
 */
router.delete('/:id', authenticateToken, validate(deleteServiceSchema), serviceController.deleteService.bind(serviceController));

export default router;