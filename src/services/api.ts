import axios, { AxiosResponse } from 'axios';

import { getCookie, isTokenValid } from '@/lib/utils';
import { checkAuth, setRole } from '@/redux/slices/authSlice';
import { store } from '@/redux/store';

// Validate backend URL configuration
if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
  console.error('NEXT_PUBLIC_BACKEND_URL environment variable is not set!');
  throw new Error(
    'Backend URL not configured. Please set NEXT_PUBLIC_BACKEND_URL environment variable.',
  );
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// List of endpoints that don't require authentication
const publicEndpoints = ['/auth/login', '/auth/signup', '/auth/forgot-password'];

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Skip token validation for public endpoints
    const isPublicEndpoint = publicEndpoints.some((endpoint) => config.url?.includes(endpoint));

    if (!isPublicEndpoint) {
      // Check token validity before each request
      if (!isTokenValid()) {
        store.dispatch(checkAuth());
        return Promise.reject(new Error('Token is invalid or expired'));
      }

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
      store.dispatch(checkAuth());
    }
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status,
      data: error.response?.data,
    });
  },
);

export default api;
