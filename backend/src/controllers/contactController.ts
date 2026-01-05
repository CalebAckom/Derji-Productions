import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';
import { emailService, ContactEmailData } from '../services/emailService';

const prisma = new PrismaClient();

/**
 * Submit a new contact inquiry
 */
export const createContactInquiry = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, phone, subject, message, serviceInterest } = req.body;

    // Create the contact inquiry
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        subject: subject?.trim() || null,
        message: message.trim(),
        serviceInterest: serviceInterest?.trim() || null,
        status: 'new',
      },
    });

    logger.info('Contact inquiry created successfully', {
      inquiryId: inquiry.id,
      email: inquiry.email,
      name: inquiry.name,
      serviceInterest: inquiry.serviceInterest,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      service: 'ContactController',
    });

    // Send notification email to admin (async, don't wait)
    const emailData: ContactEmailData = {
      inquiry: {
        id: inquiry.id,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        subject: inquiry.subject,
        message: inquiry.message,
        serviceInterest: inquiry.serviceInterest,
      },
    };

    emailService.sendContactInquiryNotification(emailData).catch((error) => {
      logger.error('Failed to send contact inquiry notification email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        inquiryId: inquiry.id,
        service: 'ContactController',
      });
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your message. We will get back to you within 24 hours.',
      data: {
        id: inquiry.id,
        status: inquiry.status,
        createdAt: inquiry.createdAt,
      },
    });
  } catch (error) {
    logger.error('Error creating contact inquiry', {
      error: error instanceof Error ? error.message : 'Unknown error',
      email: req.body.email,
      ip: req.ip,
      service: 'ContactController',
    });

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unable to submit your inquiry at this time. Please try again later.',
      },
    });
  }
};

/**
 * Get all contact inquiries (admin only)
 */
export const getContactInquiries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status, page = 1, limit = 20, search, dateFrom, dateTo } = req.query as any;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { serviceInterest: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo as string);
      }
    }

    // Calculate pagination
    const skip = ((page as number) - 1) * (limit as number);

    // Get inquiries and total count
    const [inquiries, totalCount] = await Promise.all([
      prisma.contactInquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit as number,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          subject: true,
          message: true,
          serviceInterest: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.contactInquiry.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / (limit as number));

    logger.info('Contact inquiries retrieved successfully', {
      count: inquiries.length,
      totalCount,
      page,
      limit,
      filters: { status, search, dateFrom, dateTo },
      service: 'ContactController',
    });

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: (page as number) < totalPages,
        hasPreviousPage: (page as number) > 1,
      },
    });
  } catch (error) {
    logger.error('Error retrieving contact inquiries', {
      error: error instanceof Error ? error.message : 'Unknown error',
      service: 'ContactController',
    });

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unable to retrieve contact inquiries.',
      },
    });
  }
};

/**
 * Get a single contact inquiry by ID (admin only)
 */
export const getContactInquiry = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params as { id: string };
  
  try {

    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        message: true,
        serviceInterest: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!inquiry) {
      res.status(404).json({
        error: {
          code: 'INQUIRY_NOT_FOUND',
          message: 'Contact inquiry not found.',
        },
      });
      return;
    }

    logger.info('Contact inquiry retrieved successfully', {
      inquiryId: id,
      service: 'ContactController',
    });

    res.json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    logger.error('Error retrieving contact inquiry', {
      error: error instanceof Error ? error.message : 'Unknown error',
      inquiryId: id,
      service: 'ContactController',
    });

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unable to retrieve contact inquiry.',
      },
    });
  }
};

/**
 * Update contact inquiry status (admin only)
 */
export const updateContactInquiry = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params as { id: string };
  const { status, notes } = req.body as { status: string; notes?: string };
  
  try {

    // Check if inquiry exists
    const existingInquiry = await prisma.contactInquiry.findUnique({
      where: { id },
      select: { id: true, status: true, name: true, email: true },
    });

    if (!existingInquiry) {
      res.status(404).json({
        error: {
          code: 'INQUIRY_NOT_FOUND',
          message: 'Contact inquiry not found.',
        },
      });
      return;
    }

    // Update the inquiry
    const updatedInquiry = await prisma.contactInquiry.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        message: true,
        serviceInterest: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info('Contact inquiry updated successfully', {
      inquiryId: updatedInquiry.id,
      previousStatus: existingInquiry.status,
      newStatus: status,
      notes,
      service: 'ContactController',
    });

    res.json({
      success: true,
      message: 'Contact inquiry updated successfully.',
      data: updatedInquiry,
    });
  } catch (error) {
    logger.error('Error updating contact inquiry', {
      error: error instanceof Error ? error.message : 'Unknown error',
      inquiryId: id,
      service: 'ContactController',
    });

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unable to update contact inquiry.',
      },
    });
  }
};

/**
 * Delete a contact inquiry (admin only)
 */
export const deleteContactInquiry = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params as { id: string };
  
  try {

    // Check if inquiry exists
    const existingInquiry = await prisma.contactInquiry.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });

    if (!existingInquiry) {
      res.status(404).json({
        error: {
          code: 'INQUIRY_NOT_FOUND',
          message: 'Contact inquiry not found.',
        },
      });
      return;
    }

    // Delete the inquiry
    await prisma.contactInquiry.delete({
      where: { id },
    });

    logger.info('Contact inquiry deleted successfully', {
      inquiryId: id,
      name: existingInquiry.name,
      email: existingInquiry.email,
      service: 'ContactController',
    });

    res.json({
      success: true,
      message: 'Contact inquiry deleted successfully.',
    });
  } catch (error) {
    logger.error('Error deleting contact inquiry', {
      error: error instanceof Error ? error.message : 'Unknown error',
      inquiryId: id,
      service: 'ContactController',
    });

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unable to delete contact inquiry.',
      },
    });
  }
};

/**
 * Get contact inquiry statistics (admin only)
 */
export const getContactInquiryStats = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const [
      totalInquiries,
      newInquiries,
      respondedInquiries,
      closedInquiries,
      recentInquiries,
    ] = await Promise.all([
      prisma.contactInquiry.count(),
      prisma.contactInquiry.count({ where: { status: 'new' } }),
      prisma.contactInquiry.count({ where: { status: 'responded' } }),
      prisma.contactInquiry.count({ where: { status: 'closed' } }),
      prisma.contactInquiry.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    const stats = {
      total: totalInquiries,
      byStatus: {
        new: newInquiries,
        responded: respondedInquiries,
        closed: closedInquiries,
      },
      recent: recentInquiries,
    };

    logger.info('Contact inquiry statistics retrieved', {
      stats,
      service: 'ContactController',
    });

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error retrieving contact inquiry statistics', {
      error: error instanceof Error ? error.message : 'Unknown error',
      service: 'ContactController',
    });

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unable to retrieve statistics.',
      },
    });
  }
};