<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import { useFormErrors } from '@/composables/useFormErrors';
import FormErrorMessage from '@/components/FormErrorMessage.vue';
import { ErrorType } from '@/services/errorHandler';
import errorHandler from '@/services/errorHandler';
import { useErrorStore } from '@/stores/errorStore';

// Initialize composables
const { get, post } = useApi();
const { 
  errors, 
  touched, 
  formError, 
  setFieldError, 
  touchField, 
  handleApiValidationErrors,
  clearAllErrors 
} = useFormErrors();
const errorStore = useErrorStore();

// Form state
const username = ref('');
const email = ref('');
const password = ref('');
const isSubmitting = ref(false);
const submitSuccess = ref(false);

// Example data
const exampleData = ref(null);
const loadingError = ref('');

// Form validation functions
import { validateUsername, validateEmail, validatePassword } from './formValidations';

// Form submission
async function handleSubmit() {
  // Validate all fields
  validateUsername(username.value, setFieldError, touchField);
  validateEmail(email.value, setFieldError, touchField);
  validatePassword(password.value, setFieldError, touchField);
  
  // Check if there are any errors
  if (errors.value.username || errors.value.email || errors.value.password) {
    return;
  }
  
  isSubmitting.value = true;
  submitSuccess.value = false;
  
  try {
    // Example API call with potential validation errors
    await post('/users', {
      username: username.value,
      email: email.value,
      password: password.value
    });
    
    // Success
    submitSuccess.value = true;
    clearAllErrors();
    username.value = '';
    email.value = '';
    password.value = '';
  } catch (error) {
    // Handle validation errors from API
    handleApiValidationErrors(error);
  } finally {
    isSubmitting.value = false;
  }
}

// Import error simulation functions
import { 
  loadExampleData, 
  simulateNetworkError, 
  simulateServerError, 
  simulateValidationError, 
  simulateAuthError 
} from './errorSimulations';

// Load data on component mount
onMounted(() => {
  loadExampleData(get, exampleData, loadingError, errorStore, errorHandler, ErrorType);
});
</script>

<template>
  <div class="error-handling-example p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Error Handling Example</h1>
    
    <!-- Form with validation errors -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-xl font-semibold mb-4">Form with Validation</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Form-level error -->
        <div v-if="formError" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p class="text-red-700">{{ formError }}</p>
        </div>
        
        <!-- Success message -->
        <div v-if="submitSuccess" class="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p class="text-green-700">Form submitted successfully!</p>
        </div>
        
        <!-- Username field -->
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input
            id="username"
            v-model="username"
            @blur="() => validateUsername(username, setFieldError, touchField)"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            :class="{ 'border-red-500': touched.username && errors.username }"
          />
          <FormErrorMessage :error="errors.username" :touched="touched.username" />
        </div>
        
        <!-- Email field -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            v-model="email"
            @blur="() => validateEmail(email, setFieldError, touchField)"
            type="email"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            :class="{ 'border-red-500': touched.email && errors.email }"
          />
          <FormErrorMessage :error="errors.email" :touched="touched.email" />
        </div>
        
        <!-- Password field -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            v-model="password"
            @blur="() => validatePassword(password, setFieldError, touchField)"
            type="password"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            :class="{ 'border-red-500': touched.password && errors.password }"
          />
          <FormErrorMessage :error="errors.password" :touched="touched.password" />
        </div>
        
        <!-- Submit button -->
        <div>
          <button
            type="submit"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit' }}
          </button>
        </div>
      </form>
    </div>
    
    <!-- Error simulation section -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-xl font-semibold mb-4">Error Simulation</h2>
      <p class="mb-4">Click the buttons below to simulate different types of errors:</p>
      
      <div class="flex flex-wrap gap-3">
        <button
          @click="() => simulateNetworkError(get, errorHandler)"
          class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Network Error
        </button>
        
        <button
          @click="() => simulateServerError(get, errorHandler)"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Server Error
        </button>
        
        <button
          @click="() => simulateValidationError(post, handleApiValidationErrors)"
          class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Validation Error
        </button>
        
        <button
          @click="() => simulateAuthError(get, errorHandler)"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Authentication Error
        </button>
      </div>
    </div>
    
    <!-- Data loading section -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Data Loading</h2>
      
      <div v-if="loadingError" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p class="text-red-700">{{ loadingError }}</p>
        <button
          @click="() => loadExampleData(get, exampleData, loadingError, errorStore, errorHandler, ErrorType)"
          class="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
      
      <div v-else-if="exampleData" class="bg-gray-50 p-4 rounded">
        <pre class="text-sm">{{ JSON.stringify(exampleData, null, 2) }}</pre>
      </div>
      
      <div v-else class="flex justify-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    </div>
  </div>
</template>