import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User } from '@/types';

// Error types for better error handling
export interface AppError {
  id: string;
  type: 'network' | 'validation' | 'server' | 'client' | 'unknown';
  message: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
  retryAction?: () => void;
}

// State interface
export interface AppState {
  // Authentication state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // UI state
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  
  // Enhanced error state
  error: string | null;
  errors: AppError[];
  
  // Network state
  isOnline: boolean;
  networkRetrying: boolean;
  
  // Cache state
  cache: Record<string, any>;
  
  // Loading states for different operations
  loadingStates: Record<string, boolean>;
}

// Action types
export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_OPERATION_LOADING'; payload: { operation: string; loading: boolean } }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_ERROR'; payload: AppError }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'SET_NETWORK_RETRYING'; payload: boolean }
  | { type: 'SET_CACHE'; payload: { key: string; data: any } }
  | { type: 'CLEAR_CACHE'; payload?: string }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  sidebarOpen: false,
  theme: 'light',
  error: null,
  errors: [],
  isOnline: navigator.onLine,
  networkRetrying: false,
  cache: {},
  loadingStates: {},
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_OPERATION_LOADING':
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.payload.operation]: action.payload.loading,
        },
      };
      
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        isAuthenticated: action.payload !== null,
      };
      
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [...state.errors, action.payload],
      };
      
    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload),
      };
      
    case 'CLEAR_ERROR':
      return { ...state, error: null };
      
    case 'CLEAR_ALL_ERRORS':
      return { ...state, errors: [] };
      
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
      
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };
      
    case 'SET_THEME':
      return { ...state, theme: action.payload };
      
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
      
    case 'SET_NETWORK_RETRYING':
      return { ...state, networkRetrying: action.payload };
      
    case 'SET_CACHE':
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.key]: action.payload.data,
        },
      };
      
    case 'CLEAR_CACHE':
      if (action.payload) {
        const { [action.payload]: _, ...rest } = state.cache;
        return { ...state, cache: rest };
      }
      return { ...state, cache: {} };
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
}

// Context interface
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Convenience methods
  setLoading: (loading: boolean) => void;
  setOperationLoading: (operation: string, loading: boolean) => void;
  isOperationLoading: (operation: string) => boolean;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => void;
  removeError: (errorId: string) => void;
  clearError: () => void;
  clearAllErrors: () => void;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCache: (key: string, data: any) => void;
  getCache: (key: string) => any;
  clearCache: (key?: string) => void;
  resetState: () => void;
  
  // Network helpers
  retryLastAction: () => void;
  handleNetworkError: (error: any, retryAction?: () => void) => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [lastFailedAction, setLastFailedAction] = React.useState<(() => void) | null>(null);
  
  // Convenience methods
  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };
  
  const setOperationLoading = (operation: string, loading: boolean) => {
    dispatch({ type: 'SET_OPERATION_LOADING', payload: { operation, loading } });
  };
  
  const isOperationLoading = (operation: string) => {
    return state.loadingStates[operation] || false;
  };
  
  const setUser = (user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  };
  
  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };
  
  const addError = (error: Omit<AppError, 'id' | 'timestamp'>) => {
    const fullError: AppError = {
      ...error,
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_ERROR', payload: fullError });
    
    // Auto-remove non-recoverable errors after 5 seconds
    if (!fullError.recoverable) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_ERROR', payload: fullError.id });
      }, 5000);
    }
  };
  
  const removeError = (errorId: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: errorId });
  };
  
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };
  
  const clearAllErrors = () => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  };
  
  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };
  
  const setSidebar = (open: boolean) => {
    dispatch({ type: 'SET_SIDEBAR', payload: open });
  };
  
  const setTheme = (theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };
  
  const setCache = (key: string, data: any) => {
    dispatch({ type: 'SET_CACHE', payload: { key, data } });
  };
  
  const getCache = (key: string) => {
    return state.cache[key];
  };
  
  const clearCache = (key?: string) => {
    dispatch({ type: 'CLEAR_CACHE', payload: key });
  };
  
  const resetState = () => {
    dispatch({ type: 'RESET_STATE' });
  };
  
  // Network error handling
  const handleNetworkError = (error: any, retryAction?: () => void) => {
    const isNetworkError = !navigator.onLine || 
      (error?.code === 'NETWORK_ERROR') ||
      (error?.message?.includes('Network Error')) ||
      (error?.message?.includes('fetch'));
    
    if (isNetworkError) {
      addError({
        type: 'network',
        message: 'Network connection lost. Please check your internet connection.',
        recoverable: true,
        retryAction,
      });
      
      if (retryAction) {
        setLastFailedAction(() => retryAction);
      }
    } else {
      addError({
        type: 'server',
        message: error?.message || 'An unexpected error occurred',
        recoverable: !!retryAction,
        retryAction,
      });
    }
  };
  
  const retryLastAction = () => {
    if (lastFailedAction) {
      dispatch({ type: 'SET_NETWORK_RETRYING', payload: true });
      clearAllErrors();
      
      try {
        lastFailedAction();
        setLastFailedAction(null);
      } catch (error) {
        handleNetworkError(error, lastFailedAction);
      } finally {
        dispatch({ type: 'SET_NETWORK_RETRYING', payload: false });
      }
    }
  };
  
  // Listen for online/offline events
  React.useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE', payload: true });
      
      // Clear network errors when back online
      const networkErrors = state.errors.filter(error => error.type === 'network');
      networkErrors.forEach(error => {
        dispatch({ type: 'REMOVE_ERROR', payload: error.id });
      });
      
      // Auto-retry last failed action when back online
      if (lastFailedAction && state.errors.some(error => error.type === 'network')) {
        setTimeout(() => {
          retryLastAction();
        }, 1000);
      }
    };
    
    const handleOffline = () => {
      dispatch({ type: 'SET_ONLINE', payload: false });
      addError({
        type: 'network',
        message: 'You are currently offline. Some features may not be available.',
        recoverable: true,
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.errors, lastFailedAction]);
  
  const value: AppContextType = {
    state,
    dispatch,
    setLoading,
    setOperationLoading,
    isOperationLoading,
    setUser,
    setError,
    addError,
    removeError,
    clearError,
    clearAllErrors,
    toggleSidebar,
    setSidebar,
    setTheme,
    setCache,
    getCache,
    clearCache,
    resetState,
    retryLastAction,
    handleNetworkError,
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}