import { useState } from 'react';
import { Button } from '../ui/Button';
import { LoadingState, ServiceListSkeleton } from '../ui/LoadingState';
import { withErrorBoundary } from '../ui/withErrorBoundary';
import { useOperationErrorHandler } from '../../hooks/useErrorHandler';
import { get } from '../../utils/api';

// Component that throws an error for testing
const ErrorThrowingComponent = withErrorBoundary(() => {
  const [shouldError, setShouldError] = useState(false);
  
  if (shouldError) {
    throw new Error('This is a test error from ErrorThrowingComponent');
  }
  
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-medium text-blue-900 mb-2">Error Boundary Test</h3>
      <p className="text-blue-700 text-sm mb-3">
        This component is wrapped with an error boundary. Click the button to trigger an error.
      </p>
      <Button
        onClick={() => setShouldError(true)}
        variant="outline"
        size="sm"
      >
        Trigger Error
      </Button>
    </div>
  );
});

// Component that demonstrates network error handling
function NetworkErrorDemo() {
  const { executeOperation, isLoading } = useOperationErrorHandler('networkTest');
  const [data, setData] = useState<any>(null);

  const testNetworkError = async () => {
    await executeOperation(async () => {
      // This will fail and trigger error handling
      const result = await get('/api/nonexistent-endpoint');
      setData(result);
    });
  };

  const testNetworkSuccess = async () => {
    await executeOperation(async () => {
      // Simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData({ message: 'Success! This would be real API data.' });
    });
  };

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="font-medium text-green-900 mb-2">Network Error Handling</h3>
      <p className="text-green-700 text-sm mb-3">
        Test network error handling with retry functionality.
      </p>
      
      <div className="space-x-2 mb-3">
        <Button
          onClick={testNetworkError}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Test Network Error'}
        </Button>
        <Button
          onClick={testNetworkSuccess}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Test Success'}
        </Button>
      </div>
      
      {data && (
        <div className="p-2 bg-white rounded border text-sm">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

// Component that demonstrates loading states
function LoadingStateDemo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);

  const simulateLoading = () => {
    setLoading(true);
    setError(null);
    setIsEmpty(false);
    
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const simulateError = () => {
    setLoading(false);
    setError('This is a simulated error message');
    setIsEmpty(false);
  };

  const simulateEmpty = () => {
    setLoading(false);
    setError(null);
    setIsEmpty(true);
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setIsEmpty(false);
  };

  return (
    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <h3 className="font-medium text-purple-900 mb-2">Loading States Demo</h3>
      <p className="text-purple-700 text-sm mb-3">
        Test different loading states and error conditions.
      </p>
      
      <div className="space-x-2 mb-4">
        <Button onClick={simulateLoading} size="sm" disabled={loading}>
          Show Loading
        </Button>
        <Button onClick={simulateError} size="sm" variant="outline">
          Show Error
        </Button>
        <Button onClick={simulateEmpty} size="sm" variant="outline">
          Show Empty
        </Button>
        <Button onClick={reset} size="sm" variant="outline">
          Reset
        </Button>
      </div>
      
      <LoadingState
        loading={loading}
        error={error}
        isEmpty={isEmpty}
        retry={reset}
        skeleton={<ServiceListSkeleton />}
        emptyState={
          <div className="text-center py-8">
            <p className="text-gray-500">No items to display</p>
          </div>
        }
      >
        <div className="p-4 bg-white rounded border">
          <p className="text-gray-700">This is the main content that shows when everything is loaded successfully.</p>
        </div>
      </LoadingState>
    </div>
  );
}

export default function ErrorHandlingDemo() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Error Handling & User Experience Demo
        </h1>
        <p className="text-gray-600">
          This page demonstrates the comprehensive error handling and user experience features 
          implemented in the application, including error boundaries, network error handling, 
          loading states, and user-friendly error messages.
        </p>
      </div>

      <div className="space-y-6">
        <ErrorThrowingComponent />
        <NetworkErrorDemo />
        <LoadingStateDemo />
        
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-900 mb-2">Global Error Features</h3>
          <div className="text-yellow-700 text-sm space-y-1">
            <p>• <strong>Error Notifications:</strong> Check the top-right corner for error notifications</p>
            <p>• <strong>Offline Detection:</strong> Try going offline to see the offline indicator</p>
            <p>• <strong>Network Retry:</strong> Network errors will show retry options</p>
            <p>• <strong>Performance Monitoring:</strong> Slow page loads are automatically detected</p>
            <p>• <strong>Accessibility Monitoring:</strong> Development mode includes accessibility checks</p>
          </div>
        </div>
      </div>
    </div>
  );
}