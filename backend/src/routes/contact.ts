import { Router } from 'express';
import {
  createContactInquiry,
  getContactInquiries,
  getContactInquiry,
  updateContactInquiry,
  deleteContactInquiry,
  getContactInquiryStats,
} from '../controllers/contactController';
import { validate } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import {
  contactFormRateLimit,
  contactEndpointRateLimit,
  spamDetection,
  addHoneypotInfo,
} from '../middleware/spamProtection';
import {
  createContactInquirySchema,
  updateContactInquirySchema,
  getContactInquiriesSchema,
  getContactInquirySchema,
  deleteContactInquirySchema,
} from '../schemas/contact';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ContactInquiry:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the contact inquiry
 *         name:
 *           type: string
 *           description: Name of the person making the inquiry
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the person making the inquiry
 *         phone:
 *           type: string
 *           description: Phone number (optional)
 *         subject:
 *           type: string
 *           description: Subject of the inquiry (optional)
 *         message:
 *           type: string
 *           description: The inquiry message
 *         serviceInterest:
 *           type: string
 *           description: Service the person is interested in (optional)
 *         status:
 *           type: string
 *           enum: [new, responded, closed]
 *           description: Current status of the inquiry
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the inquiry was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the inquiry was last updated
 *     
 *     CreateContactInquiryRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - message
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Name of the person making the inquiry
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           description: Email address of the person making the inquiry
 *         phone:
 *           type: string
 *           minLength: 10
 *           maxLength: 20
 *           description: Phone number (optional)
 *         subject:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Subject of the inquiry (optional)
 *         message:
 *           type: string
 *           minLength: 10
 *           maxLength: 2000
 *           description: The inquiry message
 *         serviceInterest:
 *           type: string
 *           maxLength: 100
 *           description: Service the person is interested in (optional)
 *     
 *     UpdateContactInquiryRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [new, responded, closed]
 *           description: New status for the inquiry
 *         notes:
 *           type: string
 *           maxLength: 1000
 *           description: Admin notes (optional)
 */

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit a new contact inquiry
 *     description: Submit a contact form inquiry. Includes spam protection and rate limiting.
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateContactInquiryRequest'
 *     responses:
 *       201:
 *         description: Contact inquiry submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Thank you for your message. We will get back to you within 24 hours."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  contactFormRateLimit,
  spamDetection,
  addHoneypotInfo,
  validate(createContactInquirySchema),
  createContactInquiry
);

/**
 * @swagger
 * /api/contact:
 *   get:
 *     summary: Get all contact inquiries (Admin only)
 *     description: Retrieve a paginated list of contact inquiries with optional filtering
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, responded, closed]
 *         description: Filter by inquiry status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Search term for name, email, subject, message, or service interest
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter inquiries from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter inquiries up to this date
 *     responses:
 *       200:
 *         description: Contact inquiries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ContactInquiry'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalCount:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPreviousPage:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.get(
  '/',
  contactEndpointRateLimit,
  authenticateToken,
  validate(getContactInquiriesSchema),
  getContactInquiries
);

/**
 * @swagger
 * /api/contact/stats:
 *   get:
 *     summary: Get contact inquiry statistics (Admin only)
 *     description: Get statistics about contact inquiries including counts by status
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of inquiries
 *                     byStatus:
 *                       type: object
 *                       properties:
 *                         new:
 *                           type: integer
 *                         responded:
 *                           type: integer
 *                         closed:
 *                           type: integer
 *                     recent:
 *                       type: integer
 *                       description: Number of inquiries in the last 7 days
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/stats',
  contactEndpointRateLimit,
  authenticateToken,
  getContactInquiryStats
);

/**
 * @swagger
 * /api/contact/{id}:
 *   get:
 *     summary: Get a specific contact inquiry (Admin only)
 *     description: Retrieve details of a specific contact inquiry by ID
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact inquiry ID
 *     responses:
 *       200:
 *         description: Contact inquiry retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ContactInquiry'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Contact inquiry not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id',
  contactEndpointRateLimit,
  authenticateToken,
  validate(getContactInquirySchema),
  getContactInquiry
);

/**
 * @swagger
 * /api/contact/{id}:
 *   put:
 *     summary: Update contact inquiry status (Admin only)
 *     description: Update the status of a contact inquiry
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact inquiry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateContactInquiryRequest'
 *     responses:
 *       200:
 *         description: Contact inquiry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contact inquiry updated successfully."
 *                 data:
 *                   $ref: '#/components/schemas/ContactInquiry'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Contact inquiry not found
 *       500:
 *         description: Internal server error
 */
router.put(
  '/:id',
  contactEndpointRateLimit,
  authenticateToken,
  validate(updateContactInquirySchema),
  updateContactInquiry
);

/**
 * @swagger
 * /api/contact/{id}:
 *   delete:
 *     summary: Delete a contact inquiry (Admin only)
 *     description: Permanently delete a contact inquiry
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact inquiry ID
 *     responses:
 *       200:
 *         description: Contact inquiry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contact inquiry deleted successfully."
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Contact inquiry not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  contactEndpointRateLimit,
  authenticateToken,
  validate(deleteContactInquirySchema),
  deleteContactInquiry
);

export default router;