import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add Bearer token if available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 400:
          // Bad Request - Validation errors
          return Promise.reject({
            message: data?.message || 'Validation error',
            errors: data?.errors || {},
            status: 400,
          });
        case 401:
          // Unauthorized
          return Promise.reject({
            message: 'Unauthorized. Please log in.',
            status: 401,
          });
        case 403:
          // Forbidden
          return Promise.reject({
            message: 'You do not have permission to perform this action.',
            status: 403,
          });
        case 404:
          // Not Found
          return Promise.reject({
            message: data?.message || 'Resource not found.',
            status: 404,
          });
        case 409:
          // Conflict - Version mismatch
          return Promise.reject({
            message: data?.message || 'This record has been modified by another user. Please refresh and try again.',
            status: 409,
            isConflict: true,
          });
        case 500:
          // Internal Server Error
          return Promise.reject({
            message: 'An unexpected error occurred. Please try again later.',
            status: 500,
          });
        default:
          return Promise.reject({
            message: data?.message || 'An error occurred.',
            status,
          });
      }
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: 0,
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'An unexpected error occurred.',
        status: 0,
      });
    }
  }
);

export default api;
