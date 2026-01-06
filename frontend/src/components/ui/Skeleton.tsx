import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'title' | 'avatar' | 'image' | 'custom';
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'custom', 
    width, 
    height, 
    rounded = false,
    style,
    ...props 
  }, ref) => {
    const variantClasses = {
      text: 'skeleton-text',
      title: 'skeleton-title',
      avatar: 'skeleton-avatar',
      image: 'skeleton-image',
      custom: 'skeleton',
    };

    const combinedStyle = {
      ...style,
      ...(width && { width }),
      ...(height && { height }),
    };

    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          rounded && 'rounded-full',
          className
        )}
        style={combinedStyle}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Predefined skeleton components for common use cases
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className 
}) => (
  <div className={className}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        variant="text"
        width={index === lines - 1 ? '75%' : '100%'}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('card', className)}>
    <div className="card-body">
      <Skeleton variant="title" className="mb-4" />
      <SkeletonText lines={3} />
      <div className="flex justify-between items-center mt-4">
        <Skeleton width="80px" height="32px" rounded />
        <Skeleton width="100px" height="36px" rounded />
      </div>
    </div>
  </div>
);

export const SkeletonProfile: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center space-x-4', className)}>
    <Skeleton variant="avatar" />
    <div className="flex-1">
      <Skeleton width="120px" height="20px" className="mb-2" />
      <Skeleton width="80px" height="16px" />
    </div>
  </div>
);

export const SkeletonGallery: React.FC<{ 
  items?: number; 
  columns?: number; 
  className?: string 
}> = ({ 
  items = 6, 
  columns = 3, 
  className 
}) => (
  <div className={cn(`grid grid-cols-1 md:grid-cols-${columns} gap-4`, className)}>
    {Array.from({ length: items }).map((_, index) => (
      <Skeleton
        key={index}
        variant="image"
        className="aspect-square"
      />
    ))}
  </div>
);

export { Skeleton };