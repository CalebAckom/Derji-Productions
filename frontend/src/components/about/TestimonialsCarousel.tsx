import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody } from '../ui';

export interface TestimonialData {
  id: string;
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating?: number;
  photoUrl?: string;
  projectType?: string;
  date?: Date;
}

interface TestimonialsCarouselProps {
  testimonials: TestimonialData[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
}

const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  testimonials,
  autoPlay = true,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, testimonials.length, autoPlayInterval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (!testimonials.length) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-secondary-600">No testimonials available.</p>
      </div>
    );
  }

  const currentTestimonial = testimonials[currentIndex];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-secondary-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Testimonial Card */}
      <Card className="relative overflow-hidden">
        <CardBody className="p-8 md:p-12">
          <div className="text-center max-w-4xl mx-auto">
            {/* Quote Icon */}
            <div className="mb-6">
              <svg className="w-12 h-12 text-primary-400 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
              </svg>
            </div>

            {/* Testimonial Content */}
            <blockquote className="text-lg md:text-xl text-secondary-700 mb-8 leading-relaxed">
              "{currentTestimonial.content}"
            </blockquote>

            {/* Rating */}
            {currentTestimonial.rating && (
              <div className="flex justify-center mb-6">
                {renderStars(currentTestimonial.rating)}
              </div>
            )}

            {/* Author Info */}
            <div className="flex items-center justify-center space-x-4">
              {/* Author Photo */}
              <div className="w-16 h-16 rounded-full overflow-hidden">
                {currentTestimonial.photoUrl ? (
                  <img 
                    src={currentTestimonial.photoUrl} 
                    alt={currentTestimonial.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-secondary-200 to-primary-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Author Details */}
              <div className="text-left">
                <h4 className="font-semibold text-secondary-900">{currentTestimonial.name}</h4>
                {currentTestimonial.role && (
                  <p className="text-sm text-secondary-600">
                    {currentTestimonial.role}
                    {currentTestimonial.company && ` at ${currentTestimonial.company}`}
                  </p>
                )}
                {currentTestimonial.projectType && (
                  <p className="text-xs text-primary-600 font-medium">
                    {currentTestimonial.projectType}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {showArrows && testimonials.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full w-10 h-10 p-0"
                aria-label="Previous testimonial"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full w-10 h-10 p-0"
                aria-label="Next testimonial"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </>
          )}
        </CardBody>
      </Card>

      {/* Dots Navigation */}
      {showDots && testimonials.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-primary-600' 
                  : 'bg-secondary-300 hover:bg-secondary-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play Control */}
      {autoPlay && testimonials.length > 1 && (
        <div className="flex justify-center mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAutoPlay}
            className="text-sm"
          >
            {isPlaying ? (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Play
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TestimonialsCarousel;