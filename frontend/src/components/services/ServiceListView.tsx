import React from 'react';
import { Service } from '../../types';
import { Button, Card, CardBody } from '../ui';
import { 
  ClockIcon, 
  CurrencyDollarIcon, 
  CheckIcon,
  PlusIcon,
  MinusIcon,
  TagIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';

interface ServiceListViewProps {
  services: Service[];
  onServiceSelect?: (service: Service) => void;
  onAddToComparison?: (service: Service) => void;
  selectedServices?: Service[];
  showComparison?: boolean;
}

const ServiceListView: React.FC<ServiceListViewProps> = ({
  services,
  onServiceSelect,
  onAddToComparison,
  selectedServices = [],
  showComparison = false,
}) => {
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

  const getFeatures = (service: Service) => {
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

  const isSelected = (service: Service) => {
    return selectedServices.some(s => s.id === service.id);
  };

  const handleComparisonClick = (e: React.MouseEvent, service: Service) => {
    e.stopPropagation();
    onAddToComparison?.(service);
  };

  return (
    <div className="space-y-4">
      {services.map((service) => {
        const features = getFeatures(service);
        const selected = isSelected(service);
        
        return (
          <Card 
            key={service.id}
            variant={selected ? 'golden' : 'hover'}
            className={cn(
              'cursor-pointer transition-all duration-200',
              selected && 'ring-2 ring-primary-500'
            )}
            onClick={() => onServiceSelect?.(service)}
          >
            <CardBody className="p-6">
              <div className="flex items-start gap-6">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-secondary-900 truncate">
                          {service.name}
                        </h3>
                        
                        {service.category && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 flex-shrink-0">
                            <TagIcon className="w-3 h-3 mr-1" />
                            {service.category.name}
                          </span>
                        )}
                        
                        {!service.active && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-600 flex-shrink-0">
                            Unavailable
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
                        variant={selected ? 'golden' : 'ghost'}
                        size="sm"
                        onClick={(e) => handleComparisonClick(e, service)}
                        className="ml-4 flex-shrink-0"
                        title={selected ? 'Remove from comparison' : 'Add to comparison'}
                      >
                        {selected ? (
                          <MinusIcon className="w-4 h-4" />
                        ) : (
                          <PlusIcon className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Description */}
                  {service.description && (
                    <p className="text-secondary-600 mb-4 line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  {/* Features */}
                  {features.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {features.slice(0, 4).map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-primary-50 text-primary-700 border border-primary-200"
                          >
                            <CheckIcon className="w-3 h-3 mr-1" />
                            {feature}
                          </span>
                        ))}
                        {features.length > 4 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-secondary-100 text-secondary-600">
                            +{features.length - 4} more features
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing and Actions */}
                <div className="flex-shrink-0 text-right space-y-4">
                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-end text-sm text-secondary-600">
                      <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                      <span className="font-medium text-secondary-900 text-lg">
                        {formatPrice(service.basePrice, service.priceType)}
                      </span>
                    </div>
                    
                    {service.duration && (
                      <div className="flex items-center justify-end text-sm text-secondary-600">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        <span>{formatDuration(service.duration)}</span>
                      </div>
                    )}
                    
                    <p className="text-xs text-secondary-500 capitalize">
                      {service.priceType} pricing
                    </p>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="golden"
                    size="md"
                    onClick={(e) => {
                      e.stopPropagation();
                      onServiceSelect?.(service);
                    }}
                    rightIcon={<ArrowRightIcon className="w-4 h-4" />}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
};

export default ServiceListView;