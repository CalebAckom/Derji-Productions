import React from 'react';
import { Service } from '../../types';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from '../ui';
import { 
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TagIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ServiceComparisonProps {
  services: Service[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveService: (serviceId: string) => void;
  onClearAll: () => void;
}

const ServiceComparison: React.FC<ServiceComparisonProps> = ({
  services,
  isOpen,
  onClose,
  onRemoveService,
  onClearAll,
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
    if (!duration) return 'Varies';
    
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

  const getAllFeatures = () => {
    const allFeatures = new Set<string>();
    
    services.forEach(service => {
      if (service.features) {
        if (Array.isArray(service.features)) {
          service.features.forEach(feature => allFeatures.add(feature));
        } else if (typeof service.features === 'object') {
          Object.keys(service.features).forEach(key => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
            allFeatures.add(formattedKey);
          });
        }
      }
    });
    
    return Array.from(allFeatures).sort();
  };

  const hasFeature = (service: Service, feature: string) => {
    if (!service.features) return false;
    
    if (Array.isArray(service.features)) {
      return service.features.includes(feature);
    }
    
    if (typeof service.features === 'object') {
      const camelCaseFeature = feature.replace(/\s+/g, '').toLowerCase();
      return Object.entries(service.features).some(([key, value]) => 
        key.toLowerCase() === camelCaseFeature && value === true
      );
    }
    
    return false;
  };

  const allFeatures = getAllFeatures();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-7xl w-full">
      <ModalHeader>
        <div className="flex items-center justify-between w-full">
          <h2 className="text-xl font-semibold text-secondary-900">
            Service Comparison ({services.length})
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              Clear All
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="text-left p-4 font-medium text-secondary-900 w-48">
                  Service Details
                </th>
                {services.map((service) => (
                  <th key={service.id} className="text-center p-4 min-w-64">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <h3 className="font-semibold text-secondary-900 text-center">
                          {service.name}
                        </h3>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => onRemoveService(service.id)}
                          className="text-secondary-400 hover:text-error-500"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {service.category && (
                        <div className="flex items-center justify-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            <TagIcon className="w-3 h-3 mr-1" />
                            {service.category.name}
                          </span>
                        </div>
                      )}
                      
                      {service.subcategory && (
                        <p className="text-sm text-secondary-600">
                          {service.subcategory}
                        </p>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-secondary-200">
              {/* Description */}
              <tr>
                <td className="p-4 font-medium text-secondary-900 bg-secondary-50">
                  Description
                </td>
                {services.map((service) => (
                  <td key={service.id} className="p-4 text-center">
                    <p className="text-sm text-secondary-600">
                      {service.description || 'No description available'}
                    </p>
                  </td>
                ))}
              </tr>

              {/* Pricing */}
              <tr>
                <td className="p-4 font-medium text-secondary-900 bg-secondary-50">
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    Pricing
                  </div>
                </td>
                {services.map((service) => (
                  <td key={service.id} className="p-4 text-center">
                    <div className="space-y-1">
                      <p className="font-semibold text-secondary-900">
                        {formatPrice(service.basePrice, service.priceType)}
                      </p>
                      <p className="text-xs text-secondary-500 capitalize">
                        {service.priceType} pricing
                      </p>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Duration */}
              <tr>
                <td className="p-4 font-medium text-secondary-900 bg-secondary-50">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    Duration
                  </div>
                </td>
                {services.map((service) => (
                  <td key={service.id} className="p-4 text-center">
                    <p className="text-secondary-900">
                      {formatDuration(service.duration)}
                    </p>
                  </td>
                ))}
              </tr>

              {/* Availability */}
              <tr>
                <td className="p-4 font-medium text-secondary-900 bg-secondary-50">
                  Availability
                </td>
                {services.map((service) => (
                  <td key={service.id} className="p-4 text-center">
                    <span className={`
                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${service.active 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-secondary-100 text-secondary-600'
                      }
                    `}>
                      {service.active ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Features Comparison */}
              {allFeatures.length > 0 && (
                <>
                  <tr>
                    <td colSpan={services.length + 1} className="p-4 bg-secondary-100">
                      <h4 className="font-semibold text-secondary-900 flex items-center gap-2">
                        <InformationCircleIcon className="w-5 h-5" />
                        Features Comparison
                      </h4>
                    </td>
                  </tr>
                  
                  {allFeatures.map((feature) => (
                    <tr key={feature}>
                      <td className="p-4 text-sm text-secondary-700 bg-secondary-50">
                        {feature}
                      </td>
                      {services.map((service) => (
                        <td key={service.id} className="p-4 text-center">
                          {hasFeature(service, feature) ? (
                            <CheckIcon className="w-5 h-5 text-success-500 mx-auto" />
                          ) : (
                            <XMarkIcon className="w-5 h-5 text-secondary-300 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {services.length === 0 && (
          <div className="text-center py-12">
            <InformationCircleIcon className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              No services to compare
            </h3>
            <p className="text-secondary-600">
              Add services to comparison to see detailed side-by-side comparison.
            </p>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-secondary-600">
            {services.length > 0 && (
              <>
                Comparing {services.length} service{services.length !== 1 ? 's' : ''}
                {services.length < 3 && (
                  <span className="ml-2 text-primary-600">
                    (Add up to {3 - services.length} more)
                  </span>
                )}
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {services.length > 0 && (
              <Button variant="golden" onClick={() => {
                // This could trigger a booking flow or contact form
                // For now, we'll just close the modal
                onClose();
              }}>
                Book Selected Service
              </Button>
            )}
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default ServiceComparison;