<template>
  <div class="callback-page">
    <div class="callback-container">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Processing authentication...</p>
      </div>
      
      <div v-if="error" class="error">
        <h2>Authentication Error</h2>
        <p>{{ error }}</p>
        <button @click="goToLogin" class="button">Back to Login</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';

const router = useRouter();
const loading = ref(true);
const error = ref(null);

// Function to go back to login page
function goToLogin() {
  router.push('/login');
}

// Process the OAuth callback
onMounted(async () => {
  try {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const errorParam = urlParams.get('error');
    
    // Check for error parameter
    if (errorParam) {
      error.value = decodeURIComponent(errorParam);
      loading.value = false;
      return;
    }
    
    // Check for success parameter
    if (success === 'true') {
      // The backend should have set cookies with the JWT tokens
      // We can verify by calling the profile endpoint
      const response = await api.get('/api/accounts/auth/profile');
      
      // Store user data if needed
      if (response.data && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      // Redirect to profile page
      router.push('/profile');
    } else {
      // No success parameter, something went wrong
      error.value = 'Authentication failed. Please try again.';
      loading.value = false;
    }
  } catch (err) {
    console.error('Authentication error:', err);
    error.value = err.response?.data?.message || 'Authentication failed. Please try again.';
    loading.value = false;
  }
});
</script>

<style scoped>
.callback-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f5f5f5;
}

.callback-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  color: #e74c3c;
}

.button {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #2980b9;
}
</style>