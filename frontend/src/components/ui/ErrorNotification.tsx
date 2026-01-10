import { useAppContext } from '@/context/AppContext';
import { AppError } from '@/types';
import { Button } from './Button';

interface ErrorNotificationProps {
  error: AppError;
  onDismiss: (errorId: string) => void;
}

function ErrorNotificationItem({ error, onDismiss }: ErrorNotificationProps) {
  const getErrorIcon = (type: AppError['type']) => {
    switch (type) {
      case 'network':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'validation':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'server':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
    }
  };

  const getErrorColor = (type: AppError['type']) => {
    switch (type) {
      case 'network':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'validation':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'server':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const handleRetry = () => {
    if (error.retryAction) {
      error.retryAction();
      onDismiss(error.id);
    }
  };

  return (
    <div className={`border rounded-lg p-4 mb-3 ${getErrorColor(error.type)}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getErrorIcon(error.type)}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{error.message}</p>
          {error.details && (
            <p className="text-xs mt-1 opacity-75">
              {typeof error.details === 'string' ? error.details : JSON.stringify(error.details)}
            </p>
          )}
          <div className="mt-2 flex items-center space-x-2">
            {error.recoverable && error.retryAction && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                className="text-xs"
              >
                Try Again
              </Button>
            )}
            <button
              onClick={() => onDismiss(error.id)}
              className="text-xs underline opacity-75 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          onClick={() => onDismiss(error.id)}
          className="flex-shrink-0 ml-2 opacity-50 hover:opacity-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function ErrorNotificationContainer() {
  const { state, removeError } = useAppContext();

  if (state.errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-full">
      <div className="space-y-2">
        {state.errors.map((error) => (
          <ErrorNotificationItem
            key={error.id}
            error={error}
            onDismiss={removeError}
          />
        ))}
      </div>
    </div>
  );
}

// Offline indicator component
export function OfflineIndicator() {
  const { state } = useAppContext();

  if (state.isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span className="text-sm font-medium">You're offline</span>
      </div>
    </div>
  );
}

// Network retry banner
export function NetworkRetryBanner() {
  const { state, retryLastAction } = useAppContext();

  const hasNetworkErrors = state.errors.some(error => error.type === 'network' && error.recoverable);

  if (!hasNetworkErrors || !state.isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">Connection restored. Some actions may have failed.</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={retryLastAction}
          disabled={state.networkRetrying}
          className="text-white border-white hover:bg-white hover:text-blue-600"
        >
          {state.networkRetrying ? 'Retrying...' : 'Retry'}
        </Button>
      </div>
    </div>
  );
}