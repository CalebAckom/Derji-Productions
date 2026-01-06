import { createContext, useContext, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { useAppContext } from './AppContext';
import { get, post } from '@/utils/api';

// Auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { state, setUser, setLoading, setError, clearError } = useAppContext();
  
  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      clearError();
      
      const response = await post<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>('/auth/login', { email, password });
      
      // Store tokens
      localStorage.setItem('authToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Set user in state
      setUser(response.user);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Call logout endpoint if token exists
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          await post('/auth/logout');
        } catch (error) {
          // Ignore logout API errors, still clear local state
          console.warn('Logout API call failed:', error);
        }
      }
      
      // Clear tokens and user state
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      clearError();
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh token function
  const refreshToken = async (): Promise<void> => {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await post<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>('/auth/refresh', { refreshToken: refreshTokenValue });
      
      // Update tokens
      localStorage.setItem('authToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Update user in state
      setUser(response.user);
      
    } catch (error) {
      // Refresh failed, clear tokens and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      throw error;
    }
  };
  
  // Check authentication status
  const checkAuth = async (): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setUser(null);
      return;
    }
    
    try {
      setLoading(true);
      
      // Verify token with backend
      const user = await get<User>('/auth/me');
      setUser(user);
      
    } catch (error) {
      // Token invalid, try to refresh
      try {
        await refreshToken();
      } catch (refreshError) {
        // Refresh failed, clear everything
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);
  
  // Auto-refresh token before expiration
  useEffect(() => {
    if (!state.isAuthenticated) return;
    
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    // Parse JWT to get expiration (simplified - in production use a proper JWT library)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;
      
      // Refresh 5 minutes before expiration
      const refreshTime = Math.max(timeUntilExpiration - 5 * 60 * 1000, 0);
      
      if (refreshTime > 0) {
        const timeoutId = setTimeout(() => {
          refreshToken().catch((error) => {
            console.error('Auto-refresh failed:', error);
            logout();
          });
        }, refreshTime);
        
        return () => clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }, [state.isAuthenticated]);
  
  const value: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    logout,
    refreshToken,
    checkAuth,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}