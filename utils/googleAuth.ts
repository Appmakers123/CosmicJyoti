/**
 * Google Sign-In: decode JWT credential and build User.
 * Used with @react-oauth/google (credential is the ID token JWT).
 */
import type { User } from '../types';

/**
 * Decode JWT payload (middle part) without a library.
 * Google ID token payload: sub, email, name, picture, email_verified, etc.
 */
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT');
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(b64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * Build app User from Google credential (ID token JWT).
 */
export function userFromGoogleCredential(credential: string): User {
  const payload = decodeJwtPayload(credential);
  const sub = (payload.sub as string) || `google_${Date.now()}`;
  const email = (payload.email as string) || '';
  const name = (payload.name as string) || (payload.given_name as string) || email || 'User';
  const picture = payload.picture as string | undefined;

  return {
    id: sub,
    name,
    email,
    photoUrl: picture,
    idToken: credential,
    isGuest: false,
  };
}
