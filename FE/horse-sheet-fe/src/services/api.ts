import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: send cookies (refresh token)
});

// Request interceptor - Add Bearer token if available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - try to refresh token
    // Skip if:
    // 1. This is already a retry
    // 2. This is an initialization request
    // 3. This is the refresh endpoint itself (to avoid infinite loops)
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');
    const authStore = useAuthStore();
    const storeIsRefreshing = authStore.isRefreshing;
    
    if (error.response?.status === 401 && !originalRequest._retry && !(originalRequest as any)._skipAuthRefresh && !isRefreshEndpoint) {
      // Check both local and store refresh state to prevent concurrent refreshes
      if (isRefreshing || storeIsRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await authStore.refreshToken();
        processQueue(null, newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

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
          // Unauthorized (after refresh failed or during initialization)
          // If this is an initialization request, return a silent error
          if ((originalRequest as any)._skipAuthRefresh) {
            return Promise.reject({
              message: 'No valid session',
              status: 401,
              silent: true, // Flag to indicate this is expected
            });
          }
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
