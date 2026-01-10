import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export function AdminHeader() {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  return (
    <header className="bg-white shadow-sm border-b border-secondary-200 fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-primary-900">
            Derji Productions Admin
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-md transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7h6m0 0V3m0 4l4-4M9 7L5 3m4 4v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2m4 0V3a2 2 0 012-2h4a2 2 0 012 2v4" />
            </svg>
          </button>
          
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-2 text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100 rounded-md transition-colors"
            >
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {user?.firstName?.[0] || user?.email[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
              </span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-secondary-200 py-1 z-50">
                <div className="px-4 py-2 text-sm text-secondary-500 border-b border-secondary-100">
                  {user?.email}
                </div>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    // Navigate to profile settings if implemented
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                >
                  Profile Settings
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}