<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const uiStore = useUIStore();

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errors = ref<{ email?: string; password?: string; general?: string }>({});

const validate = (): boolean => {
  errors.value = {};
  let isValid = true;

  if (!email.value) {
    errors.value.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Please enter a valid email address';
    isValid = false;
  }

  if (!password.value) {
    errors.value.password = 'Password is required';
    isValid = false;
  } else if (password.value.length < 8) {
    errors.value.password = 'Password must be at least 8 characters';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validate()) {
    return;
  }

  isLoading.value = true;
  errors.value = {};

  try {
    await authStore.login(email.value, password.value);
    
    // Wait for Vue reactivity to update the store
    await nextTick();
    
    // Debug: Log token status
    console.log('After login - accessToken:', authStore.accessToken ? 'exists' : 'missing');
    console.log('After login - isAuthenticated:', authStore.isAuthenticated);
    
    // If login didn't throw, it succeeded - proceed with navigation
    // The router guard will handle authentication check
    uiStore.showSuccess('Login successful');
    
    // Navigate to the redirect path if available, otherwise go to admin
    const redirectPath = (route.query.redirect as string) || '/admin';
    await router.push(redirectPath);
  } catch (error: any) {
    const errorMessage = error?.message || 'Login failed. Please check your credentials.';
    errors.value.general = errorMessage;
    uiStore.showError(errorMessage);
    console.error('Login error:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1>HorseSheet</h1>
      <p class="subtitle">Sign in to your account</p>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div v-if="errors.general" class="error-message general-error">
          {{ errors.general }}
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            :disabled="isLoading"
            :class="{ error: errors.email }"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            :disabled="isLoading"
            :class="{ error: errors.password }"
          />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <button type="submit" :disabled="isLoading" class="submit-button">
          <span v-if="isLoading">Signing in...</span>
          <span v-else>Sign in</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  text-align: center;
}

.subtitle {
  margin: 0 0 2rem 0;
  color: #718096;
  text-align: center;
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #2d3748;
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input.error {
  border-color: #e53e3e;
}

.form-group input:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
}

.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.general-error {
  background-color: #fed7d7;
  padding: 0.75rem;
  border-radius: 6px;
  text-align: center;
}

.submit-button {
  padding: 0.875rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

