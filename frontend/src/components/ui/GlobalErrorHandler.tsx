import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { ErrorNotificationContainer, OfflineIndicator, NetworkRetryBanner } from './ErrorNotification';

export function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
  const { addError } = useAppContext();

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      addError({
        type: 'unknown',
        message: 'An unexpected error occurred in the application',
        details: event.reason,
        recoverable: false,
      });
      
      // Prevent the default browser behavior
      event.preventDefault();
    };

    // Handle global JavaScript errors
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      
      addError({
        type: 'client',
        message: 'A JavaScript error occurred',
        details: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
        },
        recoverable: false,
      });
    };

    // Handle resource loading errors
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
        console.error('Resource loading error:', target);
        
        addError({
          type: 'network',
          message: `Failed to load ${target.tagName.toLowerCase()}`,
          details: {
            src: (target as any).src || (target as any).href,
            tagName: target.tagName,
          },
          recoverable: true,
          retryAction: () => {
            // Attempt to reload the resource
            if (target.tagName === 'IMG') {
              const img = target as HTMLImageElement;
              const src = img.src;
              img.src = '';
              img.src = src;
            } else if (target.tagName === 'SCRIPT') {
              const script = target as HTMLScriptElement;
              const newScript = document.createElement('script');
              newScript.src = script.src;
              script.parentNode?.replaceChild(newScript, script);
            }
          },
        });
      }
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('error', handleResourceError, true); // Use capture phase for resource errors

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('error', handleResourceError, true);
    };
  }, [addError]);

  return (
    <>
      {children}
      <ErrorNotificationContainer />
      <OfflineIndicator />
      <NetworkRetryBanner />
    </>
  );
}

// Performance monitoring component
export function PerformanceMonitor() {
  const { addError } = useAppContext();

  useEffect(() => {
    // Monitor for slow page loads
    const checkPageLoadTime = () => {
      if ('performance' in window && 'timing' in window.performance) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        
        // If page takes more than 5 seconds to load, show a warning
        if (loadTime > 5000) {
          addError({
            type: 'client',
            message: 'Page loaded slowly. This might affect your experience.',
            details: { loadTime },
            recoverable: false,
          });
        }
      }
    };

    // Check after page load
    if (document.readyState === 'complete') {
      setTimeout(checkPageLoadTime, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(checkPageLoadTime, 1000);
      });
    }

    // Monitor for memory usage (if available)
    const checkMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
        
        // If using more than 80% of available memory, show warning
        if (usedMB / limitMB > 0.8) {
          addError({
            type: 'client',
            message: 'High memory usage detected. Consider refreshing the page.',
            details: { usedMB: Math.round(usedMB), limitMB: Math.round(limitMB) },
            recoverable: true,
            retryAction: () => window.location.reload(),
          });
        }
      }
    };

    // Check memory usage every 30 seconds
    const memoryInterval = setInterval(checkMemoryUsage, 30000);

    return () => {
      clearInterval(memoryInterval);
    };
  }, [addError]);

  return null;
}

// Accessibility error monitor
export function AccessibilityMonitor() {
  const { addError } = useAppContext();

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Check for common accessibility issues
    const checkAccessibility = () => {
      const issues: string[] = [];

      // Check for images without alt text
      const images = document.querySelectorAll('img:not([alt])');
      if (images.length > 0) {
        issues.push(`${images.length} images missing alt text`);
      }

      // Check for buttons without accessible names
      const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
      const buttonsWithoutText = Array.from(buttons).filter(btn => !btn.textContent?.trim());
      if (buttonsWithoutText.length > 0) {
        issues.push(`${buttonsWithoutText.length} buttons without accessible names`);
      }

      // Check for form inputs without labels
      const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      const inputsWithoutLabels = Array.from(inputs).filter(input => {
        const id = input.getAttribute('id');
        return !id || !document.querySelector(`label[for="${id}"]`);
      });
      if (inputsWithoutLabels.length > 0) {
        issues.push(`${inputsWithoutLabels.length} form inputs without labels`);
      }

      if (issues.length > 0) {
        console.warn('Accessibility issues detected:', issues);
        // Don't show these as user-facing errors, just log them
      }
    };

    // Check accessibility after DOM changes
    const observer = new MutationObserver(() => {
      setTimeout(checkAccessibility, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial check
    setTimeout(checkAccessibility, 1000);

    return () => {
      observer.disconnect();
    };
  }, [addError]);

  return null;
}