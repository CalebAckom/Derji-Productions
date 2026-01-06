import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PortfolioItem, PortfolioMedia } from '@/types';
import { cn } from '@/utils/cn';
import MediaLightbox from './MediaLightbox';

export interface MediaGalleryProps {
  items: PortfolioItem[];
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  lazy?: boolean;
  onItemClick?: (item: PortfolioItem, mediaIndex?: number) => void;
}

interface MediaItemProps {
  media: PortfolioMedia;
  portfolioItem: PortfolioItem;
  onClick: () => void;
  lazy: boolean;
  inView: boolean;
}

const MediaItem: React.FC<MediaItemProps> = ({ 
  media, 
  portfolioItem, 
  onClick, 
  lazy, 
  inView 
}) => {
  const [loaded, setLoaded] = useState(!lazy);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (inView && !loaded) {
      setLoaded(true);
    }
  }, [inView, loaded]);

  const handleImageLoad = () => {
    setError(false);
  };

  const handleImageError = () => {
    setError(true);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="group relative overflow-hidden rounded-lg cursor-pointer bg-secondary-100"
      onClick={onClick}
    >
      {/* Media Content */}
      {media.mediaType === 'image' && (
        <div className="aspect-square relative">
          {loaded && !error ? (
            <img
              src={media.thumbnailUrl || media.fileUrl}
              alt={media.altText || portfolioItem.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading={lazy ? 'lazy' : 'eager'}
            />
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center bg-secondary-200">
              <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          ) : (
            <div className="w-full h-full bg-secondary-200 animate-pulse" />
          )}
        </div>
      )}

      {media.mediaType === 'video' && (
        <div className="aspect-video relative">
          {loaded && !error ? (
            <>
              {media.thumbnailUrl ? (
                <img
                  src={media.thumbnailUrl}
                  alt={media.altText || portfolioItem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading={lazy ? 'lazy' : 'eager'}
                />
              ) : (
                <div className="w-full h-full bg-secondary-200 flex items-center justify-center">
                  <svg className="w-12 h-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-colors">
                <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-secondary-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              
              {/* Duration badge */}
              {media.durationSeconds && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(media.durationSeconds)}
                </div>
              )}
            </>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center bg-secondary-200">
              <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          ) : (
            <div className="w-full h-full bg-secondary-200 animate-pulse" />
          )}
        </div>
      )}

      {media.mediaType === 'audio' && (
        <div className="aspect-square relative bg-gradient-to-br from-primary-100 to-primary-200">
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <svg className="w-12 h-12 text-primary-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <span className="text-sm text-primary-700 font-medium text-center">
              Audio Track
            </span>
            {media.durationSeconds && (
              <span className="text-xs text-primary-600 mt-1">
                {formatDuration(media.durationSeconds)}
              </span>
            )}
          </div>
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-primary-500 bg-opacity-0 group-hover:bg-opacity-20 transition-colors">
            <div className="w-10 h-10 bg-primary-500 bg-opacity-0 group-hover:bg-opacity-90 rounded-full flex items-center justify-center transition-all">
              <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Hover overlay with info */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-colors flex items-end">
        <div className="w-full p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <h4 className="font-medium text-sm truncate">{portfolioItem.title}</h4>
          {portfolioItem.clientName && (
            <p className="text-xs opacity-90 truncate">{portfolioItem.clientName}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  className,
  columns = 3,
  gap = 'md',
  lazy = true,
  onItemClick,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Flatten all media items with their portfolio context
  const allMediaItems = items.flatMap(item => 
    item.media.map((media, index) => ({
      media,
      portfolioItem: item,
      mediaIndex: index,
      uniqueId: `${item.id}-${media.id}`,
    }))
  );

  // Intersection Observer for lazy loading
  const observeItem = useCallback((element: HTMLDivElement, id: string) => {
    if (!lazy) {
      setVisibleItems(prev => new Set([...prev, id]));
      return;
    }

    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, [lazy]);

  const unobserveItem = useCallback((element: HTMLDivElement) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
    }
  }, []);

  useEffect(() => {
    if (!lazy) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-id');
          if (id && entry.isIntersecting) {
            setVisibleItems(prev => new Set([...prev, id]));
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy]);

  const handleMediaClick = (portfolioItem: PortfolioItem, mediaIndex: number) => {
    if (onItemClick) {
      onItemClick(portfolioItem, mediaIndex);
    } else {
      setSelectedItem(portfolioItem);
      setSelectedMediaIndex(mediaIndex);
      setLightboxOpen(true);
    }
  };

  const handleLightboxClose = () => {
    setLightboxOpen(false);
    setSelectedItem(null);
    setSelectedMediaIndex(0);
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  if (allMediaItems.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <svg className="w-16 h-16 text-secondary-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-secondary-600 mb-2">No media found</h3>
        <p className="text-secondary-500">There are no media items to display in this gallery.</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}>
        {allMediaItems.map(({ media, portfolioItem, mediaIndex, uniqueId }) => (
          <div
            key={uniqueId}
            ref={(el) => {
              if (el) {
                itemRefs.current.set(uniqueId, el);
                observeItem(el, uniqueId);
              } else {
                const existingEl = itemRefs.current.get(uniqueId);
                if (existingEl) {
                  unobserveItem(existingEl);
                  itemRefs.current.delete(uniqueId);
                }
              }
            }}
            data-id={uniqueId}
          >
            <MediaItem
              media={media}
              portfolioItem={portfolioItem}
              onClick={() => handleMediaClick(portfolioItem, mediaIndex)}
              lazy={lazy}
              inView={visibleItems.has(uniqueId)}
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedItem && (
        <MediaLightbox
          isOpen={lightboxOpen}
          onClose={handleLightboxClose}
          portfolioItem={selectedItem}
          initialMediaIndex={selectedMediaIndex}
        />
      )}
    </>
  );
};

export default MediaGallery;