/**
 * API Client Helper
 * Ensures API calls always use absolute URLs to avoid locale prefix issues
 */

/**
 * Get the absolute API URL
 * This prevents Next.js from adding locale prefixes to API routes
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In browser, use window.location.origin
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/${cleanPath}`;
  }
  
  // On server, just return the path (will be resolved correctly)
  return `/${cleanPath}`;
}

/**
 * Fetch wrapper that automatically handles API URLs
 */
export async function apiFetch(path: string, options?: RequestInit) {
  const url = getApiUrl(path);
  return fetch(url, options);
}
