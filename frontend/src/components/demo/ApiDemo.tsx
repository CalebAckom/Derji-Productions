import { useState } from 'react';
import { useAppContext, useAuth } from '@/context';
import { useServices, usePortfolio, useContactValidation } from '@/hooks';
import { LoadingState, Button, Input } from '@/components/ui';
import { ContactFormData } from '@/types';

export function ApiDemo() {
  const { state, setError, clearError } = useAppContext();
  const { user, isAuthenticated } = useAuth();
  
  // Demonstrate service fetching with caching
  const { 
    data: services, 
    loading: servicesLoading, 
    error: servicesError, 
    refresh: refreshServices 
  } = useServices();
  
  // Demonstrate portfolio fetching with filters
  const { 
    data: portfolio, 
    loading: portfolioLoading, 
    error: portfolioError 
  } = usePortfolio({ featured: true });
  
  // Demonstrate form validation
  const { validateForm } = useContactValidation();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(formData);
    setFormErrors(errors);
    
    if (errors.length === 0) {
      setError('Form validation passed! (This is just a demo)');
      setTimeout(() => clearError(), 3000);
    }
  };
  
  const handleInputChange = (field: keyof ContactFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">API Client & State Management Demo</h2>
        
        {/* Global State Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Global State</h3>
          <div className="text-sm space-y-1">
            <p><strong>Online:</strong> {state.isOnline ? 'Yes' : 'No'}</p>
            <p><strong>Loading:</strong> {state.isLoading ? 'Yes' : 'No'}</p>
            <p><strong>Error:</strong> {state.error || 'None'}</p>
            <p><strong>Theme:</strong> {state.theme}</p>
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            {user && <p><strong>User:</strong> {user.email}</p>}
          </div>
        </div>
        
        {/* Services API Demo */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Services API (with caching)</h3>
            <Button onClick={refreshServices} disabled={servicesLoading} size="sm">
              Refresh
            </Button>
          </div>
          
          <LoadingState
            loading={servicesLoading}
            error={servicesError}
            retry={refreshServices}
          >
            <div className="text-sm text-gray-600">
              {services ? (
                <p>Loaded {services.length} services from API (cached for 2 minutes)</p>
              ) : (
                <p>No services loaded</p>
              )}
            </div>
          </LoadingState>
        </div>
        
        {/* Portfolio API Demo */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Featured Portfolio API</h3>
          <LoadingState
            loading={portfolioLoading}
            error={portfolioError}
          >
            <div className="text-sm text-gray-600">
              {portfolio ? (
                <p>Loaded {portfolio.length} featured portfolio items</p>
              ) : (
                <p>No portfolio items loaded</p>
              )}
            </div>
          </LoadingState>
        </div>
        
        {/* Form Validation Demo */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Form Validation Demo</h3>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Input
                label="Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <Input
                label="Phone (optional)"
                value={formData.phone || ''}
                onChange={handleInputChange('phone')}
                placeholder="Enter your phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={handleInputChange('message')}
                placeholder="Enter your message (min 10 characters)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {formErrors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <ul className="text-sm text-red-600 space-y-1">
                  {formErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button type="submit">
              Validate Form
            </Button>
          </form>
        </div>
        
        {/* Error Handling Demo */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Error Handling Demo</h3>
          <div className="space-x-2">
            <Button
              onClick={() => setError('This is a test error message')}
              variant="outline"
              size="sm"
            >
              Trigger Error
            </Button>
            <Button
              onClick={clearError}
              variant="outline"
              size="sm"
            >
              Clear Error
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}