<script setup lang="ts">
import { ref } from 'vue';

// Define props
defineProps<{
  isLoading?: boolean;
}>();

// Define emits
const emit = defineEmits<{
  submit: [data: { password: string; confirmPassword: string }];
}>();

// Form state
const password = ref('');
const confirmPassword = ref('');

// Form validation
const passwordError = ref('');
const confirmPasswordError = ref('');

// Validate password
function validatePassword() {
  passwordError.value = '';
  
  if (!password.value) {
    passwordError.value = 'Password is required';
    return false;
  }
  
  if (password.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters';
    return false;
  }
  
  // Check for at least one uppercase letter, one lowercase letter, and one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
  if (!passwordRegex.test(password.value)) {
    passwordError.value = 'Password must include at least one uppercase letter, one lowercase letter, and one number';
    return false;
  }
  
  return true;
}

// Validate confirm password
function validateConfirmPassword() {
  confirmPasswordError.value = '';
  
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm your password';
    return false;
  }
  
  if (confirmPassword.value !== password.value) {
    confirmPasswordError.value = 'Passwords do not match';
    return false;
  }
  
  return true;
}

// Handle form submission
function handleSubmit() {
  const isPasswordValid = validatePassword();
  const isConfirmPasswordValid = validateConfirmPassword();
  
  if (isPasswordValid && isConfirmPasswordValid) {
    emit('submit', {
      password: password.value,
      confirmPassword: confirmPassword.value
    });
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="reset-password-form">
    <div class="form-group">
      <label for="password">New Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        placeholder="Create a new password"
        @blur="validatePassword"
        :class="{ 'error': passwordError }"
        autocomplete="new-password"
      />
      <p v-if="passwordError" class="error-text">{{ passwordError }}</p>
    </div>
    
    <div class="form-group">
      <label for="confirmPassword">Confirm Password</label>
      <input
        id="confirmPassword"
        v-model="confirmPassword"
        type="password"
        placeholder="Confirm your new password"
        @blur="validateConfirmPassword"
        :class="{ 'error': confirmPasswordError }"
        autocomplete="new-password"
      />
      <p v-if="confirmPasswordError" class="error-text">{{ confirmPasswordError }}</p>
    </div>
    
    <button
      type="submit"
      class="submit-button"
      :disabled="isLoading"
    >
      <span v-if="isLoading">Resetting password...</span>
      <span v-else>Reset Password</span>
    </button>
  </form>
</template>

<style scoped>
.reset-password-form {
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

input[type="password"] {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

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