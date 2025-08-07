import axios, { AxiosResponse } from 'axios';

import { getCookie, removeCookie } from '@/lib/utils';
import { logout, setRole } from '@/redux/slices';
import { store } from '@/redux/store';

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
    // Update role from server response if available
    if (response.data?.user?.role) {
      store.dispatch(setRole(response.data.user.role));
    }
    return response;
  },
  (error) => {
    // Handle unauthorized access
    if (error.response?.status === 401) {
      // Only clear token and redirect for non-auth endpoints
      const isAuthEndpoint = error.config?.url?.startsWith('/auth/');

      if (!isAuthEndpoint) {
        // Clear invalid token and logout user
        removeCookie('token');
        store.dispatch(logout());

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
