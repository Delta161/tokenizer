<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../store/authStore';

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
  // Redirect to OAuth provider
  window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/${provider}`;
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