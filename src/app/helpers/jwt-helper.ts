/**
 * Helper functions for JWT token handling
 */

/**
 * Store JWT token in localStorage
 * @param token JWT token string
 * @returns boolean indicating if token was successfully stored
 */
export function storeJwt(token: string | null | undefined): boolean {
  if (!token) {
    console.error('Attempted to store null or undefined token');
    return false;
  }

  try {
    // Validate JWT format
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return false;
    }

    // Check if we can decode the payload
    JSON.parse(atob(parts[1]));

    // Store token
    localStorage.setItem('token', token);
    return true;
  } catch (e) {
    console.error('Error storing JWT:', e);
    return false;
  }
}

/**
 * Parse JWT token and extract payload
 * @param token JWT token string
 * @returns Decoded payload or null if token is invalid
 */
export function parseJwt(token: string | null): any {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

/**
 * Check if token is valid and not expired
 * @param token JWT token string
 * @returns boolean indicating if token is valid
 */
export function isValidJwt(token: string | null): boolean {
  if (!token) return false;

  try {
    const payload = parseJwt(token);
    if (!payload) return false;

    // Check if token is expired
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() < expiryTime;
  } catch (e) {
    console.error('Error validating JWT:', e);
    return false;
  }
}
