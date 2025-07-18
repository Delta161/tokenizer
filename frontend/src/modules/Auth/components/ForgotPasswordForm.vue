<script setup lang="ts">
import { ref } from 'vue';

// Define props
defineProps<{
  isLoading?: boolean;
}>();

// Define emits
const emit = defineEmits<{
  submit: [email: string];
}>();

// Form state
const email = ref('');

// Form validation
const emailError = ref('');

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
    emit('submit', email.value);
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="forgot-password-form">
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
      />
      <p v-if="emailError" class="error-text">{{ emailError }}</p>
    </div>
    
    <button
      type="submit"
      class="submit-button"
      :disabled="isLoading"
    >
      <span v-if="isLoading">Sending...</span>
      <span v-else>Send Reset Instructions</span>
    </button>
  </form>
</template>

<style scoped>
.forgot-password-form {
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

input[type="email"] {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input[type="email"]:focus {
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