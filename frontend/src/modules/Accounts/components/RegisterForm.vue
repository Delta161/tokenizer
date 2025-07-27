<script setup lang="ts">
// This component has been modified to remove password fields
// as only OAuth authentication is supported now

import { ref } from 'vue';
import type { RegisterData } from '../types/authTypes';

// Define props
defineProps<{
  isLoading?: boolean;
}>();

// Define emits
const emit = defineEmits<{
  submit: [data: RegisterData];
}>();

// Form state
const firstName = ref('');
const lastName = ref('');
const email = ref('');
// password fields removed - only OAuth authentication is supported
const agreeToTerms = ref(false);

// Form validation
const firstNameError = ref('');
const lastNameError = ref('');
const emailError = ref('');
// password validation removed - only OAuth authentication is supported
const termsError = ref('');

// Validate first name
function validateFirstName() {
  firstNameError.value = '';
  
  if (!firstName.value) {
    firstNameError.value = 'First name is required';
    return false;
  }
  
  return true;
}

// Validate last name
function validateLastName() {
  lastNameError.value = '';
  
  if (!lastName.value) {
    lastNameError.value = 'Last name is required';
    return false;
  }
  
  return true;
}

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

// Password validation removed - only OAuth authentication is supported
// Validate terms agreement
function validateTerms() {
  termsError.value = '';
  
  if (!agreeToTerms.value) {
    termsError.value = 'You must agree to the terms and conditions';
    return false;
  }
  
  return true;
}

// Handle form submission
function handleSubmit() {
  const isFirstNameValid = validateFirstName();
  const isLastNameValid = validateLastName();
  const isEmailValid = validateEmail();
  const isTermsValid = validateTerms();
  
  if (isFirstNameValid && isLastNameValid && isEmailValid && isTermsValid) {
    emit('submit', {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value
      // password field removed - only OAuth authentication is supported
    });
  }
}
</script>

<template>
  <div class="register-form">
    <div class="oauth-notice">
      <p>Password-based registration has been removed.</p>
      <p>Please use one of the OAuth providers below to register.</p>
    </div>
    
    <!-- Form fields kept for potential future use but disabled -->
    <div class="form-row">
      <div class="form-group">
        <label for="firstName">First Name</label>
        <input
          id="firstName"
          v-model="firstName"
          type="text"
          placeholder="Enter your first name"
          @blur="validateFirstName"
          :class="{ 'error': firstNameError }"
          autocomplete="given-name"
          disabled
        />
        <p v-if="firstNameError" class="error-text">{{ firstNameError }}</p>
      </div>
      
      <div class="form-group">
        <label for="lastName">Last Name</label>
        <input
          id="lastName"
          v-model="lastName"
          type="text"
          placeholder="Enter your last name"
          @blur="validateLastName"
          :class="{ 'error': lastNameError }"
          autocomplete="family-name"
          disabled
        />
        <p v-if="lastNameError" class="error-text">{{ lastNameError }}</p>
      </div>
    </div>
    
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
    
    <!-- Password fields removed - only OAuth authentication is supported -->
    
    <div class="form-group checkbox">
      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="agreeToTerms"
          @change="validateTerms"
          disabled
        />
        <span>I agree to the <a href="#" @click.prevent>Terms of Service</a> and <a href="#" @click.prevent>Privacy Policy</a></span>
      </label>
      <p v-if="termsError" class="error-text">{{ termsError }}</p>
    </div>
    
    <button
      type="button"
      class="submit-button"
      disabled
    >
      <span>Register with Email Disabled</span>
    </button>
  </div>
</template>

<style scoped>
.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

input[type="text"],
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

input[type="text"]:focus,
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
  align-items: flex-start;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label span {
  font-size: 0.875rem;
}

input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  margin-top: 0.125rem;
  cursor: pointer;
}

.checkbox-label a {
  color: var(--color-primary);
  text-decoration: none;
}

.checkbox-label a:hover {
  text-decoration: underline;
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

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>