import React, { useState } from 'react';
import { Button, Card, CardBody } from '../ui';

interface LocationData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface LocationMapProps {
  location: LocationData;
  showDirections?: boolean;
  className?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({
  location,
  showDirections = true,
  className,
}) => {
  const [mapError, setMapError] = useState(false);

  const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zipCode}, ${location.country}`;
  
  // Generate Google Maps URLs
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;
  
  // Generate Apple Maps URL for iOS devices
  const appleMapsUrl = `http://maps.apple.com/?q=${encodeURIComponent(fullAddress)}`;

  const handleGetDirections = () => {
    // Detect if user is on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      window.open(appleMapsUrl, '_blank');
    } else {
      window.open(directionsUrl, '_blank');
    }
  };

  const handleViewOnMaps = () => {
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className={className}>
      <Card>
        <CardBody className="p-0">
          {/* Map Container */}
          <div className="aspect-video relative overflow-hidden rounded-t-lg">
            {!mapError ? (
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(fullAddress)}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onError={() => setMapError(true)}
                title={`Map showing location of ${location.name}`}
              />
            ) : (
              // Fallback when map fails to load
              <div className="w-full h-full bg-gradient-to-br from-secondary-200 to-primary-100 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-secondary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-secondary-600 font-medium mb-2">Interactive Map</p>
                  <p className="text-sm text-secondary-500 mb-4">{fullAddress}</p>
                  <Button variant="outline" size="sm" onClick={handleViewOnMaps}>
                    View on Maps
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Location Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address Information */}
              <div>
                <h3 className="heading-card text-secondary-900 mb-4">{location.name}</h3>
                <div className="space-y-2 text-secondary-600">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p>{location.address}</p>
                      <p>{location.city}, {location.state} {location.zipCode}</p>
                      <p>{location.country}</p>
                    </div>
                  </div>
                  
                  {location.phone && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${location.phone}`} className="hover:text-primary-600 transition-colors">
                        {location.phone}
                      </a>
                    </div>
                  )}
                  
                  {location.email && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${location.email}`} className="hover:text-primary-600 transition-colors">
                        {location.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                {showDirections && (
                  <Button 
                    variant="golden" 
                    onClick={handleGetDirections}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    }
                  >
                    Get Directions
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={handleViewOnMaps}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  }
                >
                  View on Maps
                </Button>
                
                {location.phone && (
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = `tel:${location.phone}`}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    }
                  >
                    Call Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default LocationMap;