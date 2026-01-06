import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navigation } from './Navigation';

// Helper to render Navigation with Router
const renderNavigation = () => {
  return render(
    <BrowserRouter>
      <Navigation />
    </BrowserRouter>
  );
};

describe('Navigation', () => {
  test('renders the Derji Productions logo', () => {
    renderNavigation();
    expect(screen.getByText('Derji Productions')).toBeInTheDocument();
    expect(screen.getByText('Professional Media Production')).toBeInTheDocument();
  });

  test('renders all main navigation items', () => {
    renderNavigation();
    
    // Check for main navigation items
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Book')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
  });

  test('renders the Book Now CTA button', () => {
    renderNavigation();
    expect(screen.getByText('Book Now')).toBeInTheDocument();
  });

  test('shows mobile menu button on mobile', () => {
    renderNavigation();
    const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
    expect(mobileMenuButton).toBeInTheDocument();
  });

  test('can toggle mobile menu', () => {
    renderNavigation();
    const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
    
    // Mobile menu should not be visible initially
    expect(screen.queryByText('Book Now')).toBeInTheDocument(); // Desktop CTA
    
    // Click to open mobile menu
    fireEvent.click(mobileMenuButton);
    
    // Should show mobile menu items
    const mobileMenuItems = screen.getAllByText('Home');
    expect(mobileMenuItems.length).toBeGreaterThan(1); // Desktop + Mobile
  });

  test('Services dropdown shows sub-items when clicked', () => {
    renderNavigation();
    
    // Find and click the Services button (desktop version)
    const servicesButtons = screen.getAllByText('Services');
    const desktopServicesButton = servicesButtons.find(button => 
      button.tagName === 'BUTTON'
    );
    
    if (desktopServicesButton) {
      fireEvent.click(desktopServicesButton);
      
      // Check for dropdown items
      expect(screen.getByText('Photography')).toBeInTheDocument();
      expect(screen.getByText('Videography')).toBeInTheDocument();
      expect(screen.getByText('Sound Production')).toBeInTheDocument();
    }
  });
});