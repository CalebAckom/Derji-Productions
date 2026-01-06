import React from 'react';
import { cn } from '../../utils/cn';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  label?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ 
    className, 
    size = 'md', 
    color = 'primary',
    label = 'Loading...',
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'spinner-sm',
      md: 'spinner-md',
      lg: 'spinner-lg',
    };

    const colorClasses = {
      primary: 'text-primary-500',
      secondary: 'text-secondary-500',
      white: 'text-white',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'spinner',
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        role="status"
        aria-label={label}
        {...props}
      >
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

// Loading overlay component
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
  message?: string;
}> = ({ 
  isLoading, 
  children, 
  className,
  spinnerSize = 'lg',
  message = 'Loading...'
}) => (
  <div className={cn('relative', className)}>
    {children}
    {isLoading && (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <div className="text-center">
          <Spinner size={spinnerSize} />
          {message && (
            <p className="mt-2 text-sm text-secondary-600">{message}</p>
          )}
        </div>
      </div>
    )}
  </div>
);

// Full page loading component
export const PageLoader: React.FC<{
  message?: string;
  className?: string;
}> = ({ 
  message = 'Loading...', 
  className 
}) => (
  <div className={cn(
    'fixed inset-0 bg-white flex items-center justify-center z-50',
    className
  )}>
    <div className="text-center">
      <div className="mb-4">
        <Spinner size="lg" />
      </div>
      <h2 className="text-xl font-semibold text-secondary-900 mb-2">
        Derji Productions
      </h2>
      <p className="text-secondary-600">{message}</p>
    </div>
  </div>
);

export { Spinner };