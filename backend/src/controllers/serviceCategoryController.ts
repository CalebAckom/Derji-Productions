import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ServiceCategoryController {
  // Get all service categories
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const { active, includeServices } = req.query as any;

      // Build where clause for filtering
      const where: any = {};
      
      if (active !== undefined) {
        where.active = active === 'true';
      }

      const categories = await prisma.serviceCategory.findMany({
        where,
        include: {
          services: includeServices === 'true' ? {
            where: { active: true },
            select: {
              id: true,
              name: true,
              subcategory: true,
              basePrice: true,
              priceType: true,
              active: true,
            },
          } : false,
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

      res.status(200).json({
        message: 'Service categories retrieved successfully',
        data: { categories },
      });
    } catch (error) {
      console.error('Get service categories error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve service categories',
      });
    }
  }

  // Get category by ID or slug
  async getCategoryByIdOrSlug(req: Request, res: Response): Promise<void> {
    try {
      const { identifier } = req.params;
      const { includeServices } = req.query as any;

      if (!identifier) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Category ID or slug is required',
        });
        return;
      }

      // Try to find by ID first, then by slug
      const category = await prisma.serviceCategory.findFirst({
        where: {
          OR: [
            { id: identifier },
            { slug: identifier },
          ],
        },
        include: {
          services: includeServices === 'true' ? {
            where: { active: true },
            orderBy: [
              { subcategory: 'asc' },
              { name: 'asc' }
            ],
          } : false,
          _count: {
            select: {
              services: {
                where: { active: true },
              },
            },
          },
        },
      });

      if (!category) {
        res.status(404).json({
          error: 'Category not found',
          message: 'Service category with the specified ID or slug does not exist',
        });
        return;
      }

      res.status(200).json({
        message: 'Service category retrieved successfully',
        data: { category },
      });
    } catch (error) {
      console.error('Get service category error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve service category',
      });
    }
  }

  // Create new service category
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryData = req.body;

      // Check if category with same name or slug already exists
      const existingCategory = await prisma.serviceCategory.findFirst({
        where: {
          OR: [
            { name: categoryData.name },
            { slug: categoryData.slug },
          ],
        },
      });

      if (existingCategory) {
        res.status(409).json({
          error: 'Category already exists',
          message: 'A service category with this name or slug already exists',
        });
        return;
      }

      const category = await prisma.serviceCategory.create({
        data: {
          ...categoryData,
          description: categoryData.description || null,
          icon: categoryData.icon || null,
        },
        include: {
          _count: {
            select: {
              services: true,
            },
          },
        },
      });

      res.status(201).json({
        message: 'Service category created successfully',
        data: { category },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid category data',
          details: error.errors,
        });
        return;
      }

      console.error('Create service category error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create service category',
      });
    }
  }

  // Update service category
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Category ID is required',
        });
        return;
      }

      // Check if category exists
      const existingCategory = await prisma.serviceCategory.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        res.status(404).json({
          error: 'Category not found',
          message: 'Service category with the specified ID does not exist',
        });
        return;
      }

      // If updating name or slug, check for conflicts
      if (updateData.name || updateData.slug) {
        const conflictCategory = await prisma.serviceCategory.findFirst({
          where: {
            OR: [
              { name: updateData.name || existingCategory.name },
              { slug: updateData.slug || existingCategory.slug },
            ],
            id: { not: id },
          },
        });

        if (conflictCategory) {
          res.status(409).json({
            error: 'Category conflict',
            message: 'A service category with this name or slug already exists',
          });
          return;
        }
      }

      const category = await prisma.serviceCategory.update({
        where: { id },
        data: {
          ...updateData,
          description: updateData.description !== undefined ? updateData.description || null : undefined,
          icon: updateData.icon !== undefined ? updateData.icon || null : undefined,
        },
        include: {
          _count: {
            select: {
              services: true,
            },
          },
        },
      });

      res.status(200).json({
        message: 'Service category updated successfully',
        data: { category },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid category data',
          details: error.errors,
        });
        return;
      }

      console.error('Update service category error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update service category',
      });
    }
  }

  // Delete service category
  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Category ID is required',
        });
        return;
      }

      // Check if category exists
      const existingCategory = await prisma.serviceCategory.findUnique({
        where: { id },
        include: {
          services: true,
        },
      });

      if (!existingCategory) {
        res.status(404).json({
          error: 'Category not found',
          message: 'Service category with the specified ID does not exist',
        });
        return;
      }

      // Check if category has services
      if (existingCategory.services.length > 0) {
        res.status(409).json({
          error: 'Category has services',
          message: 'Cannot delete category that contains services. Please move or delete services first.',
        });
        return;
      }

      await prisma.serviceCategory.delete({
        where: { id },
      });

      res.status(200).json({
        message: 'Service category deleted successfully',
      });
    } catch (error) {
      console.error('Delete service category error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete service category',
      });
    }
  }

  // Reorder categories
  async reorderCategories(req: Request, res: Response): Promise<void> {
    try {
      const { categoryOrders } = req.body;

      if (!Array.isArray(categoryOrders)) {
        res.status(400).json({
          error: 'Validation error',
          message: 'categoryOrders must be an array of {id, sortOrder} objects',
        });
        return;
      }

      // Update sort orders in a transaction
      await prisma.$transaction(
        categoryOrders.map((item: { id: string; sortOrder: number }) =>
          prisma.serviceCategory.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          })
        )
      );

      res.status(200).json({
        message: 'Service categories reordered successfully',
      });
    } catch (error) {
      console.error('Reorder service categories error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to reorder service categories',
      });
    }
  }
}

export const serviceCategoryController = new ServiceCategoryController();