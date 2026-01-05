import { z } from 'zod';

// Portfolio category enum
export const PortfolioCategory = z.enum(['photography', 'videography', 'sound']);

// Media type enum
export const MediaType = z.enum(['image', 'video', 'audio']);

// Base portfolio item schema
export const portfolioItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  category: PortfolioCategory,
  clientName: z.string().max(255, 'Client name too long').optional(),
  projectDate: z.string().datetime().optional().or(z.date().optional()),
  featured: z.boolean().default(false),
  tags: z.array(z.string().max(50, 'Tag too long')).max(20, 'Too many tags').optional(),
});

// Portfolio media schema
export const portfolioMediaSchema = z.object({
  portfolioItemId: z.string().min(1, 'Portfolio item ID is required'),
  mediaType: MediaType,
  fileUrl: z.string().url('Invalid file URL'),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
  fileSize: z.number().int().min(0, 'File size must be non-negative').optional(),
  width: z.number().int().min(1, 'Width must be positive').optional(),
  height: z.number().int().min(1, 'Height must be positive').optional(),
  durationSeconds: z.number().min(0, 'Duration must be non-negative').optional(),
  altText: z.string().max(255, 'Alt text too long').optional(),
  sortOrder: z.number().int().min(0, 'Sort order must be non-negative').default(0),
});

// Bulk operation schema
export const bulkMediaOperationSchema = z.object({
  operation: z.enum(['delete', 'update', 'reorder']),
  mediaIds: z.array(z.string().min(1, 'Media ID is required')).min(1, 'At least one media ID required'),
  data: z.object({
    mediaType: MediaType.optional(),
    fileUrl: z.string().url('Invalid file URL').optional(),
    thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
    fileSize: z.number().int().min(0, 'File size must be non-negative').optional(),
    width: z.number().int().min(1, 'Width must be positive').optional(),
    height: z.number().int().min(1, 'Height must be positive').optional(),
    durationSeconds: z.number().min(0, 'Duration must be non-negative').optional(),
    altText: z.string().max(255, 'Alt text too long').optional(),
    sortOrder: z.number().int().min(0, 'Sort order must be non-negative').optional(),
  }).optional(),
});

// Create portfolio item schema
export const createPortfolioItemSchema = {
  body: portfolioItemSchema,
};

// Update portfolio item schema
export const updatePortfolioItemSchema = {
  body: portfolioItemSchema.partial(),
  params: z.object({
    id: z.string().min(1, 'Portfolio item ID is required'),
  }),
};

// Get portfolio item schema
export const getPortfolioItemSchema = {
  params: z.object({
    id: z.string().min(1, 'Portfolio item ID is required'),
  }),
};

// Delete portfolio item schema
export const deletePortfolioItemSchema = {
  params: z.object({
    id: z.string().min(1, 'Portfolio item ID is required'),
  }),
};

// Portfolio filters schema
export const portfolioFiltersSchema = {
  query: z.object({
    category: PortfolioCategory.optional(),
    featured: z.string().transform((val) => val === 'true').optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    tags: z.string().transform((val) => val.split(',').map(tag => tag.trim())).optional(),
    clientName: z.string().optional(),
    search: z.string().optional(),
    page: z.string().transform((val) => parseInt(val, 10)).default('1'),
    limit: z.string().transform((val) => parseInt(val, 10)).default('10'),
  }),
};

// Create portfolio media schema
export const createPortfolioMediaSchema = {
  body: portfolioMediaSchema,
};

// Update portfolio media schema
export const updatePortfolioMediaSchema = {
  body: portfolioMediaSchema.partial().omit({ portfolioItemId: true }),
  params: z.object({
    id: z.string().min(1, 'Media ID is required'),
  }),
};

// Get portfolio media schema
export const getPortfolioMediaSchema = {
  params: z.object({
    portfolioItemId: z.string().min(1, 'Portfolio item ID is required'),
  }),
};

// Delete portfolio media schema
export const deletePortfolioMediaSchema = {
  params: z.object({
    id: z.string().min(1, 'Media ID is required'),
  }),
};

// Bulk media operations schema
export const bulkMediaOperationsSchema = {
  body: bulkMediaOperationSchema,
};

// Upload media schema
export const uploadMediaSchema = {
  params: z.object({
    portfolioItemId: z.string().min(1, 'Portfolio item ID is required'),
  }),
};

// Featured portfolio schema
export const featuredPortfolioSchema = {
  query: z.object({
    limit: z.string().transform((val) => parseInt(val, 10)).default('6'),
  }),
};