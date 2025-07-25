<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/authStore';
import { LoginForm, OAuthButtons } from '../components';
import type { LoginCredentials } from '../types/authTypes';

// Component state
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

// Get router and auth store
const router = useRouter();
const authStore = useAuthStore();

// Handle login form submission
async function handleLogin(credentials: LoginCredentials) {
  isLoading.value = true;
  errorMessage.value = null;
  
  try {
    await authStore.login(credentials);
    router.push({ name: 'dashboard' });
  } catch (error: any) {
    errorMessage.value = error.message || 'Login failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
}

// Handle OAuth login
async function handleOAuthLogin(provider: string) {
  // Redirect to OAuth provider
  window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/accounts/auth/${provider}`;
}

// Check if user is already authenticated
onMounted(async () => {
  try {
    await authStore.checkTokenValidity();
    if (authStore.isAuthenticated) {
      router.push({ name: 'dashboard' });
    }
  } catch (error) {
    // Ignore errors, user is not authenticated
  }
});
</script>

<template>
  <div class="login-view">
    <div class="login-container">
      <h1>Sign In</h1>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <LoginForm 
        @submit="handleLogin" 
        :is-loading="isLoading" 
      />
      
      <div class="divider">
        <span>OR</span>
      </div>
      
      <OAuthButtons @login="handleOAuthLogin" />
      
      <div class="links">
        <router-link :to="{ name: 'register' }">
          Don't have an account? Sign up
        </router-link>
        <router-link :to="{ name: 'forgot-password' }">
          Forgot password?
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--color-background);
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 8px;
  background-color: var(--color-background-soft);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  margin-bottom: 2rem;
  font-size: 1.75rem;
  font-weight: 600;
  text-align: center;
  color: var(--color-heading);
}

.error-message {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  background-color: rgba(220, 38, 38, 0.1);
  color: #dc2626;
  font-size: 0.875rem;
}

.divider {
  position: relative;
  margin: 1.5rem 0;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--color-border);
}

.divider span {
  position: relative;
  padding: 0 0.75rem;
  background-color: var(--color-background-soft);
  color: var(--color-text-light);
  font-size: 0.875rem;
}

.links {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
  font-size: 0.875rem;
}

.links a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s;
}

.links a:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}
</style>