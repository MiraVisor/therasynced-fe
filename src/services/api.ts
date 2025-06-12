import axios, { AxiosResponse } from 'axios';

import { getCookie } from '@/lib/utils';
import { setRole } from '@/redux/slices/authSlice';
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
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      store.dispatch(setRole(response.data.user.role)); //TODO: check if this is needed or we can use the role from the token and also check if role is coming from response
    }
    return response;
  },
  (error) => {
    // Handle unauthorized access
    if (error.response?.status === 401) {
      store.dispatch(setRole(null));
    }
    return Promise.reject({
      message: error.response?.data?.message || 'Something went wrong',
      status: error.response?.status,
      data: error.response?.data,
    });
  },
);

export default api;
