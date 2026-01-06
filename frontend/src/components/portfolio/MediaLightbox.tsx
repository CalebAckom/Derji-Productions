import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PortfolioItem } from '@/types';
import { Modal } from '../ui';
import { cn } from '@/utils/cn';

export interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioItem: PortfolioItem;
  initialMediaIndex?: number;
}

const MediaLightbox: React.FC<MediaLightboxProps> = ({
  isOpen,
  onClose,
  portfolioItem,
  initialMediaIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialMediaIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const media = portfolioItem.media || [];
  const currentMedia = media[currentIndex];
  const hasMultipleMedia = media.length > 1;

  // Reset state when modal opens or media changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialMediaIndex);
      setIsLoading(true);
      setError(false);
    }
  }, [isOpen, initialMediaIndex]);

  // Reset loading state when media changes
  useEffect(() => {
    setIsLoading(true);
    setError(false);
  }, [currentIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        goToNext();
        break;
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
    }
  }, [isOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const goToNext = () => {
    if (hasMultipleMedia) {
      setCurrentIndex((prev) => (prev + 1) % media.length);
    }
  };

  const goToPrevious = () => {
    if (hasMultipleMedia) {
      setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    }
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  const handleMediaLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleMediaError = () => {
    setIsLoading(false);
    setError(true);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  if (!currentMedia) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-6xl w-full h-full max-h-screen"
      closeOnBackdropClick={true}
      closeOnEscape={false} // We handle escape manually for better UX
    >
      <div className="bg-black text-white h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black bg-opacity-90">
          <div className="flex-1">
            <h2 className="text-lg font-semibold truncate">{portfolioItem.title}</h2>
            {portfolioItem.clientName && (
              <p className="text-sm text-gray-300">{portfolioItem.clientName}</p>
            )}
          </div>
          
          {/* Media counter */}
          {hasMultipleMedia && (
            <div className="text-sm text-gray-300 mx-4">
              {currentIndex + 1} of {media.length}
            </div>
          )}
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex items-center justify-center relative p-4">
          {/* Navigation arrows */}
          {hasMultipleMedia && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-colors"
                aria-label="Previous media"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-colors"
                aria-label="Next media"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Media content */}
          <div className="max-w-full max-h-full flex items-center justify-center">
            {isLoading && (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}

            {error && (
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-gray-400">Failed to load media</p>
              </div>
            )}

            {/* Image */}
            {currentMedia.mediaType === 'image' && (
              <img
                src={currentMedia.fileUrl}
                alt={currentMedia.altText || portfolioItem.title}
                className={cn(
                  'max-w-full max-h-full object-contain',
                  isLoading && 'hidden'
                )}
                onLoad={handleMediaLoad}
                onError={handleMediaError}
              />
            )}

            {/* Video */}
            {currentMedia.mediaType === 'video' && (
              <video
                ref={videoRef}
                src={currentMedia.fileUrl}
                className={cn(
                  'max-w-full max-h-full',
                  isLoading && 'hidden'
                )}
                controls
                autoPlay
                onLoadedData={handleMediaLoad}
                onError={handleMediaError}
              />
            )}

            {/* Audio */}
            {currentMedia.mediaType === 'audio' && (
              <div className="text-center">
                <div className="w-64 h-64 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <audio
                  ref={audioRef}
                  src={currentMedia.fileUrl}
                  controls
                  className="w-full max-w-md"
                  onLoadedData={handleMediaLoad}
                  onError={handleMediaError}
                />
                {currentMedia.durationSeconds && (
                  <p className="text-sm text-gray-300 mt-2">
                    Duration: {formatDuration(currentMedia.durationSeconds)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer with thumbnails and info */}
        <div className="bg-black bg-opacity-90 p-4">
          {/* Media info */}
          <div className="mb-4">
            {portfolioItem.description && (
              <p className="text-sm text-gray-300 mb-2">{portfolioItem.description}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
              {portfolioItem.projectDate && (
                <span>{formatDate(portfolioItem.projectDate)}</span>
              )}
              <span className="capitalize bg-primary-600 text-white px-2 py-1 rounded-full">
                {portfolioItem.category}
              </span>
              {portfolioItem.tags && portfolioItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {portfolioItem.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-700 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail navigation */}
          {hasMultipleMedia && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {media.map((mediaItem, index) => (
                <button
                  key={mediaItem.id}
                  onClick={() => goToIndex(index)}
                  className={cn(
                    'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                    index === currentIndex
                      ? 'border-primary-500'
                      : 'border-transparent hover:border-gray-500'
                  )}
                >
                  {mediaItem.mediaType === 'image' && (
                    <img
                      src={mediaItem.thumbnailUrl || mediaItem.fileUrl}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {mediaItem.mediaType === 'video' && (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center relative">
                      {mediaItem.thumbnailUrl ? (
                        <img
                          src={mediaItem.thumbnailUrl}
                          alt={`Video thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {mediaItem.mediaType === 'audio' && (
                    <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MediaLightbox;