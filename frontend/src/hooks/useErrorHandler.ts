import { useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { AppError } from '@/types';

export function useErrorHandler() {
  const { addError, handleNetworkError } = useAppContext();

  const handleError = useCallback((error: any, retryAction?: () => void) => {
    console.error('Error caught by error handler:', error);

    // Check if it's a network error
    if (error?.isNetworkError || !navigator.onLine) {
      handleNetworkError(error, retryAction);
      return;
    }

    // Determine error type based on error properties
    let errorType: AppError['type'] = 'unknown';
    let message = 'An unexpected error occurred';
    let recoverable = false;

    if (error?.status) {
      switch (error.status) {
        case 400:
          errorType = 'validation';
          message = error.message || 'Invalid request data';
          break;
        case 401:
          errorType = 'client';
          message = 'Authentication required';
          break;
        case 403:
          errorType = 'client';
          message = 'Access denied';
          break;
        case 404:
          errorType = 'client';
          message = 'Resource not found';
          break;
        case 429:
          errorType = 'server';
          message = 'Too many requests. Please try again later.';
          recoverable = true;
          break;
        case 500:
        case 502:
        case 503:
          errorType = 'server';
          message = error.message || 'Server error occurred';
          recoverable = true;
          break;
        default:
          errorType = 'server';
          message = error.message || 'Server error occurred';
          recoverable = error?.isRetryable || false;
      }
    } else if (error?.message) {
      message = error.message;
      recoverable = error?.isRetryable || false;
    }

    addError({
      type: errorType,
      message,
      details: error?.originalError || error,
      recoverable,
      retryAction,
    });
  }, [addError, handleNetworkError]);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    retryAction?: () => void
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, retryAction || asyncFn);
      throw error; // Re-throw so calling code can handle it if needed
    }
  }, [handleError]);

  const withErrorHandling = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    customRetryAction?: () => void
  ): T => {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error) {
        handleError(error, customRetryAction || (() => fn(...args)));
        throw error;
      }
    }) as T;
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    withErrorHandling,
  };
}

// Hook for handling form errors specifically
export function useFormErrorHandler() {
  const { addError } = useAppContext();

  const handleFormError = useCallback((error: any, fieldName?: string) => {
    let message = 'Form validation failed';
    let details = error;

    if (error?.response?.data?.errors) {
      // Handle validation errors from backend
      const validationErrors = error.response.data.errors;
      if (fieldName && validationErrors[fieldName]) {
        message = validationErrors[fieldName][0] || message;
      } else {
        // Show first validation error
        const firstField = Object.keys(validationErrors)[0];
        message = validationErrors[firstField][0] || message;
      }
      details = validationErrors;
    } else if (error?.message) {
      message = error.message;
    }

    addError({
      type: 'validation',
      message,
      details,
      recoverable: false,
    });
  }, [addError]);

  return { handleFormError };
}

// Hook for handling specific operation errors
export function useOperationErrorHandler(operationName: string) {
  const { setOperationLoading, isOperationLoading } = useAppContext();
  const { handleError } = useErrorHandler();

  const executeOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    retryAction?: () => void
  ): Promise<T | null> => {
    if (isOperationLoading(operationName)) {
      return null; // Prevent duplicate operations
    }

    setOperationLoading(operationName, true);
    
    try {
      const result = await operation();
      return result;
    } catch (error) {
      handleError(error, retryAction || operation);
      return null;
    } finally {
      setOperationLoading(operationName, false);
    }
  }, [operationName, isOperationLoading, setOperationLoading, handleError]);

  return {
    executeOperation,
    isLoading: isOperationLoading(operationName),
  };
}