import { useCallback } from 'react';
import { PortfolioItem, PortfolioFilters } from '@/types';
import { useGet, usePost, usePut, useDelete } from './useApi';
import { get, uploadFile } from '@/utils/api';

// Hook for fetching portfolio items
export function usePortfolio(filters?: PortfolioFilters) {
  const queryParams = new URLSearchParams();
  
  if (filters?.category) queryParams.append('category', filters.category);
  if (filters?.featured !== undefined) queryParams.append('featured', filters.featured.toString());
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom.toISOString());
  if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo.toISOString());
  if (filters?.tags && filters.tags.length > 0) {
    filters.tags.forEach(tag => queryParams.append('tags', tag));
  }
  
  const url = `/portfolio${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return useGet<PortfolioItem[]>(url, {
    immediate: true,
    cacheKey: `portfolio_${queryParams.toString()}`,
    cacheDuration: 5 * 60 * 1000, // 5 minutes cache
  });
}

// Hook for fetching a single portfolio item
export function usePortfolioItem(id: string) {
  return useGet<PortfolioItem>(`/portfolio/${id}`, {
    immediate: !!id,
    cacheKey: `portfolio_item_${id}`,
  });
}

// Hook for creating portfolio items (admin)
export function useCreatePortfolioItem() {
  return usePost<Partial<PortfolioItem>, PortfolioItem>('/portfolio', {
    optimistic: false,
  });
}

// Hook for updating portfolio items (admin)
export function useUpdatePortfolioItem(id: string) {
  return usePut<Partial<PortfolioItem>, PortfolioItem>(`/portfolio/${id}`, {
    optimistic: true,
  });
}

// Hook for deleting portfolio items (admin)
export function useDeletePortfolioItem(id: string) {
  return useDelete<void>(`/portfolio/${id}`);
}

// Hook for uploading portfolio media
export function usePortfolioUpload() {
  const uploadMedia = useCallback(async (
    portfolioItemId: string,
    files: File[],
    onProgress?: (progress: number) => void
  ) => {
    const uploadPromises = files.map(file => 
      uploadFile(`/portfolio/${portfolioItemId}/media`, file, onProgress)
    );
    
    return Promise.all(uploadPromises);
  }, []);
  
  return { uploadMedia };
}

// Hook for portfolio search
export function usePortfolioSearch() {
  const searchPortfolio = useCallback(async (query: string, filters?: PortfolioFilters) => {
    const searchFilters = { ...filters, search: query };
    const queryParams = new URLSearchParams();
    
    if (searchFilters.category) queryParams.append('category', searchFilters.category);
    if (searchFilters.featured !== undefined) queryParams.append('featured', searchFilters.featured.toString());
    if (searchFilters.search) queryParams.append('search', searchFilters.search);
    if (searchFilters.tags && searchFilters.tags.length > 0) {
      searchFilters.tags.forEach(tag => queryParams.append('tags', tag));
    }
    
    return get<PortfolioItem[]>(`/portfolio/search?${queryParams.toString()}`);
  }, []);
  
  return { searchPortfolio };
}

// Hook for featured portfolio items
export function useFeaturedPortfolio() {
  return useGet<PortfolioItem[]>('/portfolio/featured', {
    immediate: true,
    cacheKey: 'featured_portfolio',
    cacheDuration: 10 * 60 * 1000, // 10 minutes cache for featured items
  });
}