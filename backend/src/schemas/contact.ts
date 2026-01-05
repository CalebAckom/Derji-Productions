import { z } from 'zod';

// Contact form submission schema
export const createContactInquirySchema = {
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim(),
    email: z.string()
      .email('Please provide a valid email address')
      .max(255, 'Email must not exceed 255 characters')
      .toLowerCase()
      .trim(),
    phone: z.string()
      .min(10, 'Phone number must be at least 10 characters')
      .max(20, 'Phone number must not exceed 20 characters')
      .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number')
      .optional()
      .or(z.literal('')),
    subject: z.string()
      .min(3, 'Subject must be at least 3 characters')
      .max(200, 'Subject must not exceed 200 characters')
      .trim()
      .optional()
      .or(z.literal('')),
    message: z.string()
      .min(10, 'Message must be at least 10 characters')
      .max(2000, 'Message must not exceed 2000 characters')
      .trim(),
    serviceInterest: z.string()
      .max(100, 'Service interest must not exceed 100 characters')
      .trim()
      .optional()
      .or(z.literal('')),
  }),
};

// Update contact inquiry status schema (admin only)
export const updateContactInquirySchema = {
  params: z.object({
    id: z.string().cuid('Invalid inquiry ID format'),
  }),
  body: z.object({
    status: z.enum(['new', 'responded', 'closed'], {
      errorMap: () => ({ message: 'Status must be one of: new, responded, closed' }),
    }),
    notes: z.string()
      .max(1000, 'Notes must not exceed 1000 characters')
      .trim()
      .optional(),
  }),
};

// Get contact inquiries query schema (admin only)
export const getContactInquiriesSchema = {
  query: z.object({
    status: z.enum(['new', 'responded', 'closed']).optional(),
    page: z.string()
      .regex(/^\d+$/, 'Page must be a positive number')
      .transform(Number)
      .refine(val => val > 0, 'Page must be greater than 0')
      .optional()
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a positive number')
      .transform(Number)
      .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
      .optional()
      .default('20'),
    search: z.string()
      .max(100, 'Search term must not exceed 100 characters')
      .trim()
      .optional(),
    dateFrom: z.string()
      .datetime('Invalid date format')
      .optional(),
    dateTo: z.string()
      .datetime('Invalid date format')
      .optional(),
  }),
};

// Get single contact inquiry schema (admin only)
export const getContactInquirySchema = {
  params: z.object({
    id: z.string().cuid('Invalid inquiry ID format'),
  }),
};

// Delete contact inquiry schema (admin only)
export const deleteContactInquirySchema = {
  params: z.object({
    id: z.string().cuid('Invalid inquiry ID format'),
  }),
};