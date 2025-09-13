/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Type definitions for Google Identity Services
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
          revoke: (email: string, callback: (response: any) => void) => void;
        };
      };
    };
  }
}

export interface GoogleAuthResponse {
  credential: string;
  select_by: string;
}

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

/**
 * Initialize Google OAuth
 */
export const initializeGoogleAuth = (onSuccess: (response: GoogleAuthResponse) => void) => {
  if (!GOOGLE_CLIENT_ID) {
    console.error('Google Client ID is not configured');
    return;
  }

  if (typeof window !== 'undefined' && window.google) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: onSuccess,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }
};

/**
 * Render Google Sign-In button
 */
export const renderGoogleButton = (
  element: HTMLElement,
  onSuccess: (response: GoogleAuthResponse) => void,
) => {
  if (!GOOGLE_CLIENT_ID) {
    console.error('Google Client ID is not configured');
    return;
  }

  initializeGoogleAuth(onSuccess);

  if (typeof window !== 'undefined' && window.google && element) {
    window.google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      width: '100%',
      text: 'signin_with',
      shape: 'rectangular',
    });
  }
};

/**
 * Trigger Google One Tap
 */
export const triggerGoogleOneTap = (onSuccess: (response: GoogleAuthResponse) => void) => {
  if (!GOOGLE_CLIENT_ID) {
    console.error('Google Client ID is not configured');
    return;
  }

  initializeGoogleAuth(onSuccess);

  if (typeof window !== 'undefined' && window.google) {
    window.google.accounts.id.prompt();
  }
};

/**
 * Decode JWT token to get user information
 */
export const decodeGoogleJWT = (credential: string): GoogleUserInfo | null => {
  try {
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding Google JWT:', error);
    return null;
  }
};

/**
 * Sign out from Google
 */
export const signOutFromGoogle = (email: string) => {
  if (typeof window !== 'undefined' && window.google) {
    window.google.accounts.id.revoke(email, (response: any) => {
      console.log('Google sign out response:', response);
    });
  }
};
