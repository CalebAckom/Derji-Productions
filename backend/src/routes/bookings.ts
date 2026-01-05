import { Router } from 'express';
import { bookingController } from '../controllers/bookingController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createBookingSchema,
  updateBookingSchema,
  getBookingSchema,
  deleteBookingSchema,
  bookingFiltersSchema,
  availabilitySchema,
  updateBookingStatusSchema,
  bulkBookingOperationSchema,
} from '../schemas/booking';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         clientName:
 *           type: string
 *         clientEmail:
 *           type: string
 *         clientPhone:
 *           type: string
 *         serviceId:
 *           type: string
 *         bookingDate:
 *           type: string
 *           format: date
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *         projectDetails:
 *           type: string
 *         budgetRange:
 *           type: string
 *         location:
 *           type: string
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         service:
 *           $ref: '#/components/schemas/Service'
 *     TimeSlot:
 *       type: object
 *       properties:
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         available:
 *           type: boolean
 *         duration:
 *           type: integer
 *     BookedSlot:
 *       type: object
 *       properties:
 *         start:
 *           type: string
 *           format: date-time
 *         end:
 *           type: string
 *           format: date-time
 *         bookingId:
 *           type: string
 *         service:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /api/bookings/availability:
 *   get:
 *     summary: Get availability for a specific date
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date to check availability for
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: string
 *         description: Filter by specific service ID
 *       - in: query
 *         name: duration
 *         schema:
 *           type: integer
 *           default: 60
 *         description: Duration in minutes for the booking slot
 *     responses:
 *       200:
 *         description: Availability retrieved successfully
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
 *                     date:
 *                       type: string
 *                       format: date
 *                     serviceId:
 *                       type: string
 *                     duration:
 *                       type: integer
 *                     businessHours:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: integer
 *                         end:
 *                           type: integer
 *                     availableSlots:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TimeSlot'
 *                     bookedSlots:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BookedSlot'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalSlots:
 *                           type: integer
 *                         availableSlots:
 *                           type: integer
 *                         bookedSlots:
 *                           type: integer
 *       400:
 *         description: Invalid date or parameters
 */
router.get('/availability', validate(availabilitySchema), bookingController.getAvailability.bind(bookingController));

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings with filtering (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: string
 *         description: Filter by service ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *         description: Filter by booking status
 *       - in: query
 *         name: clientEmail
 *         schema:
 *           type: string
 *         description: Filter by client email
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter bookings from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter bookings to this date
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
 *         description: Bookings retrieved successfully
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
 *                     bookings:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Booking'
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
 *       401:
 *         description: Authentication required
 */
router.get('/', authenticateToken, validate(bookingFiltersSchema), bookingController.getAllBookings.bind(bookingController));

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientName
 *               - clientEmail
 *               - bookingDate
 *               - startTime
 *               - endTime
 *             properties:
 *               clientName:
 *                 type: string
 *                 maxLength: 255
 *               clientEmail:
 *                 type: string
 *                 format: email
 *                 maxLength: 255
 *               clientPhone:
 *                 type: string
 *                 maxLength: 50
 *               serviceId:
 *                 type: string
 *               bookingDate:
 *                 type: string
 *                 format: date-time
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               projectDetails:
 *                 type: string
 *                 maxLength: 2000
 *               budgetRange:
 *                 type: string
 *                 maxLength: 50
 *               location:
 *                 type: string
 *                 maxLength: 255
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Booking created successfully
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
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error or invalid booking time
 *       409:
 *         description: Time slot unavailable (double booking)
 */
router.post('/', validate(createBookingSchema), bookingController.createBooking.bind(bookingController));

/**
 * @swagger
 * /api/bookings/bulk:
 *   post:
 *     summary: Perform bulk operations on bookings (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingIds
 *               - operation
 *             properties:
 *               bookingIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *               operation:
 *                 type: string
 *                 enum: [confirm, cancel, complete]
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Bulk operation completed successfully
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
 *                     updatedCount:
 *                       type: integer
 *                     bookings:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid operation or status transitions
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Some bookings not found
 */
router.post('/bulk', authenticateToken, validate(bulkBookingOperationSchema), bookingController.bulkBookingOperation.bind(bookingController));

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
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
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 */
router.get('/:id', validate(getBookingSchema), bookingController.getBookingById.bind(bookingController));

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: Update booking (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientName:
 *                 type: string
 *                 maxLength: 255
 *               clientEmail:
 *                 type: string
 *                 format: email
 *                 maxLength: 255
 *               clientPhone:
 *                 type: string
 *                 maxLength: 50
 *               serviceId:
 *                 type: string
 *               bookingDate:
 *                 type: string
 *                 format: date-time
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed]
 *               projectDetails:
 *                 type: string
 *                 maxLength: 2000
 *               budgetRange:
 *                 type: string
 *                 maxLength: 50
 *               location:
 *                 type: string
 *                 maxLength: 255
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Booking updated successfully
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
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Time slot unavailable
 */
router.put('/:id', authenticateToken, validate(updateBookingSchema), bookingController.updateBooking.bind(bookingController));

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   put:
 *     summary: Update booking status (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed]
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Booking status updated successfully
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
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Booking not found
 */
router.put('/:id/status', authenticateToken, validate(updateBookingStatusSchema), bookingController.updateBookingStatus.bind(bookingController));

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Cancel booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
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
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Cannot cancel booking
 *       404:
 *         description: Booking not found
 */
router.delete('/:id', validate(deleteBookingSchema), bookingController.deleteBooking.bind(bookingController));

export default router;