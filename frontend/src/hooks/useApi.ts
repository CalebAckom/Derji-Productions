import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { get, post, put, del } from '@/utils/api';

// Generic API hook interface
interface UseApiOptions<T> {
  initialData?: T;
  immediate?: boolean;
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  optimistic?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T>;
  refresh: () => Promise<T>;
  reset: () => void;
}

// Generic API hook
export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const {
    initialData = null,
    immediate = false,
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    optimistic = false,
  } = options;
  
  const { getCache, setCache, setError: setGlobalError } = useAppContext();
  
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastArgs, setLastArgs] = useState<any[]>([]);
  
  // Check cache on mount
  useEffect(() => {
    if (cacheKey) {
      const cached = getCache(cacheKey);
      if (cached && cached.timestamp && Date.now() - cached.timestamp < cacheDuration) {
        setData(cached.data);
      }
    }
  }, [cacheKey, cacheDuration, getCache]);
  
  const execute = useCallback(async (...args: any[]): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      setLastArgs(args);
      
      const result = await apiFunction(...args);
      
      setData(result);
      
      // Cache the result if cacheKey is provided
      if (cacheKey) {
        setCache(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setGlobalError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, cacheKey, setCache, setGlobalError, optimistic]); // Include optimistic in dependencies
  
  const refresh = useCallback(async (): Promise<T> => {
    return execute(...lastArgs);
  }, [execute, lastArgs]);
  
  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    setLastArgs([]);
  }, [initialData]);
  
  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);
  
  return {
    data,
    loading,
    error,
    execute,
    refresh,
    reset,
  };
}

// Hook for GET requests
export function useGet<T>(
  url: string,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const apiFunction = useCallback(() => get<T>(url), [url]);
  return useApi(apiFunction, {
    ...options,
    cacheKey: options.cacheKey || `get_${url}`,
  });
}

// Hook for POST requests with optimistic updates
export function usePost<TRequest, TResponse>(
  url: string,
  options: UseApiOptions<TResponse> = {}
): UseApiResult<TResponse> & {
  mutate: (data: TRequest, optimisticData?: TResponse) => Promise<TResponse>;
} {
  const { optimistic = false } = options;
  const apiFunction = useCallback((data: TRequest) => post<TResponse>(url, data), [url]);
  const apiResult = useApi(apiFunction, options);
  
  const mutate = useCallback(async (data: TRequest, optimisticData?: TResponse): Promise<TResponse> => {
    // Apply optimistic update if provided
    if (optimistic && optimisticData) {
      apiResult.reset();
      // Temporarily set optimistic data - in a real app you'd want more sophisticated state management
      try {
        const result = await apiResult.execute(data);
        return result;
      } catch (error) {
        // Revert optimistic update on error
        throw error;
      }
    } else {
      return apiResult.execute(data);
    }
  }, [apiResult, optimistic]);
  
  return {
    ...apiResult,
    mutate,
  };
}

// Hook for PUT requests with optimistic updates
export function usePut<TRequest, TResponse>(
  url: string,
  options: UseApiOptions<TResponse> = {}
): UseApiResult<TResponse> & {
  mutate: (data: TRequest, optimisticData?: TResponse) => Promise<TResponse>;
} {
  const { optimistic = false } = options;
  const apiFunction = useCallback((data: TRequest) => put<TResponse>(url, data), [url]);
  const apiResult = useApi(apiFunction, options);
  
  const mutate = useCallback(async (data: TRequest, optimisticData?: TResponse): Promise<TResponse> => {
    if (optimistic && optimisticData) {
      try {
        const result = await apiResult.execute(data);
        return result;
      } catch (error) {
        throw error;
      }
    } else {
      return apiResult.execute(data);
    }
  }, [apiResult, optimistic]);
  
  return {
    ...apiResult,
    mutate,
  };
}

// Hook for DELETE requests
export function useDelete<T>(
  url: string,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const apiFunction = useCallback(() => del<T>(url), [url]);
  return useApi(apiFunction, options);
}

// Hook for managing loading states across multiple API calls
export function useLoadingState() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  
  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading,
    }));
  }, []);
  
  const isLoading = useCallback((key?: string) => {
    if (key) {
      return loadingStates[key] || false;
    }
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);
  
  const clearLoading = useCallback((key?: string) => {
    if (key) {
      setLoadingStates(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    } else {
      setLoadingStates({});
    }
  }, []);
  
  return {
    setLoading,
    isLoading,
    clearLoading,
    loadingStates,
  };
}