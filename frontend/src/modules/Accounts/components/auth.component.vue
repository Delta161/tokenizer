<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../store/auth.store';

// Component props
defineProps<{
  // No props needed as this component now handles business logic
}>();

// Component emits
const emit = defineEmits<{
  // No emits needed as this component now handles business logic internally
}>();

// Component state
const isLogin = ref(true);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Get router, route, and auth store
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Toggle between login and register views
function toggleView() {
  isLogin.value = !isLogin.value;
  // Clear messages when switching views
  errorMessage.value = null;
  successMessage.value = null;
  
  // Update route to match the current view
  const routeName = isLogin.value ? 'login' : 'register';
  if (route.name !== routeName) {
    router.push({ name: routeName });
  }
}

// Handle OAuth login/registration
async function handleOAuthLogin(provider: string) {
  try {
    isLoading.value = true;
    errorMessage.value = null;
    
    // Map provider names to backend endpoints
    const providerMap: Record<string, string> = {
      'google': 'google',
      'apple': 'apple', 
      'microsoft': 'microsoft'
    };
    
    const backendProvider = providerMap[provider];
    if (!backendProvider) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
    
    // Store the current action (login/register) in sessionStorage for the callback
    sessionStorage.setItem('oauth_action', isLogin.value ? 'login' : 'register');
    
    // Redirect to OAuth provider
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    window.location.href = `${baseUrl}/auth/${backendProvider}`;

  } catch (error) {
    isLoading.value = false;
    errorMessage.value = error instanceof Error ? error.message : 'OAuth login failed. Please try again.';
  }
}

// Check if user is already authenticated
onMounted(async () => {
  try {
    // Set initial view based on route
    isLogin.value = route.name === 'login';
    
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
  <div class="auth-container">
    <h1>{{ isLogin ? 'Sign In' : 'Create Account' }} with OAuth</h1>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    
    <div class="oauth-notice">
      <p>Please use one of the following providers to {{ isLogin ? 'sign in' : 'create an account' }}:</p>
    </div>

    <!-- OAuth Provider Buttons -->
    <div class="oauth-buttons">
      <!-- Google OAuth Button -->
      <button 
        @click="handleOAuthLogin('google')" 
        :disabled="isLoading"
        class="oauth-button oauth-button--google"
      >
        <div class="oauth-button-icon" v-if="!isLoading">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
        <div class="oauth-button-icon" v-else>
          <div class="spinner"></div>
        </div>
        <span>{{ isLoading ? 'Connecting...' : 'Continue with Google' }}</span>
      </button>

      <!-- Apple ID OAuth Button -->
      <button 
        @click="handleOAuthLogin('apple')" 
        :disabled="isLoading"
        class="oauth-button oauth-button--apple"
      >
        <div class="oauth-button-icon" v-if="!isLoading">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        </div>
        <div class="oauth-button-icon" v-else>
          <div class="spinner spinner--white"></div>
        </div>
        <span>{{ isLoading ? 'Connecting...' : 'Continue with Apple' }}</span>
      </button>

      <!-- Microsoft 365 OAuth Button -->
      <button 
        @click="handleOAuthLogin('microsoft')" 
        :disabled="isLoading"
        class="oauth-button oauth-button--microsoft"
      >
        <div class="oauth-button-icon" v-if="!isLoading">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#F25022" d="M1 1h10v10H1z"/>
            <path fill="#00A4EF" d="M13 1h10v10H13z"/>
            <path fill="#7FBA00" d="M1 13h10v10H1z"/>
            <path fill="#FFB900" d="M13 13h10v10H13z"/>
          </svg>
        </div>
        <div class="oauth-button-icon" v-else>
          <div class="spinner"></div>
        </div>
        <span>{{ isLoading ? 'Connecting...' : 'Continue with Microsoft' }}</span>
      </button>
    </div>
    
    <div class="links">
      <a href="#" @click.prevent="toggleView">
        {{ isLogin ? 'Don\'t have an account? Sign up with OAuth' : 'Already have an account? Sign in with OAuth' }}
      </a>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
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

.success-message {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
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

/* OAuth Buttons */
.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.oauth-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: #ffffff;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.oauth-button:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.oauth-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.oauth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.oauth-button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

/* Loading Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #6b7280;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner--white {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #ffffff;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Google Button */
.oauth-button--google {
  border-color: #dadce0;
}

.oauth-button--google:hover {
  border-color: #4285f4;
  background-color: #fafbff;
}

/* Apple Button */
.oauth-button--apple {
  border-color: #d2d2d7;
  background-color: #000000;
  color: #ffffff;
}

.oauth-button--apple:hover {
  background-color: #1d1d1f;
  border-color: #424245;
}

/* Microsoft Button */
.oauth-button--microsoft {
  border-color: #8c8c8c;
}

.oauth-button--microsoft:hover {
  border-color: #0078d4;
  background-color: #f3f9ff;
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