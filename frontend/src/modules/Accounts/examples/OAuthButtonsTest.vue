<template>
  <div class="oauth-buttons-test">
    <h2>🔐 OAuth Buttons Verification</h2>
    
    <div class="test-section">
      <h3>Current Route Status</h3>
      <div class="status-grid">
        <div class="status-item">
          <strong>Route:</strong> {{ $route.path }}
        </div>
        <div class="status-item">
          <strong>Route Name:</strong> {{ $route.name }}
        </div>
        <div class="status-item">
          <strong>Is Login Mode:</strong> {{ isLoginRoute }}
        </div>
      </div>
    </div>

    <div class="test-section">
      <h3>Quick Navigation</h3>
      <div class="nav-buttons">
        <button @click="goToLogin" class="nav-btn login-btn">
          📍 Test /login Route
        </button>
        <button @click="goToRegister" class="nav-btn register-btn">
          📍 Test /register Route
        </button>
      </div>
    </div>

    <div class="test-section">
      <h3>Expected OAuth Buttons on {{ $route.name || 'current' }} route:</h3>
      
      <div class="expected-buttons">
        <div class="button-preview google">
          <div class="button-icon">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <span>Continue with Google</span>
        </div>

        <div class="button-preview apple">
          <div class="button-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </div>
          <span>Continue with Apple</span>
        </div>

        <div class="button-preview microsoft">
          <div class="button-icon">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#F25022" d="M1 1h10v10H1z"/>
              <path fill="#00A4EF" d="M13 1h10v10H13z"/>
              <path fill="#7FBA00" d="M1 13h10v10H1z"/>
              <path fill="#FFB900" d="M13 13h10v10H13z"/>
            </svg>
          </div>
          <span>Continue with Microsoft</span>
        </div>
      </div>

      <div class="mode-info">
        <p v-if="isLoginRoute" class="login-mode">
          ✅ <strong>Login Mode</strong>: Title should show "Sign In with OAuth" and notice should say "sign in"
        </p>
        <p v-else class="register-mode">
          ✅ <strong>Register Mode</strong>: Title should show "Create Account with OAuth" and notice should say "create an account"
        </p>
      </div>
    </div>

    <div class="test-section">
      <h3>Live Component Preview</h3>
      <div class="component-container">
        <AuthComponent />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthComponent from '../components/auth.component.vue';

const route = useRoute();
const router = useRouter();

const isLoginRoute = computed(() => 
  route.name === 'login' || route.name === 'auth'
);

const goToLogin = () => {
  router.push({ name: 'login' });
};

const goToRegister = () => {
  router.push({ name: 'register' });
};
</script>

<style scoped>
.oauth-buttons-test {
  max-width: 800px;
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

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.status-item {
  padding: 0.75rem;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

.nav-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.nav-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-btn {
  background-color: #3b82f6;
  color: white;
}

.login-btn:hover {
  background-color: #2563eb;
}

.register-btn {
  background-color: #10b981;
  color: white;
}

.register-btn:hover {
  background-color: #059669;
}

.expected-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.button-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.button-preview.google {
  border-color: #dadce0;
}

.button-preview.apple {
  background-color: #000000;
  color: #ffffff;
  border-color: #d2d2d7;
}

.button-preview.microsoft {
  border-color: #8c8c8c;
}

.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.mode-info {
  padding: 1rem;
  background-color: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 6px;
}

.login-mode {
  color: #1e40af;
  margin: 0;
}

.register-mode {
  color: #059669;
  margin: 0;
}

.component-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}
</style>
