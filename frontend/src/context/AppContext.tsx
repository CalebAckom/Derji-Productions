import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User } from '@/types';

// State interface
export interface AppState {
  // Authentication state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // UI state
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  
  // Error state
  error: string | null;
  
  // Network state
  isOnline: boolean;
  
  // Cache state
  cache: Record<string, any>;
}

// Action types
export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_ONLINE'; payload: boolean }
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
  isOnline: navigator.onLine,
  cache: {},
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
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
      
    case 'CLEAR_ERROR':
      return { ...state, error: null };
      
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
      
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };
      
    case 'SET_THEME':
      return { ...state, theme: action.payload };
      
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
      
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
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCache: (key: string, data: any) => void;
  getCache: (key: string) => any;
  clearCache: (key?: string) => void;
  resetState: () => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Convenience methods
  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };
  
  const setUser = (user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  };
  
  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };
  
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
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
  
  // Listen for online/offline events
  React.useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE', payload: false });
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const value: AppContextType = {
    state,
    dispatch,
    setLoading,
    setUser,
    setError,
    clearError,
    toggleSidebar,
    setSidebar,
    setTheme,
    setCache,
    getCache,
    clearCache,
    resetState,
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