import React, { useState, useMemo } from 'react';
import { Button, Card, CardBody } from '../components/ui';
import Breadcrumb from '../components/navigation/Breadcrumb';
import { PortfolioItem, MediaGallery, PortfolioFilters } from '../components/portfolio';
import { usePortfolio } from '../hooks/usePortfolio';
import { PortfolioFilters as PortfolioFiltersType } from '../types';

const PortfolioPage: React.FC = () => {
  const [filters, setFilters] = useState<PortfolioFiltersType>({});
  const [viewMode, setViewMode] = useState<'grid' | 'gallery'>('grid');
  
  const { data: portfolioItems, loading, error } = usePortfolio(filters);

  // Extract available tags from portfolio items for filter options
  const availableTags = useMemo(() => {
    if (!portfolioItems) return [];
    const tagSet = new Set<string>();
    portfolioItems.forEach(item => {
      item.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [portfolioItems]);

  const handleFiltersChange = (newFilters: PortfolioFiltersType) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-8">
      <Breadcrumb />
      
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center py-16 bg-gradient-to-br from-secondary-50 to-primary-50 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-circuit-pattern opacity-5"></div>
          <div className="relative z-10">
            <h1 className="heading-hero text-secondary-900 mb-6">Our Portfolio</h1>
            <p className="body-large text-secondary-600 max-w-3xl mx-auto">
              Explore our collection of professional work showcasing the quality and creativity we bring to every project.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section>
          <PortfolioFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            availableTags={availableTags}
            className="mb-8"
          />

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-secondary-600">View:</span>
              <Button
                variant={viewMode === 'grid' ? 'golden' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Grid
              </Button>
              <Button
                variant={viewMode === 'gallery' ? 'golden' : 'outline'}
                size="sm"
                onClick={() => setViewMode('gallery')}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Gallery
              </Button>
            </div>
            
            {portfolioItems && (
              <span className="text-sm text-secondary-600">
                {portfolioItems.length} item{portfolioItems.length !== 1 ? 's' : ''} found
              </span>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-error-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-medium text-error-600 mb-2">Error Loading Portfolio</h3>
              <p className="text-error-500 mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {/* Portfolio Content */}
          {!loading && !error && portfolioItems && (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {portfolioItems.map((item) => (
                    <PortfolioItem
                      key={item.id}
                      item={item}
                      showDetails={true}
                      lazy={true}
                    />
                  ))}
                </div>
              ) : (
                <MediaGallery
                  items={portfolioItems}
                  columns={3}
                  gap="md"
                  lazy={true}
                />
              )}

              {portfolioItems.length === 0 && (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-secondary-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-secondary-600 mb-2">No portfolio items found</h3>
                  <p className="text-secondary-500">Try adjusting your filters to see more results.</p>
                </div>
              )}
            </>
          )}
        </section>

        {/* Featured Projects */}
        <section className="py-16 bg-secondary-50 rounded-2xl">
          <div className="text-center mb-12">
            <h2 className="heading-section text-secondary-900 mb-4">Featured Projects</h2>
            <p className="body-large text-secondary-600 max-w-2xl mx-auto">
              Highlighting some of our most impactful and creative work across different media types.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card variant="hover">
              <div className="aspect-video bg-gradient-to-br from-secondary-200 to-primary-100 rounded-t-lg flex items-center justify-center">
                <span className="text-secondary-600 font-medium">Featured Project Video</span>
              </div>
              <CardBody className="p-6">
                <h3 className="heading-card text-secondary-900 mb-2">Award-Winning Wedding Film</h3>
                <p className="body-normal text-secondary-600 mb-4">
                  A cinematic wedding film that captured the essence of love and celebration, recognized at the Regional Film Awards.
                </p>
                <div className="flex items-center justify-between">
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">Videography</span>
                  <Button variant="outline" size="sm">View Project</Button>
                </div>
              </CardBody>
            </Card>

            <Card variant="hover">
              <div className="aspect-video bg-gradient-to-br from-secondary-200 to-primary-100 rounded-t-lg flex items-center justify-center">
                <span className="text-secondary-600 font-medium">Featured Project Gallery</span>
              </div>
              <CardBody className="p-6">
                <h3 className="heading-card text-secondary-900 mb-2">Corporate Brand Photography</h3>
                <p className="body-normal text-secondary-600 mb-4">
                  A comprehensive brand photography project that elevated a startup's visual identity and marketing materials.
                </p>
                <div className="flex items-center justify-between">
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">Photography</span>
                  <Button variant="outline" size="sm">View Project</Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <div className="text-center mb-12">
            <h2 className="heading-section text-secondary-900 mb-4">Client Testimonials</h2>
            <p className="body-large text-secondary-600 max-w-2xl mx-auto">
              Hear what our clients have to say about their experience working with us.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Bride',
                testimonial: 'Derji Productions captured our wedding day perfectly. Every moment was beautifully documented with such artistic vision.',
                rating: 5
              },
              {
                name: 'Michael Chen',
                role: 'CEO, Tech Startup',
                testimonial: 'The corporate event coverage was exceptional. Professional, creative, and delivered exactly what we needed for our marketing.',
                rating: 5
              },
              {
                name: 'Emily Rodriguez',
                role: 'Podcast Host',
                testimonial: 'The audio quality and production value they brought to our podcast was incredible. Highly recommend their sound services.',
                rating: 5
              },
            ].map((testimonial, index) => (
              <Card key={index} variant="hover">
                <CardBody className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="body-normal text-secondary-600 mb-4 italic">"{testimonial.testimonial}"</p>
                  <div>
                    <p className="font-semibold text-secondary-900">{testimonial.name}</p>
                    <p className="text-sm text-secondary-600">{testimonial.role}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-circuit-pattern opacity-20"></div>
          <div className="relative z-10">
            <h2 className="heading-section mb-4">Ready to Create Something Amazing?</h2>
            <p className="body-large mb-8 max-w-2xl mx-auto opacity-90">
              Let's discuss your project and create content that exceeds your expectations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="secondary" size="lg">Book Consultation</Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                Get Quote
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PortfolioPage;