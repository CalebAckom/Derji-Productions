import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Route to label mapping
const routeLabels: Record<string, string> = {
  '': 'Home',
  'about': 'About',
  'services': 'Services',
  'photography': 'Photography',
  'videography': 'Videography',
  'sound': 'Sound Production',
  'portfolio': 'Portfolio',
  'book': 'Book',
  'contact': 'Contact',
  'location': 'Location',
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const location = useLocation();
  
  // Generate breadcrumb items from current path if not provided
  const breadcrumbItems = items || generateBreadcrumbItems(location.pathname);
  
  // Don't show breadcrumb on home page or if only one item
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg 
                className="w-4 h-4 text-secondary-400 mx-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            
            {item.path && index < breadcrumbItems.length - 1 ? (
              <Link
                to={item.path}
                className="text-secondary-600 hover:text-primary-600 transition-colors duration-200 font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span 
                className={`font-medium ${
                  index === breadcrumbItems.length - 1 
                    ? 'text-primary-600' 
                    : 'text-secondary-600'
                }`}
                aria-current={index === breadcrumbItems.length - 1 ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];
  
  // Always start with Home
  items.push({ label: 'Home', path: '/' });
  
  // Build breadcrumb from path segments
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // Add path for all items except the last one (current page)
    const isLastItem = index === pathSegments.length - 1;
    items.push({
      label,
      path: isLastItem ? undefined : currentPath
    });
  });
  
  return items;
}

export default Breadcrumb;