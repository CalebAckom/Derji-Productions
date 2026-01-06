import React, { useState } from 'react';
import { ServiceFilters } from '../../types';
import { Button, Input } from '../ui';
import { useServiceCategories } from '../../hooks/useServices';
import { 
  XMarkIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface ServiceFiltersPanelProps {
  filters: ServiceFilters;
  onFiltersChange: (filters: Partial<ServiceFilters>) => void;
  onClearFilters: () => void;
  categoryStats?: Record<string, number>;
}

const ServiceFiltersPanel: React.FC<ServiceFiltersPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  categoryStats = {},
}) => {
  const { data: categories = [] } = useServiceCategories();
  const [priceRange, setPriceRange] = useState<[number, number]>(
    filters.priceRange || [0, 5000]
  );

  // Common subcategories for each main category
  const subcategoriesByCategory = {
    photography: [
      'Wedding', 'Corporate', 'Portrait', 'Birthday', 'Graduation',
      'Church Events', 'Travel', 'Studio', 'Drone Aerial'
    ],
    videography: [
      'Live Streaming', 'Post-production', 'Podcast', 'Drone Coverage',
      'Consultation & Training'
    ],
    sound: [
      'Live Sound Production', 'Post Sound Production', 'Podcast Audio',
      'Consultation & Training'
    ]
  };

  const handleCategoryChange = (categorySlug: string) => {
    const newCategory = filters.categorySlug === categorySlug ? undefined : categorySlug;
    onFiltersChange({ 
      categorySlug: newCategory,
      subcategory: undefined // Clear subcategory when changing category
    });
  };

  const handleSubcategoryChange = (subcategory: string) => {
    const newSubcategory = filters.subcategory === subcategory ? undefined : subcategory;
    onFiltersChange({ subcategory: newSubcategory });
  };

  const handlePriceRangeChange = (index: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const newRange: [number, number] = [...priceRange];
    newRange[index] = numValue;
    
    // Ensure min <= max
    if (index === 0 && numValue > newRange[1]) {
      newRange[1] = numValue;
    } else if (index === 1 && numValue < newRange[0]) {
      newRange[0] = numValue;
    }
    
    setPriceRange(newRange);
    onFiltersChange({ priceRange: newRange });
  };

  const getAvailableSubcategories = () => {
    if (!filters.categorySlug) return [];
    return subcategoriesByCategory[filters.categorySlug as keyof typeof subcategoriesByCategory] || [];
  };

  const hasActiveFilters = () => {
    return !!(
      filters.categorySlug ||
      filters.subcategory ||
      filters.priceRange ||
      filters.search
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-secondary-600" />
          <h3 className="text-lg font-semibold text-secondary-900">Filters</h3>
        </div>
        
        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            leftIcon={<XMarkIcon className="w-4 h-4" />}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Service Categories */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TagIcon className="w-4 h-4 text-secondary-600" />
          <h4 className="font-medium text-secondary-900">Service Categories</h4>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(categories || []).map((category) => {
            const isSelected = filters.categorySlug === category.slug;
            const count = categoryStats[category.slug] || 0;
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`
                  flex items-center justify-between p-3 rounded-lg border transition-all duration-200
                  ${isSelected 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50'
                  }
                `}
              >
                <span className="font-medium">{category.name}</span>
                <span className={`
                  text-sm px-2 py-1 rounded-full
                  ${isSelected 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'bg-secondary-100 text-secondary-600'
                  }
                `}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategories */}
      {filters.categorySlug && getAvailableSubcategories().length > 0 && (
        <div>
          <h4 className="font-medium text-secondary-900 mb-3">Subcategories</h4>
          <div className="flex flex-wrap gap-2">
            {getAvailableSubcategories().map((subcategory) => {
              const isSelected = filters.subcategory === subcategory;
              
              return (
                <button
                  key={subcategory}
                  onClick={() => handleSubcategoryChange(subcategory)}
                  className={`
                    px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${isSelected
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    }
                  `}
                >
                  {subcategory}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CurrencyDollarIcon className="w-4 h-4 text-secondary-600" />
          <h4 className="font-medium text-secondary-900">Price Range</h4>
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-secondary-600 mb-1">Min Price</label>
              <Input
                type="number"
                min="0"
                step="50"
                value={priceRange[0]}
                onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                placeholder="$0"
              />
            </div>
            <div>
              <label className="block text-sm text-secondary-600 mb-1">Max Price</label>
              <Input
                type="number"
                min="0"
                step="50"
                value={priceRange[1]}
                onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                placeholder="$5000+"
              />
            </div>
          </div>
          
          {/* Price Range Slider Visual */}
          <div className="relative">
            <div className="h-2 bg-secondary-200 rounded-full">
              <div 
                className="h-2 bg-primary-500 rounded-full"
                style={{
                  marginLeft: `${(priceRange[0] / 5000) * 100}%`,
                  width: `${((priceRange[1] - priceRange[0]) / 5000) * 100}%`
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-secondary-500 mt-1">
              <span>$0</span>
              <span>$1,250</span>
              <span>$2,500</span>
              <span>$3,750</span>
              <span>$5,000+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Price Filters */}
      <div>
        <h4 className="font-medium text-secondary-900 mb-3">Quick Price Filters</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Under $500', range: [0, 500] },
            { label: '$500 - $1,000', range: [500, 1000] },
            { label: '$1,000 - $2,500', range: [1000, 2500] },
            { label: '$2,500+', range: [2500, 5000] },
          ].map((option) => {
            const isSelected = 
              filters.priceRange &&
              filters.priceRange[0] === option.range[0] &&
              filters.priceRange[1] === option.range[1];
            
            return (
              <button
                key={option.label}
                onClick={() => {
                  const newRange = isSelected ? undefined : option.range as [number, number];
                  setPriceRange(newRange || [0, 5000]);
                  onFiltersChange({ priceRange: newRange });
                }}
                className={`
                  px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${isSelected
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }
                `}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Service Status */}
      <div>
        <h4 className="font-medium text-secondary-900 mb-3">Availability</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="availability"
              checked={filters.active === true}
              onChange={() => onFiltersChange({ active: true })}
              className="mr-2 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700">Available services only</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="availability"
              checked={filters.active === undefined}
              onChange={() => onFiltersChange({ active: undefined })}
              className="mr-2 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700">All services</span>
          </label>
        </div>
      </div>

      {/* Applied Filters Summary */}
      {hasActiveFilters() && (
        <div className="pt-4 border-t border-secondary-200">
          <h4 className="font-medium text-secondary-900 mb-3">Applied Filters</h4>
          <div className="flex flex-wrap gap-2">
            {filters.categorySlug && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                Category: {(categories || []).find(c => c.slug === filters.categorySlug)?.name}
                <button
                  onClick={() => onFiltersChange({ categorySlug: undefined, subcategory: undefined })}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.subcategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                {filters.subcategory}
                <button
                  onClick={() => onFiltersChange({ subcategory: undefined })}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.priceRange && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                ${filters.priceRange[0]} - ${filters.priceRange[1]}
                <button
                  onClick={() => {
                    setPriceRange([0, 5000]);
                    onFiltersChange({ priceRange: undefined });
                  }}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceFiltersPanel;