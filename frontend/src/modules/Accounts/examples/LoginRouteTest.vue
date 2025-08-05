<template>
  <div class="login-route-test">
    <h2>🔐 Login Route Test</h2>
    
    <div class="test-section">
      <h3>Current Route Information</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>Current Route:</strong> {{ $route.path }}
        </div>
        <div class="info-item">
          <strong>Route Name:</strong> {{ $route.name }}
        </div>
        <div class="info-item">
          <strong>Is Login Route:</strong> {{ isLoginRoute }}
        </div>
        <div class="info-item">
          <strong>Is Register Route:</strong> {{ isRegisterRoute }}
        </div>
      </div>
    </div>

    <div class="test-section">
      <h3>Authentication State</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>Is Authenticated:</strong> 
          <span :class="authStore.isAuthenticated ? 'status-success' : 'status-warning'">
            {{ authStore.isAuthenticated }}
          </span>
        </div>
        <div class="info-item">
          <strong>Current User:</strong> 
          {{ authStore.user ? `${authStore.user.firstName} ${authStore.user.lastName}` : 'None' }}
        </div>
      </div>
    </div>

    <div class="test-section">
      <h3>Navigation Tests</h3>
      <div class="button-group">
        <button @click="navigateToLogin" class="test-button login">
          Go to Login (/login)
        </button>
        <button @click="navigateToRegister" class="test-button register">
          Go to Register (/register)
        </button>
        <button @click="navigateToAuth" class="test-button auth">
          Go to Auth (/auth)
        </button>
        <button @click="navigateToProfile" class="test-button profile">
          Go to Profile (/account/profile)
        </button>
      </div>
    </div>

    <div class="test-section">
      <h3>Auth Component Preview</h3>
      <div class="component-preview">
        <div class="preview-note">
          <p>Below is the actual auth.component.vue rendered inline:</p>
        </div>
        <div class="auth-component-container">
          <AuthComponent />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import AuthComponent from '../components/auth.component.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Computed properties for route detection
const isLoginRoute = computed(() => route.name === 'login');
const isRegisterRoute = computed(() => route.name === 'register');

// Navigation methods
const navigateToLogin = () => {
  router.push({ name: 'login' });
};

const navigateToRegister = () => {
  router.push({ name: 'register' });
};

const navigateToAuth = () => {
  router.push({ name: 'auth' });
};

const navigateToProfile = () => {
  router.push({ name: 'user-profile' });
};
</script>

<style scoped>
.login-route-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h2 {
  color: #1f2937;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2rem;
}

h3 {
  color: #374151;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.test-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.info-item {
  padding: 0.75rem;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

.info-item strong {
  color: #374151;
}

.status-success {
  color: #10b981;
  font-weight: 600;
}

.status-warning {
  color: #f59e0b;
  font-weight: 600;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.test-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.test-button.login {
  background-color: #3b82f6;
  color: white;
}

.test-button.login:hover {
  background-color: #2563eb;
}

.test-button.register {
  background-color: #10b981;
  color: white;
}

.test-button.register:hover {
  background-color: #059669;
}

.test-button.auth {
  background-color: #8b5cf6;
  color: white;
}

.test-button.auth:hover {
  background-color: #7c3aed;
}

.test-button.profile {
  background-color: #f59e0b;
  color: white;
}

.test-button.profile:hover {
  background-color: #d97706;
}

.component-preview {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #d1d5db;
}

.preview-note {
  padding: 1rem;
  background-color: #eff6ff;
  border-bottom: 1px solid #dbeafe;
}

.preview-note p {
  margin: 0;
  color: #1e40af;
  font-size: 0.875rem;
}

.auth-component-container {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
