import axios, { AxiosResponse } from 'axios';

import { getCookie, removeCookie } from '@/lib/utils';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Don't add Authorization header for authentication endpoints
    const isAuthEndpoint = config.url?.startsWith('/auth/');

    if (!isAuthEndpoint) {
      const token = getCookie('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle unauthorized access
    if (error.response?.status === 401) {
      // Only clear token for non-auth endpoints
      const isAuthEndpoint = error.config?.url?.startsWith('/auth/');

      if (!isAuthEndpoint) {
        // Clear invalid token
        removeCookie('token');

        // Only redirect if we're not already on an auth page
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.includes('/authentication')
        ) {
          window.location.href = '/authentication/sign-in';
        }
      }
    }
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status,
      data: error.response?.data,
    });
  },
);

export default api;
