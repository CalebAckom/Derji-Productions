/**
 * Responsive breakpoints utility for Derji Productions
 * Provides consistent breakpoint values and utilities for responsive design
 */

export const breakpoints = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1600,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Get the pixel value for a breakpoint
 */
export function getBreakpointValue(breakpoint: Breakpoint): number {
  return breakpoints[breakpoint];
}

/**
 * Check if current window width matches a breakpoint
 */
export function isBreakpoint(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints[breakpoint];
}

/**
 * Get current breakpoint based on window width
 */
export function getCurrentBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'sm';
  
  const width = window.innerWidth;
  
  if (width >= breakpoints['3xl']) return '3xl';
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

/**
 * React hook for responsive breakpoints
 */
import { useState, useEffect } from 'react';

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => getCurrentBreakpoint());

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getCurrentBreakpoint());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

/**
 * React hook to check if current breakpoint is at least the specified one
 */
export function useBreakpointUp(targetBreakpoint: Breakpoint): boolean {
  const currentBreakpoint = useBreakpoint();
  return breakpoints[currentBreakpoint] >= breakpoints[targetBreakpoint];
}

/**
 * React hook to check if current breakpoint is below the specified one
 */
export function useBreakpointDown(targetBreakpoint: Breakpoint): boolean {
  const currentBreakpoint = useBreakpoint();
  return breakpoints[currentBreakpoint] < breakpoints[targetBreakpoint];
}

/**
 * Media query strings for CSS-in-JS
 */
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs}px)`,
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,
  '3xl': `(min-width: ${breakpoints['3xl']}px)`,
} as const;

/**
 * Responsive spacing utility
 */
export const responsiveSpacing = {
  xs: {
    container: 'px-4',
    section: 'py-8',
    gap: 'gap-4',
  },
  sm: {
    container: 'px-6',
    section: 'py-12',
    gap: 'gap-6',
  },
  md: {
    container: 'px-8',
    section: 'py-16',
    gap: 'gap-8',
  },
  lg: {
    container: 'px-12',
    section: 'py-20',
    gap: 'gap-12',
  },
  xl: {
    container: 'px-16',
    section: 'py-24',
    gap: 'gap-16',
  },
} as const;