import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Service, ServiceFilters } from '../../types';
import { useServices } from '../../hooks/useServices';
import { Button, Card, CardBody, Input } from '../ui';
import { MagnifyingGlassIcon, FunnelIcon, ArrowsRightLeftIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { useDebounce } from '../../hooks/useDebounce';
import ServiceCard from './ServiceCard';
import ServiceFiltersPanel from './ServiceFiltersPanel';
import ServiceComparison from './ServiceComparison';
import ServiceListView from './ServiceListView';

interface ServiceCatalogProps {
  initialCategory?: string;
  showFilters?: boolean;
  showComparison?: boolean;
  layout?: 'grid' | 'list';
  onServiceSelect?: (service: Service) => void;
}

const ServiceCatalog: React.FC<ServiceCatalogProps> = ({
  initialCategory,
  showFilters = true,
  showComparison = true,
  layout: initialLayout = 'grid',
  onServiceSelect,
}) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ServiceFilters>({
    categorySlug: initialCategory,
    active: true,
  });
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'list'>(initialLayout);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Combine filters with search query
  const combinedFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearchQuery || undefined,
  }), [filters, debouncedSearchQuery]);

  // Fetch services with filters
  const { data: servicesData = [], loading, error } = useServices(combinedFilters);
  
  // Ensure services is always an array
  const services = Array.isArray(servicesData) ? servicesData : [];

  // Filter handlers
  const handleFilterChange = useCallback((newFilters: Partial<ServiceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ active: true });
    setSearchQuery('');
  }, []);

  // Search handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Service selection handlers
  const handleServiceSelect = useCallback((service: Service) => {
    onServiceSelect?.(service);
  }, [onServiceSelect]);

  // Comparison handlers
  const handleAddToComparison = useCallback((service: Service) => {
    setSelectedServices(prev => {
      if (prev.find(s => s.id === service.id)) {
        return prev.filter(s => s.id !== service.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), service];
      }
      return [...prev, service];
    });
  }, []);

  const handleRemoveFromComparison = useCallback((serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  }, []);

  const handleClearComparison = useCallback(() => {
    setSelectedServices([]);
    setShowComparisonModal(false);
  }, []);

  // Category statistics
  const categoryStats = useMemo(() => {
    const stats = services.reduce((acc, service) => {
      const category = service.category?.slug || 'other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  }, [services]);

  // Add a state to track if we've ever loaded data to prevent flickering
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [minLoadingTime, setMinLoadingTime] = useState(true);

  // Set minimum loading time to prevent quick flashes
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTime(false);
    }, 500); // Minimum 500ms loading time

    return () => clearTimeout(timer);
  }, []);

  // Update hasLoadedOnce when we get data or when loading completes
  useEffect(() => {
    if (!loading) {
      setHasLoadedOnce(true);
    }
  }, [loading]);

  // Determine if we should show loading skeleton
  const showSkeleton = (loading || minLoadingTime) && !hasLoadedOnce;

  return (
    <div className="space-y-6 animate-fade-in">
      {showSkeleton ? (
        // Loading skeleton
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="skeleton h-10 rounded-lg"></div>
            </div>
            <div className="flex gap-2">
              <div className="skeleton h-10 w-20 rounded-lg"></div>
              <div className="skeleton h-10 w-20 rounded-lg"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-64 rounded-xl"></div>
            ))}
          </div>
        </>
      ) : (
        // Actual content
        <>
          {/* Header with Search and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={handleSearchChange}
                leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
                variant="golden"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Filters Toggle */}
              {showFilters && (
                <Button
                  variant={showFiltersPanel ? 'golden' : 'outline'}
                  size="md"
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  leftIcon={<FunnelIcon className="w-4 h-4" />}
                >
                  Filters
                </Button>
              )}

              {/* Layout Toggle */}
              <div className="flex rounded-lg border border-secondary-300 overflow-hidden">
                <Button
                  variant={layout === 'grid' ? 'golden' : 'ghost'}
                  size="sm"
                  onClick={() => setLayout('grid')}
                  className="rounded-none border-0"
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </Button>
                <Button
                  variant={layout === 'list' ? 'golden' : 'ghost'}
                  size="sm"
                  onClick={() => setLayout('list')}
                  className="rounded-none border-0 border-l border-secondary-300"
                >
                  <ListBulletIcon className="w-4 h-4" />
                </Button>
              </div>

              {/* Comparison Toggle */}
              {showComparison && selectedServices.length > 0 && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowComparisonModal(!showComparisonModal)}
                  leftIcon={<ArrowsRightLeftIcon className="w-4 h-4" />}
                >
                  Compare ({selectedServices.length})
                </Button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && showFiltersPanel && (
            <Card>
              <CardBody>
                <ServiceFiltersPanel
                  filters={filters}
                  onFiltersChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  categoryStats={categoryStats}
                />
              </CardBody>
            </Card>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-secondary-600">
              {loading && hasLoadedOnce ? (
                <div className="flex items-center gap-2">
                  <div className="spinner-sm text-primary-500"></div>
                  <span>Updating results...</span>
                </div>
              ) : (
                <>
                  Showing {services.length} service{services.length !== 1 ? 's' : ''}
                  {debouncedSearchQuery && ` for "${debouncedSearchQuery}"`}
                  {filters.categorySlug && ` in ${filters.categorySlug}`}
                </>
              )}
            </div>

            {(debouncedSearchQuery || Object.keys(filters).length > 1) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
              >
                Clear all filters
              </Button>
            )}
          </div>

          {/* Error State */}
          {error && (
            <Card>
              <CardBody className="text-center py-8">
                <p className="text-error-600 mb-4">Failed to load services</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !error && services.length === 0 && (
            <Card>
              <CardBody className="text-center py-12">
                <div className="text-secondary-400 mb-4">
                  <MagnifyingGlassIcon className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  No services found
                </h3>
                <p className="text-secondary-600 mb-4">
                  {debouncedSearchQuery
                    ? `No services match your search for "${debouncedSearchQuery}"`
                    : 'No services match your current filters'
                  }
                </p>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Services Grid/List */}
          {!loading && !error && services.length > 0 && (
            <>
              {layout === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onSelect={handleServiceSelect}
                      onAddToComparison={showComparison ? handleAddToComparison : undefined}
                      isSelected={selectedServices.some(s => s.id === service.id)}
                      showComparison={showComparison}
                    />
                  ))}
                </div>
              ) : (
                <ServiceListView
                  services={services}
                  onServiceSelect={handleServiceSelect}
                  onAddToComparison={showComparison ? handleAddToComparison : undefined}
                  selectedServices={selectedServices}
                  showComparison={showComparison}
                />
              )}
            </>
          )}

          {/* Service Comparison Modal */}
          {showComparison && showComparisonModal && selectedServices.length > 0 && (
            <ServiceComparison
              services={selectedServices}
              isOpen={showComparisonModal}
              onClose={() => setShowComparisonModal(false)}
              onRemoveService={handleRemoveFromComparison}
              onClearAll={handleClearComparison}
            />
          )}

          {/* Comparison Sticky Bar */}
          {showComparison && selectedServices.length > 0 && !showComparisonModal && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
              <Card className="shadow-xl">
                <CardBody className="flex items-center gap-4 py-3 px-6">
                  <span className="text-sm font-medium">
                    {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="golden"
                    size="sm"
                    onClick={() => setShowComparisonModal(true)}
                  >
                    Compare Services
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearComparison}
                  >
                    Clear
                  </Button>
                </CardBody>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ServiceCatalog;