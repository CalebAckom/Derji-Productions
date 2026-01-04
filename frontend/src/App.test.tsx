import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />);
    const heading = screen.getByText('Welcome to Derji Productions');
    expect(heading).toBeInTheDocument();
  });

  it('renders the three service categories', () => {
    render(<App />);
    expect(screen.getByText('Photography')).toBeInTheDocument();
    expect(screen.getByText('Videography')).toBeInTheDocument();
    expect(screen.getByText('Sound Production')).toBeInTheDocument();
  });
});