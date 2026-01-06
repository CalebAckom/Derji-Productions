import React, { useState, useEffect } from 'react';
import { PortfolioFilters as PortfolioFiltersType } from '@/types';
import { Button, Input } from '../ui';
import { cn } from '@/utils/cn';
import { useDebounce } from '@/hooks/useDebounce';

export interface PortfolioFiltersProps {
  filters: PortfolioFiltersType;
  onFiltersChange: (filters: PortfolioFiltersType) => void;
  availableTags?: string[];
  className?: string;
  showSearch?: boolean;
  showDateRange?: boolean;
  showTags?: boolean;
  showFeatured?: boolean;
}

const PortfolioFilters: React.FC<PortfolioFiltersProps> = ({
  filters,
  onFiltersChange,
  availableTags = [],
  className,
  showSearch = true,
  showDateRange = true,
  showTags = true,
  showFeatured = true,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({
        ...filters,
        search: debouncedSearch || undefined,
      });
    }
  }, [debouncedSearch, filters, onFiltersChange]);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'photography', label: 'Photography' },
    { value: 'videography', label: 'Videography' },
    { value: 'sound', label: 'Sound' },
  ];

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category || undefined,
    });
  };

  const handleFeaturedChange = (featured: boolean | undefined) => {
    onFiltersChange({
      ...filters,
      featured,
    });
  };

  const handleDateFromChange = (date: string) => {
    onFiltersChange({
      ...filters,
      dateFrom: date ? new Date(date) : undefined,
    });
  };

  const handleDateToChange = (date: string) => {
    onFiltersChange({
      ...filters,
      dateTo: date ? new Date(date) : undefined,
    });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFiltersChange({});
  };

  const hasActiveFilters = !!(
    filters.category ||
    filters.search ||
    filters.featured !== undefined ||
    filters.dateFrom ||
    filters.dateTo ||
    (filters.tags && filters.tags.length > 0)
  );

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Category Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        {showSearch && (
          <div className="flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search portfolio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={filters.category === category.value ? 'golden' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Expand/Collapse Button */}
        {(showDateRange || showTags || showFeatured) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center"
          >
            <span>Filters</span>
            <svg
              className={cn('w-4 h-4 ml-1 transition-transform', isExpanded && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4 p-4 bg-secondary-50 rounded-lg">
          {/* Featured Filter */}
          {showFeatured && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Featured Content
              </label>
              <div className="flex gap-2">
                <Button
                  variant={filters.featured === undefined ? 'golden' : 'outline'}
                  size="sm"
                  onClick={() => handleFeaturedChange(undefined)}
                >
                  All
                </Button>
                <Button
                  variant={filters.featured === true ? 'golden' : 'outline'}
                  size="sm"
                  onClick={() => handleFeaturedChange(true)}
                >
                  Featured Only
                </Button>
                <Button
                  variant={filters.featured === false ? 'golden' : 'outline'}
                  size="sm"
                  onClick={() => handleFeaturedChange(false)}
                >
                  Non-Featured
                </Button>
              </div>
            </div>
          )}

          {/* Date Range Filter */}
          {showDateRange && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Project Date Range
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    type="date"
                    placeholder="From date"
                    value={formatDateForInput(filters.dateFrom)}
                    onChange={(e) => handleDateFromChange(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="date"
                    placeholder="To date"
                    value={formatDateForInput(filters.dateTo)}
                    onChange={(e) => handleDateToChange(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tags Filter */}
          {showTags && availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = filters.tags?.includes(tag) || false;
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={cn(
                        'px-3 py-1 text-sm rounded-full border transition-colors',
                        isSelected
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-secondary-600 border-secondary-300 hover:border-primary-300'
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-secondary-600 hover:text-secondary-800"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && !isExpanded && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-secondary-600">Active filters:</span>
          
          {filters.category && (
            <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
              {categories.find(c => c.value === filters.category)?.label}
            </span>
          )}
          
          {filters.featured !== undefined && (
            <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
              {filters.featured ? 'Featured' : 'Non-Featured'}
            </span>
          )}
          
          {filters.search && (
            <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
              Search: "{filters.search}"
            </span>
          )}
          
          {(filters.dateFrom || filters.dateTo) && (
            <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
              Date Range
            </span>
          )}
          
          {filters.tags && filters.tags.length > 0 && (
            <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
              {filters.tags.length} tag{filters.tags.length !== 1 ? 's' : ''}
            </span>
          )}
          
          <button
            onClick={clearFilters}
            className="text-secondary-500 hover:text-secondary-700 ml-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default PortfolioFilters;