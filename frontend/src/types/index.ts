// Common types for the frontend application

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export interface Service {
  id: string;
  name: string;
  category: 'photography' | 'videography' | 'sound';
  subcategory?: string;
  description?: string;
  basePrice?: number;
  priceType: 'fixed' | 'hourly' | 'package';
  duration?: number;
  features?: string[];
  active: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  category: 'photography' | 'videography' | 'sound';
  clientName?: string;
  projectDate?: Date;
  featured: boolean;
  tags?: string[];
  media: PortfolioMedia[];
}

export interface PortfolioMedia {
  id: string;
  mediaType: 'image' | 'video' | 'audio';
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  altText?: string;
  sortOrder: number;
}

export interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceId?: string;
  service?: Service;
  bookingDate: Date;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  projectDetails?: string;
  budgetRange?: string;
  location?: string;
  notes?: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  serviceInterest?: string;
  status: 'new' | 'responded' | 'closed';
  createdAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  serviceInterest?: string;
}

export interface BookingFormData {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  projectDetails?: string;
  budgetRange?: string;
  location?: string;
  notes?: string;
}

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  subItems?: NavigationItem[];
}

// Filter types
export interface ServiceFilters {
  category?: string;
  subcategory?: string;
  search?: string;
  priceRange?: [number, number];
}

export interface PortfolioFilters {
  category?: string;
  featured?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  search?: string;
}