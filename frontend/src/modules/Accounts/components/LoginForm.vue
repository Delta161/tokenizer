<script setup lang="ts">
// This component has been modified to remove password fields
// as only OAuth authentication is supported now

import { ref } from 'vue';
import type { LoginCredentials } from '../types/authTypes';

// Define props
defineProps<{
  isLoading?: boolean;
}>();

// Define emits
const emit = defineEmits<{
  submit: [credentials: LoginCredentials];
}>();

// Form state
const email = ref('');
// password field removed - only OAuth authentication is supported
const rememberMe = ref(false);

// Form validation
const emailError = ref('');
// passwordError removed - only OAuth authentication is supported

// Validate email
function validateEmail() {
  emailError.value = '';
  
  if (!email.value) {
    emailError.value = 'Email is required';
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email address';
    return false;
  }
  
  return true;
}

// Handle form submission
function handleSubmit() {
  const isEmailValid = validateEmail();
  
  if (isEmailValid) {
    emit('submit', {
      email: email.value
      // password field removed - only OAuth authentication is supported
    });
  }
}
</script>

<template>
  <div class="login-form">
    <div class="oauth-notice">
      <p>Password-based authentication has been removed.</p>
      <p>Please use one of the OAuth providers below to sign in.</p>
    </div>
    
    <!-- Email field kept for potential future use but disabled -->
    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        placeholder="Enter your email"
        @blur="validateEmail"
        :class="{ 'error': emailError }"
        autocomplete="email"
        disabled
      />
      <p v-if="emailError" class="error-text">{{ emailError }}</p>
    </div>
    
    <!-- Password field removed - only OAuth authentication is supported -->
    
    <div class="form-group checkbox">
      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="rememberMe"
          disabled
        />
        <span>Remember me</span>
      </label>
    </div>
    
    <button
      type="button"
      class="submit-button"
      disabled
    >
      <span>Sign In with Email Disabled</span>
    </button>
  </div>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

input[type="email"],
input[type="password"] {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input[type="email"]:focus,
input[type="password"]:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
}

input.error {
  border-color: #dc2626;
}

.error-text {
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 0.25rem;
}

.checkbox {
  flex-direction: row;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.submit-button {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: var(--color-primary);
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>