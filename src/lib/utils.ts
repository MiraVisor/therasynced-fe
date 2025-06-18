import { type ClassValue, clsx } from 'clsx';
import { jwtDecode } from 'jwt-decode';
import { twMerge } from 'tailwind-merge';

import { ROLES } from '@/types/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

interface CookieOptions {
  days?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export const setCookie = (name: string, value: string, options: CookieOptions = {}) => {
  const {
    days = 7,
    path = '/',
    domain,
    secure = process.env.NODE_ENV === 'production',
    sameSite = process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax', // Strict in prod, Lax in dev
  } = options;

  // Validate inputs
  if (!name || typeof name !== 'string') {
    throw new Error('Cookie name must be a non-empty string');
  }

  if (typeof value !== 'string') {
    throw new Error('Cookie value must be a string');
  }

  // Build cookie string
  let cookieString = `${name}=${encodeURIComponent(value)}`;

  // Add expiration
  if (days > 0) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    cookieString += `;expires=${expires.toUTCString()}`;
  }

  // Add path
  cookieString += `;path=${path}`;

  // Add domain if specified
  if (domain) {
    cookieString += `;domain=${domain}`;
  }

  // Add SameSite
  cookieString += `;SameSite=${sameSite}`;

  // Add secure flag
  if (secure) {
    cookieString += ';Secure';
  }

  // Set the cookie
  try {
    document.cookie = cookieString;
  } catch (error) {
    throw new Error('Failed to set cookie');
  }
};

export const getCookie = (name: string): string | null => {
  // Validate input
  if (!name || typeof name !== 'string') {
    return null;
  }

  try {
    // More robust cookie parsing
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');

      if (cookieName === name) {
        return cookieValue ? decodeURIComponent(cookieValue) : null;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const removeCookie = (name: string, options: Partial<CookieOptions> = {}) => {
  const {
    path = '/',
    domain,
    secure = process.env.NODE_ENV === 'production',
    sameSite = process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax', // Strict in prod, Lax in dev
  } = options;

  // Validate input
  if (!name || typeof name !== 'string') {
    return;
  }

  // Build deletion string with the same attributes it was set with
  let deletionString = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;

  // Add domain if specified
  if (domain) {
    deletionString += `;domain=${domain}`;
  }

  // Add SameSite
  deletionString += `;SameSite=${sameSite}`;

  // Add secure flag
  if (secure) {
    deletionString += ';Secure';
  }

  // Delete cookie with the same attributes it was set with
  try {
    document.cookie = deletionString;

    // Also delete without SameSite for broader compatibility
    const fallbackDeletion = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}${secure ? ';Secure' : ''}`;
    document.cookie = fallbackDeletion;
  } catch (error) {
    console.error('Failed to remove cookie:', error);
  }
};

export const isTokenExpired = (token: DecodedToken): boolean => {
  const currentTime = Math.floor(Date.now() / 1000);
  return token.exp < currentTime;
};

export const getDecodedToken = (): DecodedToken | null => {
  if (typeof window !== 'undefined') {
    const token = getCookie('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);

        // Check if token is expired
        if (isTokenExpired(decodedToken)) {
          // Token is expired, remove it
          removeCookie('token');
          return null;
        }

        return decodedToken;
      } catch (error) {
        // If token is invalid, remove it
        removeCookie('token');
        return null;
      }
    }
  }
  return null;
};

export const isTokenValid = (): boolean => {
  const token = getDecodedToken();
  return token !== null && !isTokenExpired(token);
};

export function isRole(value: unknown): value is ROLES {
  return typeof value === 'string' && Object.values(ROLES).includes(value as ROLES);
}
