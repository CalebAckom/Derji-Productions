import React from 'react';
import { PortfolioItem as PortfolioItemType } from '@/types';
import { Card, CardBody } from '../ui';
import { cn } from '@/utils/cn';

export interface PortfolioItemProps {
  item: PortfolioItemType;
  onClick?: (item: PortfolioItemType) => void;
  className?: string;
  showDetails?: boolean;
  lazy?: boolean;
}

const PortfolioItem: React.FC<PortfolioItemProps> = ({
  item,
  onClick,
  className,
  showDetails = true,
  lazy = true,
}) => {
  const primaryMedia = item.media?.[0];
  const mediaCount = item.media?.length || 0;

  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'photography':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'videography':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'sound':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
    }).format(new Date(date));
  };

  return (
    <Card
      variant="hover"
      className={cn(
        'group cursor-pointer overflow-hidden',
        onClick && 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300',
        className
      )}
      onClick={handleClick}
    >
      {/* Media Preview */}
      <div className="aspect-square relative overflow-hidden bg-secondary-100">
        {primaryMedia ? (
          <>
            {primaryMedia.mediaType === 'image' && (
              <img
                src={primaryMedia.thumbnailUrl || primaryMedia.fileUrl}
                alt={primaryMedia.altText || item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading={lazy ? 'lazy' : 'eager'}
              />
            )}
            {primaryMedia.mediaType === 'video' && (
              <div className="w-full h-full relative">
                {primaryMedia.thumbnailUrl ? (
                  <img
                    src={primaryMedia.thumbnailUrl}
                    alt={primaryMedia.altText || item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading={lazy ? 'lazy' : 'eager'}
                  />
                ) : (
                  <div className="w-full h-full bg-secondary-200 flex items-center justify-center">
                    <svg className="w-12 h-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-colors">
                  <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-secondary-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            {primaryMedia.mediaType === 'audio' && (
              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-12 h-12 text-primary-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <span className="text-sm text-primary-700 font-medium">Audio</span>
                </div>
              </div>
            )}
            
            {/* Media count badge */}
            {mediaCount > 1 && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                +{mediaCount - 1}
              </div>
            )}
            
            {/* Featured badge */}
            {item.featured && (
              <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-secondary-200 flex items-center justify-center">
            <div className="text-center">
              {getCategoryIcon(item.category)}
              <span className="text-sm text-secondary-600 mt-2 block capitalize">{item.category}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {showDetails && (
        <CardBody className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-secondary-900 line-clamp-2 flex-1">
              {item.title}
            </h3>
            <div className="flex items-center text-primary-600 ml-2 flex-shrink-0">
              {getCategoryIcon(item.category)}
            </div>
          </div>
          
          {item.description && (
            <p className="text-sm text-secondary-600 line-clamp-2 mb-3">
              {item.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-secondary-500">
            <div className="flex items-center space-x-3">
              {item.clientName && (
                <span className="bg-secondary-100 px-2 py-1 rounded-full">
                  {item.clientName}
                </span>
              )}
              <span className="capitalize bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                {item.category}
              </span>
            </div>
            {item.projectDate && (
              <span>{formatDate(item.projectDate)}</span>
            )}
          </div>
          
          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-secondary-100 text-secondary-600 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-xs text-secondary-500">
                  +{item.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </CardBody>
      )}
    </Card>
  );
};

export default PortfolioItem;