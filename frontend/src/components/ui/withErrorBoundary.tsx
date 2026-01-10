import React, { ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface WithErrorBoundaryOptions {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const WrappedComponent = (props: P) => {
    const { fallback, onError } = options;

    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
      // Log error for debugging
      console.error(`Error in ${Component.displayName || Component.name}:`, error, errorInfo);
      
      // Call custom error handler if provided
      if (onError) {
        onError(error, errorInfo);
      }
      
      // Send to error reporting service in production
      if (process.env.NODE_ENV === 'production') {
        // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
      }
    };

    const errorFallback = fallback || (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-800 font-medium">
            This component encountered an error
          </span>
        </div>
        <p className="text-red-700 text-sm mt-1">
          Please refresh the page or try again later.
        </p>
      </div>
    );

    return (
      <ErrorBoundary
        fallback={errorFallback}
        onError={handleError}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Specific error boundary components for different sections
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Page Error
            </h2>
            <p className="text-gray-600 mb-6">
              This page encountered an error and couldn't load properly.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error('Page error:', error, errorInfo);
        // Send to error reporting service
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export function SectionErrorBoundary({ 
  children, 
  sectionName 
}: { 
  children: ReactNode;
  sectionName: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-red-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">
              {sectionName} Error
            </h3>
            <p className="text-red-700 text-sm mb-4">
              This section couldn't load properly. Other parts of the page should still work.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-red-800 underline text-sm hover:no-underline"
            >
              Refresh page
            </button>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error(`${sectionName} section error:`, error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export function FormErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <span className="text-yellow-800 font-medium">Form Error</span>
              <p className="text-yellow-700 text-sm">
                The form encountered an error. Please refresh and try again.
              </p>
            </div>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error('Form error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}