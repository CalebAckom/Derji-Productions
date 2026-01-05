import { Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types/auth';
import {
  CreatePortfolioItemData,
  UpdatePortfolioItemData,
  CreatePortfolioMediaData,
  UpdatePortfolioMediaData,
  BulkMediaOperation,
  PaginationResult,
  PortfolioItem,
} from '../types/portfolio';

const prisma = new PrismaClient();

export class PortfolioController {
  // Get all portfolio items with filtering and search
  async getAllPortfolioItems(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters = req.query as any;
      const {
        category,
        featured,
        dateFrom,
        dateTo,
        tags,
        clientName,
        search,
        page = 1,
        limit = 10,
      } = filters;

      // Build where clause for filtering
      const where: any = {};

      if (category) {
        where.category = category;
      }

      if (featured !== undefined) {
        where.featured = featured;
      }

      if (dateFrom || dateTo) {
        where.projectDate = {};
        if (dateFrom) {
          where.projectDate.gte = new Date(dateFrom);
        }
        if (dateTo) {
          where.projectDate.lte = new Date(dateTo);
        }
      }

      if (tags && Array.isArray(tags)) {
        where.tags = {
          path: '$',
          array_contains: tags,
        };
      }

      if (clientName) {
        where.clientName = {
          contains: clientName,
          mode: 'insensitive',
        };
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { clientName: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get portfolio items with pagination and include media
      const [portfolioItems, totalCount] = await Promise.all([
        prisma.portfolioItem.findMany({
          where,
          skip,
          take: limit,
          include: {
            media: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: [
            { featured: 'desc' },
            { projectDate: 'desc' },
            { createdAt: 'desc' },
          ],
        }),
        prisma.portfolioItem.count({ where }),
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const result: PaginationResult<PortfolioItem> = {
        items: portfolioItems as PortfolioItem[],
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
        },
      };

      res.status(200).json({
        message: 'Portfolio items retrieved successfully',
        data: result,
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

      console.error('Get portfolio items error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve portfolio items',
      });
    }
  }

  // Get portfolio item by ID
  async getPortfolioItemById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Portfolio item ID is required',
        });
        return;
      }

      const portfolioItem = await prisma.portfolioItem.findUnique({
        where: { id },
        include: {
          media: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });

      if (!portfolioItem) {
        res.status(404).json({
          error: 'Portfolio item not found',
          message: 'Portfolio item with the specified ID does not exist',
        });
        return;
      }

      res.status(200).json({
        message: 'Portfolio item retrieved successfully',
        data: { portfolioItem },
      });
    } catch (error) {
      console.error('Get portfolio item by ID error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve portfolio item',
      });
    }
  }

  // Create new portfolio item
  async createPortfolioItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const portfolioData: CreatePortfolioItemData = req.body;

      // Check if portfolio item with same title and category already exists
      const existingItem = await prisma.portfolioItem.findFirst({
        where: {
          title: portfolioData.title,
          category: portfolioData.category,
        },
      });

      if (existingItem) {
        res.status(409).json({
          error: 'Portfolio item already exists',
          message: 'A portfolio item with this title already exists in the specified category',
        });
        return;
      }

      const portfolioItem = await prisma.portfolioItem.create({
        data: {
          ...portfolioData,
          projectDate: portfolioData.projectDate ? new Date(portfolioData.projectDate) : null,
        },
        include: {
          media: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });

      // Create content version for tracking
      await this.createContentVersion(portfolioItem.id, portfolioData, req.user?.id);

      res.status(201).json({
        message: 'Portfolio item created successfully',
        data: { portfolioItem },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid portfolio item data',
          details: error.errors,
        });
        return;
      }

      console.error('Create portfolio item error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create portfolio item',
      });
    }
  }

  // Update portfolio item
  async updatePortfolioItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdatePortfolioItemData = req.body;

      if (!id) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Portfolio item ID is required',
        });
        return;
      }

      // Check if portfolio item exists
      const existingItem = await prisma.portfolioItem.findUnique({
        where: { id },
      });

      if (!existingItem) {
        res.status(404).json({
          error: 'Portfolio item not found',
          message: 'Portfolio item with the specified ID does not exist',
        });
        return;
      }

      // Check for title conflicts if updating title or category
      if (updateData.title || updateData.category) {
        const conflictItem = await prisma.portfolioItem.findFirst({
          where: {
            title: updateData.title || existingItem.title,
            category: updateData.category || existingItem.category,
            id: { not: id },
          },
        });

        if (conflictItem) {
          res.status(409).json({
            error: 'Portfolio item conflict',
            message: 'A portfolio item with this title already exists in the specified category',
          });
          return;
        }
      }

      const portfolioItem = await prisma.portfolioItem.update({
        where: { id },
        data: {
          ...updateData,
          projectDate: updateData.projectDate ? new Date(updateData.projectDate) : null,
        },
        include: {
          media: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });

      // Create content version for tracking
      await this.createContentVersion(id, updateData, req.user?.id);

      res.status(200).json({
        message: 'Portfolio item updated successfully',
        data: { portfolioItem },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid portfolio item data',
          details: error.errors,
        });
        return;
      }

      console.error('Update portfolio item error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update portfolio item',
      });
    }
  }

  // Delete portfolio item
  async deletePortfolioItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Portfolio item ID is required',
        });
        return;
      }

      // Check if portfolio item exists
      const existingItem = await prisma.portfolioItem.findUnique({
        where: { id },
        include: {
          media: true,
        },
      });

      if (!existingItem) {
        res.status(404).json({
          error: 'Portfolio item not found',
          message: 'Portfolio item with the specified ID does not exist',
        });
        return;
      }

      // Delete portfolio item (media will be deleted due to cascade)
      await prisma.portfolioItem.delete({
        where: { id },
      });

      res.status(200).json({
        message: 'Portfolio item deleted successfully',
      });
    } catch (error) {
      console.error('Delete portfolio item error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete portfolio item',
      });
    }
  }

  // Get featured portfolio items
  async getFeaturedPortfolioItems(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { limit = 6 } = req.query as any;

      const portfolioItems = await prisma.portfolioItem.findMany({
        where: { featured: true },
        take: limit,
        include: {
          media: {
            orderBy: { sortOrder: 'asc' },
            take: 1, // Only get the first media item for featured display
          },
        },
        orderBy: [
          { projectDate: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      res.status(200).json({
        message: 'Featured portfolio items retrieved successfully',
        data: { portfolioItems },
      });
    } catch (error) {
      console.error('Get featured portfolio items error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve featured portfolio items',
      });
    }
  }

  // Get portfolio items by category
  async getPortfolioItemsByCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const { page = 1, limit = 10 } = req.query as any;

      if (!category || !['photography', 'videography', 'sound'].includes(category)) {
        res.status(400).json({
          error: 'Invalid category',
          message: 'Category must be one of: photography, videography, sound',
        });
        return;
      }

      const skip = (page - 1) * limit;

      const [portfolioItems, totalCount] = await Promise.all([
        prisma.portfolioItem.findMany({
          where: { category },
          skip,
          take: limit,
          include: {
            media: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: [
            { featured: 'desc' },
            { projectDate: 'desc' },
            { createdAt: 'desc' },
          ],
        }),
        prisma.portfolioItem.count({ where: { category } }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const result: PaginationResult<PortfolioItem> = {
        items: portfolioItems as PortfolioItem[],
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
        },
      };

      res.status(200).json({
        message: `${category} portfolio items retrieved successfully`,
        data: result,
      });
    } catch (error) {
      console.error('Get portfolio items by category error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve portfolio items by category',
      });
    }
  }

  // Get media for portfolio item
  async getPortfolioMedia(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { portfolioItemId } = req.params;

      if (!portfolioItemId) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Portfolio item ID is required',
        });
        return;
      }

      // Check if portfolio item exists
      const portfolioItem = await prisma.portfolioItem.findUnique({
        where: { id: portfolioItemId },
      });

      if (!portfolioItem) {
        res.status(404).json({
          error: 'Portfolio item not found',
          message: 'Portfolio item with the specified ID does not exist',
        });
        return;
      }

      const media = await prisma.portfolioMedia.findMany({
        where: { portfolioItemId },
        orderBy: { sortOrder: 'asc' },
      });

      res.status(200).json({
        message: 'Portfolio media retrieved successfully',
        data: { media },
      });
    } catch (error) {
      console.error('Get portfolio media error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve portfolio media',
      });
    }
  }

  // Create portfolio media
  async createPortfolioMedia(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const mediaData: CreatePortfolioMediaData = req.body;

      // Check if portfolio item exists
      const portfolioItem = await prisma.portfolioItem.findUnique({
        where: { id: mediaData.portfolioItemId },
      });

      if (!portfolioItem) {
        res.status(404).json({
          error: 'Portfolio item not found',
          message: 'Portfolio item with the specified ID does not exist',
        });
        return;
      }

      const media = await prisma.portfolioMedia.create({
        data: mediaData,
      });

      res.status(201).json({
        message: 'Portfolio media created successfully',
        data: { media },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid media data',
          details: error.errors,
        });
        return;
      }

      console.error('Create portfolio media error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create portfolio media',
      });
    }
  }

  // Update portfolio media
  async updatePortfolioMedia(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdatePortfolioMediaData = req.body;

      if (!id) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Media ID is required',
        });
        return;
      }

      // Check if media exists
      const existingMedia = await prisma.portfolioMedia.findUnique({
        where: { id },
      });

      if (!existingMedia) {
        res.status(404).json({
          error: 'Media not found',
          message: 'Media with the specified ID does not exist',
        });
        return;
      }

      const media = await prisma.portfolioMedia.update({
        where: { id },
        data: updateData,
      });

      res.status(200).json({
        message: 'Portfolio media updated successfully',
        data: { media },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid media data',
          details: error.errors,
        });
        return;
      }

      console.error('Update portfolio media error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update portfolio media',
      });
    }
  }

  // Delete portfolio media
  async deletePortfolioMedia(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Media ID is required',
        });
        return;
      }

      // Check if media exists
      const existingMedia = await prisma.portfolioMedia.findUnique({
        where: { id },
      });

      if (!existingMedia) {
        res.status(404).json({
          error: 'Media not found',
          message: 'Media with the specified ID does not exist',
        });
        return;
      }

      await prisma.portfolioMedia.delete({
        where: { id },
      });

      res.status(200).json({
        message: 'Portfolio media deleted successfully',
      });
    } catch (error) {
      console.error('Delete portfolio media error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete portfolio media',
      });
    }
  }

  // Bulk operations for media management
  async bulkMediaOperations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { operation, mediaIds, data }: BulkMediaOperation = req.body;

      if (!mediaIds || mediaIds.length === 0) {
        res.status(400).json({
          error: 'Validation error',
          message: 'At least one media ID is required',
        });
        return;
      }

      // Check if all media items exist
      const existingMedia = await prisma.portfolioMedia.findMany({
        where: { id: { in: mediaIds } },
      });

      if (existingMedia.length !== mediaIds.length) {
        res.status(404).json({
          error: 'Media not found',
          message: 'One or more media items do not exist',
        });
        return;
      }

      let result;

      switch (operation) {
        case 'delete':
          result = await prisma.portfolioMedia.deleteMany({
            where: { id: { in: mediaIds } },
          });
          break;

        case 'update':
          if (!data) {
            res.status(400).json({
              error: 'Validation error',
              message: 'Update data is required for update operation',
            });
            return;
          }
          result = await prisma.portfolioMedia.updateMany({
            where: { id: { in: mediaIds } },
            data,
          });
          break;

        case 'reorder':
          if (!data?.sortOrder) {
            res.status(400).json({
              error: 'Validation error',
              message: 'Sort order is required for reorder operation',
            });
            return;
          }
          // Reorder media items
          const updates = mediaIds.map((id, index) =>
            prisma.portfolioMedia.update({
              where: { id },
              data: { sortOrder: data.sortOrder! + index },
            })
          );
          result = await Promise.all(updates);
          break;

        default:
          res.status(400).json({
            error: 'Invalid operation',
            message: 'Operation must be one of: delete, update, reorder',
          });
          return;
      }

      res.status(200).json({
        message: `Bulk ${operation} operation completed successfully`,
        data: { result },
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

      console.error('Bulk media operations error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to perform bulk media operations',
      });
    }
  }

  // Upload media files (placeholder for file upload integration)
  async uploadMedia(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { portfolioItemId } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!portfolioItemId) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Portfolio item ID is required',
        });
        return;
      }

      if (!files || files.length === 0) {
        res.status(400).json({
          error: 'Validation error',
          message: 'At least one file is required',
        });
        return;
      }

      // Check if portfolio item exists
      const portfolioItem = await prisma.portfolioItem.findUnique({
        where: { id: portfolioItemId },
      });

      if (!portfolioItem) {
        res.status(404).json({
          error: 'Portfolio item not found',
          message: 'Portfolio item with the specified ID does not exist',
        });
        return;
      }

      // Process uploaded files (this would integrate with file storage service)
      const uploadedMedia = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file) continue;
        
        // Determine media type based on file mimetype
        let mediaType: 'image' | 'video' | 'audio';
        if (file.mimetype.startsWith('image/')) {
          mediaType = 'image';
        } else if (file.mimetype.startsWith('video/')) {
          mediaType = 'video';
        } else if (file.mimetype.startsWith('audio/')) {
          mediaType = 'audio';
        } else {
          continue; // Skip unsupported file types
        }

        // This would be replaced with actual file upload to S3
        const fileUrl = `/uploads/${file.filename}`;
        const thumbnailUrl = mediaType === 'image' ? fileUrl : null;

        const media = await prisma.portfolioMedia.create({
          data: {
            portfolioItemId,
            mediaType,
            fileUrl,
            thumbnailUrl,
            fileSize: file.size,
            altText: file.originalname,
            sortOrder: i,
          },
        });

        uploadedMedia.push(media);
      }

      res.status(201).json({
        message: 'Media files uploaded successfully',
        data: { media: uploadedMedia },
      });
    } catch (error) {
      console.error('Upload media error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to upload media files',
      });
    }
  }

  // Private helper method to create content version
  private async createContentVersion(
    portfolioItemId: string,
    changes: Record<string, any>,
    userId?: string
  ): Promise<void> {
    try {
      // This would create a content version record for tracking changes
      // For now, we'll skip this as it requires additional schema setup
      console.log('Content version would be created:', {
        portfolioItemId,
        changes,
        userId,
      });
    } catch (error) {
      console.error('Create content version error:', error);
      // Don't throw error as this is not critical for the main operation
    }
  }
}

export const portfolioController = new PortfolioController();