import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ServiceController {
  // Get all services with filtering and search
  async getAllServices(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId, categorySlug, subcategory, active, search, priceMin, priceMax, page, limit } = req.query as any;

      // Build where clause for filtering
      const where: any = {};
      
      if (categoryId) {
        where.categoryId = categoryId;
      } else if (categorySlug) {
        // Find category by slug first
        const category = await prisma.serviceCategory.findUnique({
          where: { slug: categorySlug },
        });
        if (category) {
          where.categoryId = category.id;
        } else {
          // If category slug doesn't exist, return empty results
          res.status(200).json({
            message: 'Services retrieved successfully',
            data: {
              services: [],
              pagination: {
                currentPage: page || 1,
                totalPages: 0,
                totalCount: 0,
                limit: limit || 10,
                hasNextPage: false,
                hasPrevPage: false,
              },
            },
          });
          return;
        }
      }
      
      if (subcategory) {
        where.subcategory = subcategory;
      }
      
      if (active !== undefined) {
        where.active = active;
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { subcategory: { contains: search, mode: 'insensitive' } },
        ];
      }
      
      if (priceMin !== undefined || priceMax !== undefined) {
        where.basePrice = {};
        if (priceMin !== undefined) {
          where.basePrice.gte = priceMin;
        }
        if (priceMax !== undefined) {
          where.basePrice.lte = priceMax;
        }
      }

      // Calculate pagination
      const skip = ((page || 1) - 1) * (limit || 10);

      // Get services with pagination and include category information
      const [services, totalCount] = await Promise.all([
        prisma.service.findMany({
          where,
          skip,
          take: limit || 10,
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                icon: true,
              },
            },
          },
          orderBy: [
            { category: { sortOrder: 'asc' } },
            { category: { name: 'asc' } },
            { name: 'asc' }
          ],
        }),
        prisma.service.count({ where }),
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / (limit || 10));
      const currentPage = page || 1;
      const hasNextPage = currentPage < totalPages;
      const hasPrevPage = currentPage > 1;

      res.status(200).json({
        message: 'Services retrieved successfully',
        data: {
          services,
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

      console.error('Get services error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve services',
      });
    }
  }

  // Get services by category
  async getServicesByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categorySlug } = req.params;
      
      if (!categorySlug) {
        res.status(400).json({
          error: 'Invalid category',
          message: 'Category slug is required',
        });
        return;
      }

      // Find category by slug
      const category = await prisma.serviceCategory.findUnique({
        where: { slug: categorySlug },
      });

      if (!category) {
        res.status(404).json({
          error: 'Category not found',
          message: 'Service category with the specified slug does not exist',
        });
        return;
      }

      const services = await prisma.service.findMany({
        where: {
          categoryId: category.id,
          active: true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              icon: true,
            },
          },
        },
        orderBy: [
          { subcategory: 'asc' },
          { name: 'asc' }
        ],
      });

      res.status(200).json({
        message: `${category.name} services retrieved successfully`,
        data: { 
          category,
          services 
        },
      });
    } catch (error) {
      console.error('Get services by category error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve services by category',
      });
    }
  }

  // Get service by ID
  async getServiceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Service ID is required',
        });
        return;
      }

      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              icon: true,
            },
          },
        },
      });

      if (!service) {
        res.status(404).json({
          error: 'Service not found',
          message: 'Service with the specified ID does not exist',
        });
        return;
      }

      res.status(200).json({
        message: 'Service retrieved successfully',
        data: { service },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid service ID',
          details: error.errors,
        });
        return;
      }

      console.error('Get service by ID error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve service',
      });
    }
  }

  // Create new service
  async createService(req: Request, res: Response): Promise<void> {
    try {
      const serviceData = req.body;

      // Validate that the category exists
      const category = await prisma.serviceCategory.findUnique({
        where: { id: serviceData.categoryId },
      });

      if (!category) {
        res.status(400).json({
          error: 'Invalid category',
          message: 'Service category with the specified ID does not exist',
        });
        return;
      }

      // Check if service with same name and category already exists
      const existingService = await prisma.service.findFirst({
        where: {
          name: serviceData.name,
          categoryId: serviceData.categoryId,
        },
      });

      if (existingService) {
        res.status(409).json({
          error: 'Service already exists',
          message: 'A service with this name already exists in the specified category',
        });
        return;
      }

      const service = await prisma.service.create({
        data: {
          ...serviceData,
          subcategory: serviceData.subcategory || null,
          description: serviceData.description || null,
          basePrice: serviceData.basePrice || null,
          duration: serviceData.duration || null,
          features: serviceData.features || null,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              icon: true,
            },
          },
        },
      });

      res.status(201).json({
        message: 'Service created successfully',
        data: { service },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid service data',
          details: error.errors,
        });
        return;
      }

      console.error('Create service error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create service',
      });
    }
  }

  // Update service
  async updateService(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Service ID is required',
        });
        return;
      }

      // Check if service exists
      const existingService = await prisma.service.findUnique({
        where: { id },
        include: { category: true },
      });

      if (!existingService) {
        res.status(404).json({
          error: 'Service not found',
          message: 'Service with the specified ID does not exist',
        });
        return;
      }

      // If updating categoryId, validate that the category exists
      if (updateData.categoryId && updateData.categoryId !== existingService.categoryId) {
        const category = await prisma.serviceCategory.findUnique({
          where: { id: updateData.categoryId },
        });

        if (!category) {
          res.status(400).json({
            error: 'Invalid category',
            message: 'Service category with the specified ID does not exist',
          });
          return;
        }
      }

      // If updating name or category, check for conflicts
      if (updateData.name || updateData.categoryId) {
        const conflictService = await prisma.service.findFirst({
          where: {
            name: updateData.name || existingService.name,
            categoryId: updateData.categoryId || existingService.categoryId,
            id: { not: id },
          },
        });

        if (conflictService) {
          res.status(409).json({
            error: 'Service conflict',
            message: 'A service with this name already exists in the specified category',
          });
          return;
        }
      }

      const service = await prisma.service.update({
        where: { id },
        data: {
          ...updateData,
          subcategory: updateData.subcategory !== undefined ? updateData.subcategory || null : undefined,
          description: updateData.description !== undefined ? updateData.description || null : undefined,
          basePrice: updateData.basePrice !== undefined ? updateData.basePrice || null : undefined,
          duration: updateData.duration !== undefined ? updateData.duration || null : undefined,
          features: updateData.features !== undefined ? updateData.features || null : undefined,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              icon: true,
            },
          },
        },
      });

      res.status(200).json({
        message: 'Service updated successfully',
        data: { service },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid service data',
          details: error.errors,
        });
        return;
      }

      console.error('Update service error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update service',
      });
    }
  }

  // Delete service
  async deleteService(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Service ID is required',
        });
        return;
      }

      // Check if service exists
      const existingService = await prisma.service.findUnique({
        where: { id },
        include: {
          bookings: {
            where: {
              status: { in: ['pending', 'confirmed'] },
            },
          },
        },
      });

      if (!existingService) {
        res.status(404).json({
          error: 'Service not found',
          message: 'Service with the specified ID does not exist',
        });
        return;
      }

      // Check if service has active bookings
      if (existingService.bookings.length > 0) {
        res.status(409).json({
          error: 'Service has active bookings',
          message: 'Cannot delete service with pending or confirmed bookings',
        });
        return;
      }

      await prisma.service.delete({
        where: { id },
      });

      res.status(200).json({
        message: 'Service deleted successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid service ID',
          details: error.errors,
        });
        return;
      }

      console.error('Delete service error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete service',
      });
    }
  }

  // Get service availability
  async getServiceAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { date } = req.query as any;

      if (!id) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Service ID is required',
        });
        return;
      }

      // Check if service exists
      const service = await prisma.service.findUnique({
        where: { id },
      });

      if (!service) {
        res.status(404).json({
          error: 'Service not found',
          message: 'Service with the specified ID does not exist',
        });
        return;
      }

      // Get bookings for the service on the specified date (or all future bookings if no date)
      const whereClause: any = {
        serviceId: id,
        status: { in: ['pending', 'confirmed'] },
      };

      if (date) {
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        
        whereClause.bookingDate = {
          gte: startOfDay,
          lte: endOfDay,
        };
      } else {
        whereClause.bookingDate = {
          gte: new Date(),
        };
      }

      const bookings = await prisma.booking.findMany({
        where: whereClause,
        orderBy: { startTime: 'asc' },
      });

      // Calculate availability based on service status and bookings
      const availability = {
        serviceId: id,
        serviceName: service.name,
        available: service.active,
        restrictions: [] as string[],
        bookedSlots: bookings.map(booking => ({
          date: booking.bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
        })),
      };

      if (!service.active) {
        availability.restrictions.push('Service is currently inactive');
      }

      res.status(200).json({
        message: 'Service availability retrieved successfully',
        data: { availability },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid request parameters',
          details: error.errors,
        });
        return;
      }

      console.error('Get service availability error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve service availability',
      });
    }
  }

  // Get service categories with counts
  async getServiceCategories(_req: Request, res: Response): Promise<void> {
    try {
      const categories = await prisma.serviceCategory.findMany({
        where: { active: true },
        include: {
          _count: {
            select: {
              services: {
                where: { active: true },
              },
            },
          },
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ],
      });

      // Get subcategories for each category
      const categoriesWithSubcategories = await Promise.all(
        categories.map(async (cat) => {
          const subcategories = await prisma.service.groupBy({
            by: ['subcategory'],
            where: {
              categoryId: cat.id,
              active: true,
              subcategory: { not: null },
            },
            _count: {
              subcategory: true,
            },
            orderBy: {
              subcategory: 'asc',
            },
          });

          return {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            icon: cat.icon,
            count: cat._count.services,
            subcategories: subcategories.map(sub => ({
              name: sub.subcategory,
              count: sub._count.subcategory,
            })),
          };
        })
      );

      res.status(200).json({
        message: 'Service categories retrieved successfully',
        data: { categories: categoriesWithSubcategories },
      });
    } catch (error) {
      console.error('Get service categories error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve service categories',
      });
    }
  }
}

export const serviceController = new ServiceController();