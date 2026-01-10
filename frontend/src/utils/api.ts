import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { ApiResponse, ApiError } from '@/types';

// Retry configuration
interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

const defaultRetryConfig: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
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

// Exponential backoff delay calculation
function calculateDelay(attempt: number, baseDelay: number): number {
  return baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
}

// Enhanced API request wrapper with retry logic
export const apiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  config?: AxiosRequestConfig & { retryConfig?: Partial<RetryConfig> }
): Promise<T> => {
  const retryConfig = { ...defaultRetryConfig, ...config?.retryConfig };
  const { retryConfig: _, ...axiosConfig } = config || {};
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retryConfig.retries + 1; attempt++) {
    try {
      const response = await api.request<ApiResponse<T>>({
        method,
        url,
        data,
        ...axiosConfig,
      });
      
      return response.data.data;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on last attempt or if retry condition not met
      if (attempt === retryConfig.retries + 1 || 
          (axios.isAxiosError(error) && retryConfig.retryCondition && !retryConfig.retryCondition(error))) {
        break;
      }
      
      // Wait before retrying with exponential backoff
      if (attempt <= retryConfig.retries) {
        const delay = calculateDelay(attempt, retryConfig.retryDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // Handle final error
  if (lastError && axios.isAxiosError(lastError) && lastError.response?.data) {
    const apiError = lastError.response.data as ApiError;
    throw new Error(apiError.message || apiError.error || 'An error occurred');
  }
  
  throw new Error(lastError?.message || 'Network error occurred');
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