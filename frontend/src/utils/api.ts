import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { ApiResponse, ApiError } from '@/types';

// Retry configuration with exponential backoff
interface RetryConfig {
  retries: number;
  retryDelay: number;
  maxRetryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
  onRetry?: (retryCount: number, error: AxiosError) => void;
}

const defaultRetryConfig: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
  maxRetryDelay: 10000,
  retryCondition: (error: AxiosError) => {
    // Retry on network errors, timeouts, or 5xx server errors
    return !error.response || 
           error.code === 'NETWORK_ERROR' ||
           error.code === 'ECONNABORTED' ||
           (error.response.status >= 500 && error.response.status < 600);
  },
  onRetry: (retryCount, error) => {
    console.log(`Retrying request (attempt ${retryCount}):`, error.message);
  },
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and request ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for correlation
    config.headers['X-Request-ID'] = generateRequestId();
    
    // Add cache-busting headers for development
    if (import.meta.env.DEV) {
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      config.headers['Pragma'] = 'no-cache';
      config.headers['Expires'] = '0';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken,
          });
          
          const { accessToken } = response.data.data;
          localStorage.setItem('authToken', accessToken);
          
          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/admin/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem('authToken');
        window.location.href = '/admin/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Generate unique request ID for correlation
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Exponential backoff delay calculation with jitter
function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 1000; // Add random jitter to prevent thundering herd
  return Math.min(exponentialDelay + jitter, maxDelay);
}

// Check if error is retryable
function isRetryableError(error: AxiosError): boolean {
  // Network errors
  if (!error.response) return true;
  
  // Timeout errors
  if (error.code === 'ECONNABORTED') return true;
  
  // Server errors (5xx)
  if (error.response.status >= 500) return true;
  
  // Rate limiting (429)
  if (error.response.status === 429) return true;
  
  return false;
}

// Enhanced error message extraction
function extractErrorMessage(error: AxiosError): string {
  if (error.response?.data && typeof error.response.data === 'object') {
    const apiError = error.response.data as any;
    if (apiError.message) {
      return apiError.message;
    }
    if (apiError.error) {
      return apiError.error;
    }
  }
  
  if (error.message) {
    return error.message;
  }
  
  switch (error.response?.status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please log in and try again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Service temporarily unavailable. Please try again later.';
    case 503:
      return 'Service maintenance in progress. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

// Enhanced API request wrapper with retry logic and better error handling
export const apiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  config?: AxiosRequestConfig & { retryConfig?: Partial<RetryConfig> }
): Promise<T> => {
  const retryConfig = { ...defaultRetryConfig, ...config?.retryConfig };
  const { retryConfig: _, ...axiosConfig } = config || {};
  
  let lastError: AxiosError | null = null;
  
  for (let attempt = 1; attempt <= retryConfig.retries + 1; attempt++) {
    try {
      const response = await api.request<ApiResponse<T>>({
        method,
        url,
        data,
        ...axiosConfig,
      });
      
      // Success - return the data
      return response.data.data;
    } catch (error) {
      lastError = error as AxiosError;
      
      // Don't retry on last attempt
      if (attempt === retryConfig.retries + 1) {
        break;
      }
      
      // Check if error is retryable
      const shouldRetry = retryConfig.retryCondition 
        ? retryConfig.retryCondition(lastError)
        : isRetryableError(lastError);
      
      if (!shouldRetry) {
        break;
      }
      
      // Call retry callback if provided
      if (retryConfig.onRetry) {
        retryConfig.onRetry(attempt, lastError);
      }
      
      // Wait before retrying with exponential backoff
      const delay = calculateDelay(attempt, retryConfig.retryDelay, retryConfig.maxRetryDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Handle final error
  if (lastError) {
    const errorMessage = extractErrorMessage(lastError);
    const error = new Error(errorMessage);
    
    // Attach additional error information
    (error as any).originalError = lastError;
    (error as any).status = lastError.response?.status;
    (error as any).isNetworkError = !lastError.response;
    (error as any).isRetryable = isRetryableError(lastError);
    
    throw error;
  }
  
  throw new Error('Request failed with unknown error');
};

// Convenience methods with retry support
export const get = <T>(url: string, config?: AxiosRequestConfig & { retryConfig?: Partial<RetryConfig> }) => 
  apiRequest<T>('GET', url, undefined, config);

export const post = <T>(url: string, data?: any, config?: AxiosRequestConfig & { retryConfig?: Partial<RetryConfig> }) => 
  apiRequest<T>('POST', url, data, config);

export const put = <T>(url: string, data?: any, config?: AxiosRequestConfig & { retryConfig?: Partial<RetryConfig> }) => 
  apiRequest<T>('PUT', url, data, config);

export const del = <T>(url: string, config?: AxiosRequestConfig & { retryConfig?: Partial<RetryConfig> }) => 
  apiRequest<T>('DELETE', url, undefined, config);

// Upload file with progress tracking
export const uploadFile = async (
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiRequest('POST', url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
    retryConfig: {
      retries: 1, // Fewer retries for file uploads
    },
  });
};

export default api;