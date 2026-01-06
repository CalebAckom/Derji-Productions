import React from 'react';
import { Service } from '../../types';
import { Button, Card, CardBody } from '../ui';
import { 
  ClockIcon, 
  CurrencyDollarIcon, 
  CheckIcon,
  PlusIcon,
  MinusIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';

interface ServiceCardProps {
  service: Service;
  onSelect?: (service: Service) => void;
  onAddToComparison?: (service: Service) => void;
  isSelected?: boolean;
  showComparison?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onSelect,
  onAddToComparison,
  isSelected = false,
  showComparison = false,
  variant = 'default',
}) => {
  const handleCardClick = () => {
    onSelect?.(service);
  };

  const handleComparisonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToComparison?.(service);
  };

  const formatPrice = (price: number | undefined, priceType: string) => {
    if (!price) return 'Contact for pricing';
    
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);

    switch (priceType) {
      case 'hourly':
        return `${formattedPrice}/hour`;
      case 'package':
        return `Starting at ${formattedPrice}`;
      default:
        return formattedPrice;
    }
  };

  const formatDuration = (duration: number | undefined) => {
    if (!duration) return null;
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const getFeatures = () => {
    if (!service.features) return [];
    
    if (Array.isArray(service.features)) {
      return service.features;
    }
    
    if (typeof service.features === 'object') {
      return Object.entries(service.features)
        .filter(([_, value]) => value === true)
        .map(([key, _]) => key.replace(/([A-Z])/g, ' $1').trim());
    }
    
    return [];
  };

  const features = getFeatures();

  return (
    <Card 
      variant={isSelected ? 'golden' : 'hover'}
      className={cn(
        'cursor-pointer transition-all duration-200',
        isSelected && 'ring-2 ring-primary-500',
        variant === 'compact' && 'h-auto',
        variant === 'detailed' && 'h-auto'
      )}
      onClick={handleCardClick}
    >
      <CardBody className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-secondary-900 line-clamp-2">
                {service.name}
              </h3>
              {service.category && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  <TagIcon className="w-3 h-3 mr-1" />
                  {service.category.name}
                </span>
              )}
            </div>
            
            {service.subcategory && (
              <p className="text-sm text-secondary-600 mb-2">
                {service.subcategory}
              </p>
            )}
          </div>

          {/* Comparison Button */}
          {showComparison && onAddToComparison && (
            <Button
              variant={isSelected ? 'golden' : 'ghost'}
              size="sm"
              onClick={handleComparisonClick}
              className="ml-2 flex-shrink-0"
              title={isSelected ? 'Remove from comparison' : 'Add to comparison'}
            >
              {isSelected ? (
                <MinusIcon className="w-4 h-4" />
              ) : (
                <PlusIcon className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {/* Description */}
        {service.description && variant !== 'compact' && (
          <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
            {service.description}
          </p>
        )}

        {/* Pricing and Duration */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-secondary-600">
            <CurrencyDollarIcon className="w-4 h-4 mr-1" />
            <span className="font-medium text-secondary-900">
              {formatPrice(service.basePrice, service.priceType)}
            </span>
          </div>
          
          {service.duration && (
            <div className="flex items-center text-sm text-secondary-600">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span>{formatDuration(service.duration)}</span>
            </div>
          )}
        </div>

        {/* Features */}
        {features.length > 0 && variant === 'detailed' && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-secondary-900 mb-2">
              What's included:
            </h4>
            <ul className="space-y-1">
              {features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-secondary-600">
                  <CheckIcon className="w-3 h-3 text-success-500 mr-2 flex-shrink-0" />
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
              {features.length > 4 && (
                <li className="text-sm text-secondary-500">
                  +{features.length - 4} more features
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Compact Features */}
        {features.length > 0 && variant === 'compact' && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-secondary-100 text-secondary-700"
                >
                  {feature}
                </span>
              ))}
              {features.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-secondary-100 text-secondary-500">
                  +{features.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Default Features */}
        {features.length > 0 && variant === 'default' && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {features.slice(0, 2).map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-primary-50 text-primary-700 border border-primary-200"
                >
                  <CheckIcon className="w-3 h-3 mr-1" />
                  {feature}
                </span>
              ))}
              {features.length > 2 && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-secondary-100 text-secondary-600">
                  +{features.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="golden"
            size="sm"
            onClick={handleCardClick}
            className="flex-1"
          >
            View Details
          </Button>
          
          {service.priceType === 'package' && (
            <span className="text-xs text-secondary-500 ml-3">
              Custom packages available
            </span>
          )}
        </div>

        {/* Status Indicator */}
        {!service.active && (
          <div className="mt-3 pt-3 border-t border-secondary-200">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-600">
              Currently unavailable
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ServiceCard;