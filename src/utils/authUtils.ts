import type { UrlTokenPayload } from '@/types/auth';

/**
 * Parse JWT token and return decoded payload
 */
export function parseJWT(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT:', error);
    return null;
  }
}

/**
 * Decode base64 URL token
 */
export function decodeUrlToken(base64Token: string): UrlTokenPayload | null {
  try {
    // Remove any URL encoding
    const cleanToken = base64Token.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode base64
    const decoded = atob(cleanToken);
    
    // Parse JSON
    const payload: UrlTokenPayload = JSON.parse(decoded);
    
    return payload;
  } catch (error) {
    console.error('Failed to decode URL token:', error);
    return null;
  }
}

/**
 * Validate URL token (check expiration if present)
 */
export function validateUrlToken(payload: UrlTokenPayload): boolean {
  if (!payload) return false;
  
  // Check if token has expiration
  if (payload.exp) {
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp < currentTime) {
      return false;
    }
  }
  
  // Check required fields
  if (!payload.JWTtoken || !payload.refresh_token || !payload.Id) {
    return false;
  }
  
  return true;
}

export type { UrlTokenPayload };
