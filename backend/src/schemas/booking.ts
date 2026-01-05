import { z } from 'zod';

// Booking status enum
export const BookingStatus = z.enum(['pending', 'confirmed', 'cancelled', 'completed']);

// Base booking schema without refinements
const baseBookingSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(255, 'Client name too long'),
  clientEmail: z.string().email('Invalid email address').max(255, 'Email too long'),
  clientPhone: z.string().max(50, 'Phone number too long').optional(),
  serviceId: z.string().min(1, 'Service ID is required').optional(),
  bookingDate: z.string().datetime('Invalid booking date'),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime('Invalid end time'),
  status: BookingStatus.default('pending'),
  projectDetails: z.string().max(2000, 'Project details too long').optional(),
  budgetRange: z.string().max(50, 'Budget range too long').optional(),
  location: z.string().max(255, 'Location too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
});

// Full booking schema with refinements
export const bookingSchema = baseBookingSchema.refine((data) => {
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);
  return endTime > startTime;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
}).refine((data) => {
  const bookingDate = new Date(data.bookingDate);
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);
  
  // Check if start and end times are on the same day as booking date
  const bookingDateStr = bookingDate.toISOString().split('T')[0];
  const startDateStr = startTime.toISOString().split('T')[0];
  const endDateStr = endTime.toISOString().split('T')[0];
  
  return bookingDateStr === startDateStr && bookingDateStr === endDateStr;
}, {
  message: 'Start and end times must be on the same day as booking date',
  path: ['startTime'],
});

// Create booking schema (without status field)
export const createBookingSchema = {
  body: baseBookingSchema.omit({ status: true }).refine((data) => {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    return endTime > startTime;
  }, {
    message: 'End time must be after start time',
    path: ['endTime'],
  }).refine((data) => {
    const bookingDate = new Date(data.bookingDate);
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    
    // Check if start and end times are on the same day as booking date
    const bookingDateStr = bookingDate.toISOString().split('T')[0];
    const startDateStr = startTime.toISOString().split('T')[0];
    const endDateStr = endTime.toISOString().split('T')[0];
    
    return bookingDateStr === startDateStr && bookingDateStr === endDateStr;
  }, {
    message: 'Start and end times must be on the same day as booking date',
    path: ['startTime'],
  }),
};

// Update booking schema (partial updates allowed)
export const updateBookingSchema = {
  body: baseBookingSchema.partial(),
  params: z.object({
    id: z.string().min(1, 'Booking ID is required'),
  }),
};

// Get booking by ID schema
export const getBookingSchema = {
  params: z.object({
    id: z.string().min(1, 'Booking ID is required'),
  }),
};

// Delete booking schema
export const deleteBookingSchema = {
  params: z.object({
    id: z.string().min(1, 'Booking ID is required'),
  }),
};

// Booking filters schema
export const bookingFiltersSchema = {
  query: z.object({
    serviceId: z.string().optional(),
    status: z.string().optional(),
    clientEmail: z.string().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    page: z.string().transform((val) => parseInt(val, 10)).default('1'),
    limit: z.string().transform((val) => parseInt(val, 10)).default('10'),
  }),
};

// Availability check schema
export const availabilitySchema = {
  query: z.object({
    date: z.string().datetime('Invalid date format'),
    serviceId: z.string().optional(),
    duration: z.string().transform((val) => parseInt(val, 10)).default('60'), // Default 1 hour
  }),
};

// Update booking status schema
export const updateBookingStatusSchema = {
  params: z.object({
    id: z.string().min(1, 'Booking ID is required'),
  }),
  body: z.object({
    status: BookingStatus,
    notes: z.string().max(1000, 'Notes too long').optional(),
  }),
};

// Bulk booking operations schema
export const bulkBookingOperationSchema = {
  body: z.object({
    bookingIds: z.array(z.string().min(1, 'Booking ID is required')).min(1, 'At least one booking ID is required'),
    operation: z.enum(['confirm', 'cancel', 'complete']),
    notes: z.string().max(1000, 'Notes too long').optional(),
  }),
};