import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { emailService } from '../services/emailService';

const prisma = new PrismaClient();

export class BookingController {
  // Get all bookings with filtering
  async getAllBookings(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId, status, clientEmail, dateFrom, dateTo, page, limit } = req.query as any;

      // Build where clause for filtering
      const where: any = {};
      
      if (serviceId) {
        where.serviceId = serviceId;
      }
      
      if (status) {
        where.status = status;
      }
      
      if (clientEmail) {
        where.clientEmail = { contains: clientEmail, mode: 'insensitive' };
      }
      
      if (dateFrom || dateTo) {
        where.bookingDate = {};
        if (dateFrom) {
          where.bookingDate.gte = new Date(dateFrom);
        }
        if (dateTo) {
          where.bookingDate.lte = new Date(dateTo);
        }
      }

      // Calculate pagination
      const skip = ((page || 1) - 1) * (limit || 10);

      // Get bookings with pagination and include service information
      const [bookings, totalCount] = await Promise.all([
        prisma.booking.findMany({
          where,
          skip,
          take: limit || 10,
          include: {
            service: {
              select: {
                id: true,
                name: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { bookingDate: 'desc' },
            { startTime: 'desc' }
          ],
        }),
        prisma.booking.count({ where }),
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / (limit || 10));
      const currentPage = page || 1;
      const hasNextPage = currentPage < totalPages;
      const hasPrevPage = currentPage > 1;

      res.status(200).json({
        message: 'Bookings retrieved successfully',
        data: {
          bookings,
          pagination: {
            currentPage,
            totalPages,
            totalCount,
            limit: limit || 10,
            hasNextPage,
            hasPrevPage,
          },
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid query parameters',
          details: error.errors,
        });
        return;
      }

      console.error('Get bookings error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve bookings',
      });
    }
  }

