import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';
import router from '../router';

export interface User {
  userId: string;
  email: string;
  roles: string[];
}

export const useAuthStore = defineStore('auth', () => {
  // Store access token in memory (not localStorage)
  const accessToken = ref<string | null>(null);
  const user = ref<User | null>(null);
  const isRefreshing = ref(false);
  const refreshPromise = ref<Promise<string> | null>(null);
  const isInitialized = ref(false);

  const isAuthenticated = computed(() => !!accessToken.value);

  function setAccessToken(token: string) {
    accessToken.value = token;
  }

  function setUser(userData: User) {
    user.value = userData;
  }

  function clearAuth() {
    accessToken.value = null;
    user.value = null;
    isRefreshing.value = false;
    refreshPromise.value = null;
  }

  async function login(email: string, password: string): Promise<void> {
    const response = await api.post<{ data: { accessToken: string } }>('/auth/login', {
      email,
      password,
    });
    
    // Debug: Log the full response structure
    console.log('Login response:', response);
    console.log('Login response.data:', response.data);
    
    // Check if accessToken exists in response
    const token = response.data?.data?.accessToken;
    if (!token) {
      console.error('No accessToken in response. Full response:', response);
      throw new Error('Invalid response: accessToken not found');
    }
    
    setAccessToken(token);
    console.log('Token set successfully');
    // Extract user info from token (basic implementation)
    // In production, you might want to decode JWT or call a /me endpoint
  }

  async function refreshToken(silent = false): Promise<string> {
    // Prevent concurrent refresh calls
    if (isRefreshing.value && refreshPromise.value) {
      return refreshPromise.value;
    }

    isRefreshing.value = true;
    refreshPromise.value = api
      .post<{ data: { accessToken: string } }>('/auth/refresh')
      .then((response) => {
        const newToken = response.data.data.accessToken;
        setAccessToken(newToken);
        return newToken;
      })
      .catch((error) => {
        if (!silent) {
          clearAuth();
          router.push('/login');
        }
        throw error;
      })
      .finally(() => {
        isRefreshing.value = false;
        refreshPromise.value = null;
      });

    return refreshPromise.value;
  }

  /**
   * Initialize auth state on app load by attempting to refresh the token
   * This restores the session after page refresh using the refresh token cookie
   */
  async function initializeAuth(): Promise<void> {
    // Only initialize once
    if (isInitialized.value) {
      return;
    }

    isInitialized.value = true;

    // If we already have a token, we're good
    if (accessToken.value) {
      return;
    }

    // Try to refresh the token silently (refresh token is in HttpOnly cookie)
    // Use the same refreshToken function but in silent mode to prevent redirects
    try {
      // Use the existing refreshToken function which handles concurrency
      // Pass silent=true to prevent redirect/clear on error during initialization
      await refreshToken(true);
      console.log('Session restored from refresh token');
    } catch (error: any) {
      // Refresh failed - user needs to login again
      // This is expected if refresh token expired or doesn't exist
      // Silently handle 401 errors during initialization (don't redirect)
      if (error?.response?.status === 401 || error?.status === 401) {
        // Expected - no valid refresh token, user needs to login
        // Don't log as error, this is normal for first-time visitors
        // Don't clear auth or redirect - let the router guard handle it
      } else {
        console.warn('Failed to initialize auth:', error);
      }
      // Don't throw - let the router handle redirecting to login
    }
  }

  async function logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
    } finally {
      clearAuth();
      router.push('/login');
    }
  }

  function hasRole(role: string): boolean {
    return user.value?.roles.includes(role) || false;
  }

  function hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => hasRole(role));
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    isRefreshing,
    isInitialized,
    setAccessToken,
    setUser,
    clearAuth,
    login,
    refreshToken,
    logout,
    initializeAuth,
    hasRole,
    hasAnyRole,
  };
});

