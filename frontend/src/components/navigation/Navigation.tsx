import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  subItems?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'about', label: 'About', path: '/about' },
  { 
    id: 'services', 
    label: 'Services', 
    path: '/services',
    subItems: [
      { id: 'photography', label: 'Photography', path: '/services/photography' },
      { id: 'videography', label: 'Videography', path: '/services/videography' },
      { id: 'sound', label: 'Sound Production', path: '/services/sound' },
    ]
  },
  { id: 'portfolio', label: 'Portfolio', path: '/portfolio' },
  { id: 'book', label: 'Book', path: '/book' },
  { id: 'contact', label: 'Contact', path: '/contact' },
  { id: 'location', label: 'Location', path: '/location' },
];

interface NavigationProps {
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ className = '' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdown]);

  const isActiveRoute = (path: string, subItems?: NavigationItem[]) => {
    if (location.pathname === path) return true;
    if (subItems) {
      return subItems.some(item => location.pathname === item.path);
    }
    return false;
  };

  const handleDropdownToggle = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveDropdown(activeDropdown === itemId ? null : itemId);
  };

  const scrollToSection = (sectionId: string) => {
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  return (
    <nav className={`bg-secondary-900 border-b border-primary-500/20 relative ${className}`}>
      {/* Circuit board pattern overlay */}
      <div className="absolute inset-0 bg-circuit-pattern opacity-10 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
            onClick={() => scrollToSection('home')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-golden group-hover:shadow-golden-lg transition-all duration-300">
              <span className="text-secondary-900 font-bold text-lg">D</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-display font-bold text-primary-400 group-hover:text-primary-300 transition-colors">
                Derji Productions
              </h1>
              <p className="text-xs text-secondary-400 -mt-1">Professional Media Production</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <div key={item.id} className="relative">
                {item.subItems ? (
                  <div className="relative">
                    <button
                      onClick={(e) => handleDropdownToggle(item.id, e)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                        isActiveRoute(item.path, item.subItems)
                          ? 'text-primary-400 bg-primary-500/10 shadow-golden'
                          : 'text-secondary-300 hover:text-primary-400 hover:bg-secondary-800/50'
                      }`}
                    >
                      <span>{item.label}</span>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === item.id ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {activeDropdown === item.id && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-secondary-800 border border-primary-500/20 rounded-lg shadow-xl z-50 animate-slide-down">
                        <div className="py-2">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.id}
                              to={subItem.path}
                              className={`block px-4 py-2 text-sm transition-colors ${
                                location.pathname === subItem.path
                                  ? 'text-primary-400 bg-primary-500/10'
                                  : 'text-secondary-300 hover:text-primary-400 hover:bg-secondary-700/50'
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => item.id !== 'home' ? undefined : scrollToSection('home')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveRoute(item.path)
                        ? 'text-primary-400 bg-primary-500/10 shadow-golden'
                        : 'text-secondary-300 hover:text-primary-400 hover:bg-secondary-800/50'
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button 
              variant="golden" 
              size="sm"
              onClick={() => scrollToSection('book')}
            >
              Book Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-secondary-300 hover:text-primary-400 hover:bg-secondary-800/50 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 h-6 relative">
              <span className={`absolute block w-full h-0.5 bg-current transform transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 top-3' : 'top-1'
              }`}></span>
              <span className={`absolute block w-full h-0.5 bg-current transform transition-all duration-300 top-3 ${
                isMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}></span>
              <span className={`absolute block w-full h-0.5 bg-current transform transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 top-3' : 'top-5'
              }`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-secondary-800 border-t border-primary-500/20 shadow-xl z-40 animate-slide-down">
            <div className="px-4 py-6 space-y-2">
              {navigationItems.map((item) => (
                <div key={item.id}>
                  {item.subItems ? (
                    <div>
                      <button
                        onClick={(e) => handleDropdownToggle(item.id, e)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                          isActiveRoute(item.path, item.subItems)
                            ? 'text-primary-400 bg-primary-500/10'
                            : 'text-secondary-300 hover:text-primary-400 hover:bg-secondary-700/50'
                        }`}
                      >
                        <span className="font-medium">{item.label}</span>
                        <svg 
                          className={`w-5 h-5 transition-transform duration-200 ${
                            activeDropdown === item.id ? 'rotate-180' : ''
                          }`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {activeDropdown === item.id && (
                        <div className="mt-2 ml-4 space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.id}
                              to={subItem.path}
                              className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                                location.pathname === subItem.path
                                  ? 'text-primary-400 bg-primary-500/10'
                                  : 'text-secondary-400 hover:text-primary-400 hover:bg-secondary-700/50'
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => item.id !== 'home' ? undefined : scrollToSection('home')}
                      className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                        isActiveRoute(item.path)
                          ? 'text-primary-400 bg-primary-500/10'
                          : 'text-secondary-300 hover:text-primary-400 hover:bg-secondary-700/50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
              
              {/* Mobile CTA Button */}
              <div className="pt-4 border-t border-secondary-700">
                <Button 
                  variant="golden" 
                  size="sm" 
                  className="w-full"
                  onClick={() => scrollToSection('book')}
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;