  // Get booking by ID
  async getBookingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Booking ID is required',
        });
        return;
      }

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              basePrice: true,
              priceType: true,
              duration: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      if (!booking) {
        res.status(404).json({
          error: 'Booking not found',
          message: 'Booking with the specified ID does not exist',
        });
        return;
      }

      res.status(200).json({
        message: 'Booking retrieved successfully',
        data: { booking },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid booking ID',
          details: error.errors,
        });
        return;
      }

      console.error('Get booking by ID error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve booking',
      });
    }
  }

  // Create new booking
  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const bookingData = req.body;

      // Validate that the service exists if serviceId is provided
      if (bookingData.serviceId) {
        const service = await prisma.service.findUnique({
          where: { id: bookingData.serviceId },
        });

        if (!service) {
          res.status(400).json({
            error: 'Invalid service',
            message: 'Service with the specified ID does not exist',
          });
          return;
        }

        if (!service.active) {
          res.status(400).json({
            error: 'Service unavailable',
            message: 'The selected service is currently unavailable',
          });
          return;
        }
      }

      // Check for double booking - ensure no overlapping bookings exist
      const startTime = new Date(bookingData.startTime);
      const endTime = new Date(bookingData.endTime);

      const overlappingBookings = await prisma.booking.findMany({
        where: {
          status: { in: ['pending', 'confirmed'] },
          OR: [
            // New booking starts during existing booking
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } },
              ],
            },
            // New booking ends during existing booking
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
            // New booking completely contains existing booking
            {
              AND: [
                { startTime: { gte: startTime } },
                { endTime: { lte: endTime } },
              ],
            },
          ],
        },
      });

      if (overlappingBookings.length > 0) {
        res.status(409).json({
          error: 'Time slot unavailable',
          message: 'The selected time slot conflicts with an existing booking',
          details: {
            conflictingBookings: overlappingBookings.map(booking => ({
              id: booking.id,
              startTime: booking.startTime,
              endTime: booking.endTime,
              status: booking.status,
            })),
          },
        });
        return;
      }

      // Ensure booking is not in the past
      const now = new Date();
      if (startTime <= now) {
        res.status(400).json({
          error: 'Invalid booking time',
          message: 'Cannot create bookings for past dates',
        });
        return;
      }

      const booking = await prisma.booking.create({
        data: {
          ...bookingData,
          startTime,
          endTime,
          bookingDate: new Date(bookingData.bookingDate),
        },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      // TODO: Send confirmation email to client and admin
      // This will be implemented when email service is available

      // Send confirmation emails
      try {
        const emailData = {
          booking: {
            id: booking.id,
            clientName: booking.clientName,
            clientEmail: booking.clientEmail,
            clientPhone: booking.clientPhone,
            bookingDate: booking.bookingDate,
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: booking.status,
            projectDetails: booking.projectDetails,
            budgetRange: booking.budgetRange,
            location: booking.location,
            notes: booking.notes,
          },
          service: booking.service,
        };

        // Send confirmation email to client
        await emailService.sendBookingConfirmation(emailData);
        
        // Send notification email to admin
        await emailService.sendBookingNotificationToAdmin(emailData);
      } catch (emailError) {
        // Log email error but don't fail the booking creation
        console.error('Failed to send booking emails:', emailError);
      }

      res.status(201).json({
        message: 'Booking created successfully',
        data: { booking },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid booking data',
          details: error.errors,
        });
        return;
      }

      console.error('Create booking error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create booking',
      });
    }
  }

  // Update booking
  async updateBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Booking ID is required',
        });
        return;
      }

      // Check if booking exists
      const existingBooking = await prisma.booking.findUnique({
        where: { id },
        include: { service: true },
      });

      if (!existingBooking) {
        res.status(404).json({
          error: 'Booking not found',
          message: 'Booking with the specified ID does not exist',
        });
        return;
      }

      // If updating serviceId, validate that the service exists
      if (updateData.serviceId && updateData.serviceId !== existingBooking.serviceId) {
        const service = await prisma.service.findUnique({
          where: { id: updateData.serviceId },
        });

        if (!service) {
          res.status(400).json({
            error: 'Invalid service',
            message: 'Service with the specified ID does not exist',
          });
          return;
        }

        if (!service.active) {
          res.status(400).json({
            error: 'Service unavailable',
            message: 'The selected service is currently unavailable',
          });
          return;
        }
      }

      // If updating time slots, check for double booking
      if (updateData.startTime || updateData.endTime) {
        const startTime = updateData.startTime ? new Date(updateData.startTime) : existingBooking.startTime;
        const endTime = updateData.endTime ? new Date(updateData.endTime) : existingBooking.endTime;

        // Ensure end time is after start time
        if (endTime <= startTime) {
          res.status(400).json({
            error: 'Invalid time range',
            message: 'End time must be after start time',
          });
          return;
        }

        // Check for overlapping bookings (excluding current booking)
        const overlappingBookings = await prisma.booking.findMany({
          where: {
            id: { not: id },
            status: { in: ['pending', 'confirmed'] },
            OR: [
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gt: startTime } },
                ],
              },
              {
                AND: [
                  { startTime: { lt: endTime } },
                  { endTime: { gte: endTime } },
                ],
              },
              {
                AND: [
                  { startTime: { gte: startTime } },
                  { endTime: { lte: endTime } },
                ],
              },
            ],
          },
        });

        if (overlappingBookings.length > 0) {
          res.status(409).json({
            error: 'Time slot unavailable',
            message: 'The updated time slot conflicts with an existing booking',
            details: {
              conflictingBookings: overlappingBookings.map(booking => ({
                id: booking.id,
                startTime: booking.startTime,
                endTime: booking.endTime,
                status: booking.status,
              })),
            },
          });
          return;
        }
      }

      // Prepare update data with proper date conversion
      const processedUpdateData: any = { ...updateData };
      if (updateData.startTime) {
        processedUpdateData.startTime = new Date(updateData.startTime);
      }
      if (updateData.endTime) {
        processedUpdateData.endTime = new Date(updateData.endTime);
      }
      if (updateData.bookingDate) {
        processedUpdateData.bookingDate = new Date(updateData.bookingDate);
      }

      const booking = await prisma.booking.update({
        where: { id },
        data: processedUpdateData,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      res.status(200).json({
        message: 'Booking updated successfully',
        data: { booking },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid booking data',
          details: error.errors,
        });
        return;
      }

      console.error('Update booking error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update booking',
      });
    }
  }

  // Update booking status
  async updateBookingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!id) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Booking ID is required',
        });
        return;
      }

      // Check if booking exists
      const existingBooking = await prisma.booking.findUnique({
        where: { id },
        include: { service: true },
      });

      if (!existingBooking) {
        res.status(404).json({
          error: 'Booking not found',
          message: 'Booking with the specified ID does not exist',
        });
        return;
      }

      // Validate status transitions
      const validTransitions: Record<string, string[]> = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['completed', 'cancelled'],
        cancelled: [], // Cannot change from cancelled
        completed: [], // Cannot change from completed
      };

      const allowedTransitions = validTransitions[existingBooking.status] || [];
      if (!allowedTransitions.includes(status)) {
        res.status(400).json({
          error: 'Invalid status transition',
          message: `Cannot change booking status from ${existingBooking.status} to ${status}`,
        });
        return;
      }

      const updateData: any = { status };
      if (notes) {
        updateData.notes = notes;
      }

      const booking = await prisma.booking.update({
        where: { id },
        data: updateData,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      // TODO: Send status update email to client
      // This will be implemented when email service is available

      // Send status update email to client
      try {
        const emailData = {
          booking: {
            id: booking.id,
            clientName: booking.clientName,
            clientEmail: booking.clientEmail,
            clientPhone: booking.clientPhone,
            bookingDate: booking.bookingDate,
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: booking.status,
            projectDetails: booking.projectDetails,
            budgetRange: booking.budgetRange,
            location: booking.location,
            notes: booking.notes,
          },
          service: booking.service,
        };

        await emailService.sendBookingStatusUpdate(emailData, existingBooking.status);
      } catch (emailError) {
        // Log email error but don't fail the status update
        console.error('Failed to send status update email:', emailError);
      }

      res.status(200).json({
        message: 'Booking status updated successfully',
        data: { booking },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid status update data',
          details: error.errors,
        });
        return;
      }

      console.error('Update booking status error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update booking status',
      });
    }
  }

  // Delete booking (cancel)
  async deleteBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Booking ID is required',
        });
        return;
      }

      // Check if booking exists
      const existingBooking = await prisma.booking.findUnique({
        where: { id },
      });

      if (!existingBooking) {
        res.status(404).json({
          error: 'Booking not found',
          message: 'Booking with the specified ID does not exist',
        });
        return;
      }

      // Check if booking can be cancelled
      if (existingBooking.status === 'completed') {
        res.status(400).json({
          error: 'Cannot cancel booking',
          message: 'Cannot cancel a completed booking',
        });
        return;
      }

      // Instead of deleting, update status to cancelled
      const booking = await prisma.booking.update({
        where: { id },
        data: { status: 'cancelled' },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      // TODO: Send cancellation email to client
      // This will be implemented when email service is available

      // Send cancellation email to client
      try {
        const emailData = {
          booking: {
            id: booking.id,
            clientName: booking.clientName,
            clientEmail: booking.clientEmail,
            clientPhone: booking.clientPhone,
            bookingDate: booking.bookingDate,
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: booking.status,
            projectDetails: booking.projectDetails,
            budgetRange: booking.budgetRange,
            location: booking.location,
            notes: booking.notes,
          },
          service: booking.service,
        };

        await emailService.sendBookingStatusUpdate(emailData, existingBooking.status);
      } catch (emailError) {
        // Log email error but don't fail the cancellation
        console.error('Failed to send cancellation email:', emailError);
      }

      res.status(200).json({
        message: 'Booking cancelled successfully',
        data: { booking },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid booking ID',
          details: error.errors,
        });
        return;
      }

      console.error('Cancel booking error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to cancel booking',
      });
    }
  }

  // Get availability for a specific date
  async getAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { date, serviceId, duration } = req.query as any;

      if (!date) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Date is required',
        });
        return;
      }

      const targetDate = new Date(date);
      const durationMinutes = duration || 60;

      // Validate date is not in the past
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const requestedDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

      if (requestedDate < today) {
        res.status(400).json({
          error: 'Invalid date',
          message: 'Cannot check availability for past dates',
        });
        return;
      }

      // Get all bookings for the specified date
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const whereClause: any = {
        status: { in: ['pending', 'confirmed'] },
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };

      if (serviceId) {
        whereClause.serviceId = serviceId;
      }

      const existingBookings = await prisma.booking.findMany({
        where: whereClause,
        orderBy: { startTime: 'asc' },
        include: {
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Generate available time slots (9 AM to 6 PM by default)
      const businessHours = {
        start: 9, // 9 AM
        end: 18,  // 6 PM
      };

      const availableSlots: any[] = [];
      const bookedSlots = existingBookings.map(booking => ({
        start: booking.startTime,
        end: booking.endTime,
        bookingId: booking.id,
        service: booking.service,
        status: booking.status,
      }));

      // Generate potential time slots
      for (let hour = businessHours.start; hour < businessHours.end; hour++) {
        for (let minute = 0; minute < 60; minute += 30) { // 30-minute intervals
          const slotStart = new Date(requestedDate);
          slotStart.setHours(hour, minute, 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

          // Skip if slot extends beyond business hours
          if (slotEnd.getHours() > businessHours.end) {
            continue;
          }

          // Check if this slot conflicts with any existing booking
          const hasConflict = bookedSlots.some(booked => {
            return (
              (slotStart >= booked.start && slotStart < booked.end) ||
              (slotEnd > booked.start && slotEnd <= booked.end) ||
              (slotStart <= booked.start && slotEnd >= booked.end)
            );
          });

          availableSlots.push({
            startTime: slotStart,
            endTime: slotEnd,
            available: !hasConflict,
            duration: durationMinutes,
          });
        }
      }

      res.status(200).json({
        message: 'Availability retrieved successfully',
        data: {
          date: requestedDate,
          serviceId: serviceId || null,
          duration: durationMinutes,
          businessHours,
          availableSlots,
          bookedSlots,
          summary: {
            totalSlots: availableSlots.length,
            availableSlots: availableSlots.filter(slot => slot.available).length,
            bookedSlots: bookedSlots.length,
          },
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid availability request',
          details: error.errors,
        });
        return;
      }

      console.error('Get availability error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve availability',
      });
    }
  }

  // Bulk booking operations
  async bulkBookingOperation(req: Request, res: Response): Promise<void> {
    try {
      const { bookingIds, operation, notes } = req.body;

      if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Booking IDs array is required',
        });
        return;
      }

      // Check if all bookings exist
      const existingBookings = await prisma.booking.findMany({
        where: {
          id: { in: bookingIds },
        },
      });

      if (existingBookings.length !== bookingIds.length) {
        const foundIds = existingBookings.map(b => b.id);
        const missingIds = bookingIds.filter(id => !foundIds.includes(id));
        
        res.status(404).json({
          error: 'Bookings not found',
          message: 'Some bookings do not exist',
          details: { missingIds },
        });
        return;
      }

      // Validate status transitions for each booking
      const statusMap: Record<string, string> = {
        confirm: 'confirmed',
        cancel: 'cancelled',
        complete: 'completed',
      };

      const targetStatus = statusMap[operation];
      if (!targetStatus) {
        res.status(400).json({
          error: 'Invalid operation',
          message: 'Operation must be one of: confirm, cancel, complete',
        });
        return;
      }

      // Check if all bookings can transition to the target status
      const invalidTransitions = existingBookings.filter(booking => {
        const validTransitions: Record<string, string[]> = {
          pending: ['confirmed', 'cancelled'],
          confirmed: ['completed', 'cancelled'],
          cancelled: [],
          completed: [],
        };
        const allowedTransitions = validTransitions[booking.status] || [];
        return !allowedTransitions.includes(targetStatus);
      });

      if (invalidTransitions.length > 0) {
        res.status(400).json({
          error: 'Invalid status transitions',
          message: 'Some bookings cannot transition to the target status',
          details: {
            invalidBookings: invalidTransitions.map(b => ({
              id: b.id,
              currentStatus: b.status,
              targetStatus,
            })),
          },
        });
        return;
      }

      // Perform bulk update
      const updateData: any = { status: targetStatus };
      if (notes) {
        updateData.notes = notes;
      }

      const updatedBookings = await prisma.booking.updateMany({
        where: {
          id: { in: bookingIds },
        },
        data: updateData,
      });

      // Get updated bookings with relations
      const bookings = await prisma.booking.findMany({
        where: {
          id: { in: bookingIds },
        },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      res.status(200).json({
        message: `Bulk ${operation} operation completed successfully`,
        data: {
          updatedCount: updatedBookings.count,
          bookings,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid bulk operation data',
          details: error.errors,
        });
        return;
      }

      console.error('Bulk booking operation error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to perform bulk operation',
      });
    }
  }
}

export const bookingController = new BookingController();