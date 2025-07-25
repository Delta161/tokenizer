<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/authStore';
import { RegisterForm, OAuthButtons } from '../components';
import type { RegisterData } from '../types/authTypes';

// Component state
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Get router and auth store
const router = useRouter();
const authStore = useAuthStore();

// Handle registration form submission
async function handleRegister(data: RegisterData) {
  isLoading.value = true;
  errorMessage.value = null;
  successMessage.value = null;
  
  try {
    await authStore.register(data);
    successMessage.value = 'Registration successful! You can now log in.';
    
    // Redirect to login after a short delay
    setTimeout(() => {
      router.push({ name: 'login' });
    }, 2000);
  } catch (error: any) {
    errorMessage.value = error.message || 'Registration failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
}

// Handle OAuth registration
async function handleOAuthLogin(provider: string) {
  // Redirect to OAuth provider
  window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/accounts/auth/${provider}`;
}
</script>

<template>
  <div class="register-view">
    <div class="register-container">
      <h1>Create Account</h1>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <RegisterForm 
        @submit="handleRegister" 
        :is-loading="isLoading" 
      />
      
      <div class="divider">
        <span>OR</span>
      </div>
      
      <OAuthButtons @login="handleOAuthLogin" />
      
      <div class="links">
        <router-link :to="{ name: 'login' }">
          Already have an account? Sign in
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--color-background);
}

.register-container {
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