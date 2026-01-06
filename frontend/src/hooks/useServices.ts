import { useCallback } from 'react';
import { Service, ServiceFilters } from '../types';
import { useGet, usePost, usePut, useDelete } from './useApi';
import { get } from '../utils/api';

// Hook for fetching all services
export function useServices(filters?: ServiceFilters) {
  const queryParams = new URLSearchParams();
  
  if (filters?.categoryId) queryParams.append('categoryId', filters.categoryId);
  if (filters?.categorySlug) queryParams.append('categorySlug', filters.categorySlug);
  if (filters?.subcategory) queryParams.append('subcategory', filters.subcategory);
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.active !== undefined) queryParams.append('active', filters.active.toString());
  if (filters?.priceRange) {
    queryParams.append('minPrice', filters.priceRange[0].toString());
    queryParams.append('maxPrice', filters.priceRange[1].toString());
  }
  
  const url = `/services${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return useGet<Service[]>(url, {
    immediate: true,
    cacheKey: `services_${queryParams.toString()}`,
    cacheDuration: 2 * 60 * 1000, // 2 minutes cache for services
  });
}

// Hook for fetching a single service
export function useService(id: string) {
  return useGet<Service>(`/services/${id}`, {
    immediate: !!id,
    cacheKey: `service_${id}`,
  });
}

// Hook for creating a service (admin)
export function useCreateService() {
  return usePost<Partial<Service>, Service>('/services', {
    optimistic: false, // Don't use optimistic updates for creation
  });
}

// Hook for updating a service (admin)
export function useUpdateService(id: string) {
  return usePut<Partial<Service>, Service>(`/services/${id}`, {
    optimistic: true, // Use optimistic updates for better UX
  });
}

// Hook for deleting a service (admin)
export function useDeleteService(id: string) {
  return useDelete<void>(`/services/${id}`);
}

// Hook for service categories
export function useServiceCategories() {
  return useGet<any[]>('/services/categories', {
    immediate: true,
    cacheKey: 'service_categories',
    cacheDuration: 10 * 60 * 1000, // 10 minutes cache for categories
  });
}

// Custom hook for service search with debouncing
export function useServiceSearch() {
  const searchServices = useCallback(async (query: string, filters?: ServiceFilters) => {
    const searchFilters = { ...filters, search: query };
    const queryParams = new URLSearchParams();
    
    if (searchFilters.categoryId) queryParams.append('categoryId', searchFilters.categoryId);
    if (searchFilters.categorySlug) queryParams.append('categorySlug', searchFilters.categorySlug);
    if (searchFilters.subcategory) queryParams.append('subcategory', searchFilters.subcategory);
    if (searchFilters.search) queryParams.append('search', searchFilters.search);
    if (searchFilters.active !== undefined) queryParams.append('active', searchFilters.active.toString());
    
    return get<Service[]>(`/services/search?${queryParams.toString()}`);
  }, []);
  
  return { searchServices };
}