// Simple debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility - ensures function is called at most once per interval
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Request deduplication utility
const requestCache = new Map<string, Promise<any>>();

export function dedupeRequest<T>(
  key: string,
  requestFn: () => Promise<T>,
  ttl: number = 1000
): Promise<T> {
  // Check if we already have a pending request for this key
  if (requestCache.has(key)) {
    return requestCache.get(key)!;
  }
  
  // Create new request
  const promise = requestFn().finally(() => {
    // Remove from cache after TTL
    setTimeout(() => {
      requestCache.delete(key);
    }, ttl);
  });
  
  // Cache the promise
  requestCache.set(key, promise);
  
  return promise;
}