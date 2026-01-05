import { z } from 'zod';

// Price type enum
export const PriceType = z.enum(['fixed', 'hourly', 'package']);

// Base service category schema
export const serviceCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name too long'),
  slug: z.string().min(1, 'Category slug is required').max(50, 'Category slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description too long').optional(),
  icon: z.string().max(100, 'Icon name too long').optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0, 'Sort order must be non-negative').default(0),
});

// Base service schema
export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(255, 'Service name too long'),
  categoryId: z.string().min(1, 'Category ID is required'),
  subcategory: z.string().max(100, 'Subcategory too long').optional(),
  description: z.string().max(2000, 'Description too long').optional(),
  basePrice: z.number().min(0, 'Price must be non-negative').optional(),
  priceType: PriceType.default('fixed'),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute').optional(),
  features: z.union([z.array(z.string()), z.record(z.any())]).optional(),
  active: z.boolean().default(true),
});

// Service Category schemas
export const createServiceCategorySchema = {
  body: serviceCategorySchema,
};

export const updateServiceCategorySchema = {
  body: serviceCategorySchema.partial(),
  params: z.object({
    id: z.string().min(1, 'Category ID is required'),
  }),
};

export const getServiceCategorySchema = {
  params: z.object({
    id: z.string().min(1, 'Category ID is required'),
  }),
};

export const deleteServiceCategorySchema = {
  params: z.object({
    id: z.string().min(1, 'Category ID is required'),
  }),
};

// Create service schema
export const createServiceSchema = {
  body: serviceSchema,
};

// Update service schema (all fields optional)
export const updateServiceSchema = {
  body: serviceSchema.partial(),
  params: z.object({
    id: z.string().min(1, 'Service ID is required'),
  }),
};

// Get service by ID schema
export const getServiceSchema = {
  params: z.object({
    id: z.string().min(1, 'Service ID is required'),
  }),
};

// Delete service schema
export const deleteServiceSchema = {
  params: z.object({
    id: z.string().min(1, 'Service ID is required'),
  }),
};

// Service filters schema
export const serviceFiltersSchema = {
  query: z.object({
    categoryId: z.string().optional(),
    categorySlug: z.string().optional(),
    subcategory: z.string().optional(),
    active: z.string().transform((val) => val === 'true').optional(),
    search: z.string().optional(),
    priceMin: z.string().transform((val) => parseFloat(val)).optional(),
    priceMax: z.string().transform((val) => parseFloat(val)).optional(),
    page: z.string().transform((val) => parseInt(val, 10)).default('1'),
    limit: z.string().transform((val) => parseInt(val, 10)).default('10'),
  }),
};

// Service availability schema
export const serviceAvailabilitySchema = {
  params: z.object({
    id: z.string().min(1, 'Service ID is required'),
  }),
  query: z.object({
    date: z.string().datetime().optional(),
  }),
};