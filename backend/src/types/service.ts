export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  categoryId: string;
  category?: ServiceCategory; // Optional populated category
  subcategory?: string;
  description?: string;
  basePrice?: number;
  priceType: 'fixed' | 'hourly' | 'package';
  duration?: number; // in minutes
  features?: Record<string, any>;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceData {
  name: string;
  categoryId: string;
  subcategory?: string;
  description?: string;
  basePrice?: number;
  priceType?: 'fixed' | 'hourly' | 'package';
  duration?: number;
  features?: Record<string, any>;
  active?: boolean;
}

export interface UpdateServiceData {
  name?: string;
  categoryId?: string;
  subcategory?: string;
  description?: string;
  basePrice?: number;
  priceType?: 'fixed' | 'hourly' | 'package';
  duration?: number;
  features?: Record<string, any>;
  active?: boolean;
}

export interface ServiceFilters {
  categoryId?: string;
  categorySlug?: string;
  subcategory?: string;
  active?: boolean;
  search?: string;
  priceMin?: number;
  priceMax?: number;
}

export interface ServiceAvailability {
  serviceId: string;
  available: boolean;
  nextAvailableDate?: Date;
  restrictions?: string[];
}

export interface CreateServiceCategoryData {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  active?: boolean;
  sortOrder?: number;
}

export interface UpdateServiceCategoryData {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  active?: boolean;
  sortOrder?: number;
}