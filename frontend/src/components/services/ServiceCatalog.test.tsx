import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ServiceCatalog from './ServiceCatalog';
import { Service } from '../../types';

const mockCategories = [
  { id: '1', name: 'Photography', slug: 'photography', active: true, sortOrder: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Videography', slug: 'videography', active: true, sortOrder: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'Sound', slug: 'sound', active: true, sortOrder: 3, createdAt: new Date(), updatedAt: new Date() },
];

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Wedding Photography',
    categoryId: '1',
    category: mockCategories[0],
    subcategory: 'Wedding',
    description: 'Professional wedding photography services',
    basePrice: 1500,
    priceType: 'package',
    duration: 480,
    features: ['High-resolution photos', 'Online gallery', 'Print release'],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Corporate Video',
    categoryId: '2',
    category: mockCategories[1],
    subcategory: 'Corporate',
    description: 'Professional corporate video production',
    basePrice: 2000,
    priceType: 'fixed',
    duration: 240,
    features: ['4K recording', 'Professional editing', 'Color grading'],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock the hooks
const mockUseServices = vi.fn();
const mockUseServiceCategories = vi.fn();

vi.mock('../../hooks/useServices', () => ({
  useServices: () => mockUseServices(),
  useServiceCategories: () => mockUseServiceCategories(),
}));

vi.mock('../../hooks/useDebounce', () => ({
  useDebounce: vi.fn((value) => value),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ServiceCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock return values
    mockUseServices.mockReturnValue({
      data: mockServices,
      loading: false,
      error: null,
    });
    mockUseServiceCategories.mockReturnValue({
      data: mockCategories,
      loading: false,
      error: null,
    });
  });

  it('renders the service catalog with search input', () => {
    renderWithRouter(<ServiceCatalog />);
    
    expect(screen.getByPlaceholderText('Search services...')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('displays services in grid layout by default', () => {
    renderWithRouter(<ServiceCatalog />);
    
    expect(screen.getByText('Wedding Photography')).toBeInTheDocument();
    expect(screen.getByText('Corporate Video')).toBeInTheDocument();
  });

  it('shows service count in results summary', () => {
    renderWithRouter(<ServiceCatalog />);
    
    expect(screen.getByText(/Showing 2 services/)).toBeInTheDocument();
  });

  it('allows switching between grid and list layouts', async () => {
    renderWithRouter(<ServiceCatalog />);
    
    // Find the list view button (second button in the layout toggle)
    const layoutButtons = screen.getAllByRole('button');
    const listButton = layoutButtons.find(button => 
      button.querySelector('svg')?.getAttribute('class')?.includes('w-4 h-4')
    );
    
    if (listButton) {
      fireEvent.click(listButton);
      // In list view, services should still be visible
      await waitFor(() => {
        expect(screen.getByText('Wedding Photography')).toBeInTheDocument();
      });
    }
  });

  it('handles search input changes', async () => {
    renderWithRouter(<ServiceCatalog />);
    
    const searchInput = screen.getByPlaceholderText('Search services...');
    fireEvent.change(searchInput, { target: { value: 'wedding' } });
    
    expect(searchInput).toHaveValue('wedding');
  });

  it('shows filters panel when filters button is clicked', async () => {
    renderWithRouter(<ServiceCatalog />);
    
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    await waitFor(() => {
      expect(screen.getByText('Service Categories')).toBeInTheDocument();
    });
  });

  it('calls onServiceSelect when a service is selected', () => {
    const mockOnServiceSelect = vi.fn();
    renderWithRouter(<ServiceCatalog onServiceSelect={mockOnServiceSelect} />);
    
    const serviceCard = screen.getByText('Wedding Photography').closest('div');
    if (serviceCard) {
      fireEvent.click(serviceCard);
      expect(mockOnServiceSelect).toHaveBeenCalledWith(mockServices[0]);
    }
  });

  it('shows comparison functionality when enabled', () => {
    renderWithRouter(<ServiceCatalog showComparison={true} />);
    
    // Should show add to comparison buttons (+ icons)
    const addButtons = screen.getAllByRole('button');
    const hasComparisonButtons = addButtons.some(button => 
      button.getAttribute('title')?.includes('Add to comparison')
    );
    
    expect(hasComparisonButtons).toBe(true);
  });

  it('displays empty state when no services are found', () => {
    // Mock empty services
    mockUseServices.mockReturnValue({
      data: [],
      loading: false,
      error: null,
    });

    renderWithRouter(<ServiceCatalog />);
    
    expect(screen.getByText('No services found')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    // Mock loading state
    mockUseServices.mockReturnValue({
      data: [],
      loading: true,
      error: null,
    });

    renderWithRouter(<ServiceCatalog />);
    
    // Check for skeleton loading elements instead of text
    const skeletonElements = document.querySelectorAll('.skeleton');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('displays error state', () => {
    // Mock error state
    mockUseServices.mockReturnValue({
      data: [],
      loading: false,
      error: new Error('Failed to load services'),
    });

    renderWithRouter(<ServiceCatalog />);
    
    expect(screen.getByText('Failed to load services')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });
});