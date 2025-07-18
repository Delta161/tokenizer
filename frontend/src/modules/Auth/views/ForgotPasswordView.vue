<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ForgotPasswordForm } from '../components';
import { AuthService } from '../services';

// Component state
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Get router
const router = useRouter();
const authService = new AuthService();

// Handle forgot password form submission
async function handleForgotPassword(email: string) {
  isLoading.value = true;
  errorMessage.value = null;
  successMessage.value = null;
  
  try {
    await authService.requestPasswordReset({ email });
    successMessage.value = 'Password reset instructions have been sent to your email.';
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to send reset instructions. Please try again.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="forgot-password-view">
    <div class="forgot-password-container">
      <h1>Reset Password</h1>
      
      <p class="description">
        Enter your email address and we'll send you instructions to reset your password.
      </p>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <ForgotPasswordForm 
        @submit="handleForgotPassword" 
        :is-loading="isLoading" 
      />
      
      <div class="links">
        <router-link :to="{ name: 'login' }">
          Back to Sign In
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forgot-password-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--color-background);
}

.forgot-password-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 8px;
  background-color: var(--color-background-soft);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  margin-bottom: 1rem;
  font-size: 1.75rem;
  font-weight: 600;
  text-align: center;
  color: var(--color-heading);
}

.description {
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--color-text-light);
  font-size: 0.875rem;
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