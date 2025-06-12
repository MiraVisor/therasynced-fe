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

interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  // Set secure flag in production
  const secure = process.env.NODE_ENV === 'production' ? ';Secure' : '';
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict${secure}`;
};

export const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export const getDecodedToken = (): DecodedToken | null => {
  if (typeof window !== 'undefined') {
    const token = getCookie('token');
    if (token) {
      try {
        return jwtDecode<DecodedToken>(token);
      } catch (error) {
        return null;
      }
    }
  }
  return null;
};

export function isRole(value: unknown): value is ROLES {
  return typeof value === 'string' && Object.values(ROLES).includes(value as ROLES);
}
