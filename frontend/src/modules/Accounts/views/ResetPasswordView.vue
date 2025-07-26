<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ResetPasswordForm } from '../components';
import { AuthService } from '../services/authService';
import type { PasswordResetConfirm } from '../types/authTypes';

// Component state
const isLoading = ref(false);
const isValidating = ref(true);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const isTokenValid = ref(false);

// Get route, router, and auth service
const route = useRoute();
const router = useRouter();

// Get token from route params
const token = route.params.token as string;

// Validate token on mount
onMounted(async () => {
  isValidating.value = true;
  
  try {
    // This would be a real API call to validate the token
    // For now, we'll just simulate it
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if token exists
    if (!token) {
      errorMessage.value = 'Invalid password reset link.';
      return;
    }
    
    isTokenValid.value = true;
  } catch (error: any) {
    errorMessage.value = 'Invalid or expired password reset link.';
  } finally {
    isValidating.value = false;
  }
});

// Handle reset password form submission
async function handleResetPassword(data: { password: string; confirmPassword: string }) {
  isLoading.value = true;
  errorMessage.value = null;
  successMessage.value = null;
  
  try {
    await AuthService.resetPassword(token, data.password);
    successMessage.value = 'Your password has been reset successfully.';
    
    // Redirect to login after a short delay
    setTimeout(() => {
      router.push({ name: 'login' });
    }, 2000);
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to reset password. Please try again.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="reset-password-view">
    <div class="reset-password-container">
      <h1>Reset Password</h1>
      
      <div v-if="isValidating" class="loading-message">
        Validating your reset link...
      </div>
      
      <template v-else>
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
        
        <template v-if="isTokenValid && !successMessage">
          <p class="description">
            Create a new password for your account.
          </p>
          
          <ResetPasswordForm 
            @submit="handleResetPassword" 
            :is-loading="isLoading" 
          />
        </template>
        
        <div v-else-if="!isTokenValid && !isValidating" class="invalid-token">
          <p>The password reset link is invalid or has expired.</p>
          <router-link :to="{ name: 'forgot-password' }" class="request-link">
            Request a new password reset link
          </router-link>
        </div>
      </template>
      
      <div class="links">
        <router-link :to="{ name: 'login' }">
          Back to Sign In
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reset-password-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--color-background);
}

.reset-password-container {
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

.loading-message {
  margin: 2rem 0;
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

.invalid-token {
  margin: 2rem 0;
  text-align: center;
}

.request-link {
  display: inline-block;
  margin-top: 1rem;
  color: var(--color-primary);
  text-decoration: none;
}

.request-link:hover {
  text-decoration: underline;
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