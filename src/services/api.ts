import axios, { AxiosResponse } from 'axios';

import { getCookie, removeCookie } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  baseURL: process.env['NEXT_PUBLIC_BACKEND_URL'],
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Don't add Authorization header for authentication endpoints or public endpoints
    const isAuthEndpoint = config.url?.startsWith('/auth/');
    const isPublicEndpoint =
      config.headers?.['X-Skip-Auth'] === 'true' ||
      config.url?.startsWith('/service/job-titles') ||
      config.url?.startsWith('/service/categories');

    if (!isAuthEndpoint && !isPublicEndpoint) {
      const token = getCookie('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Remove the skip auth header if it was set
    if (config.headers?.['X-Skip-Auth']) {
      delete config.headers['X-Skip-Auth'];
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
        // Use Zustand store to logout
        useAuthStore.getState().logout();

        // Note: logout already removes the cookie, but we keep removeCookie
        // here as a safety measure in case the action hasn't run yet
        removeCookie('token');

        // Only redirect if we're not already on an auth page or landing page
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.includes('/authentication') &&
          window.location.pathname !== '/'
        ) {
          window.location.href = '/';
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
