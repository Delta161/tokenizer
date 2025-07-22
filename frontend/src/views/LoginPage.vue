<template>
  <div class="login-page">
    <div class="login-container">
      <h1>Sign In</h1>
      <p>Click the button below to sign in with Google</p>
      
      <div class="oauth-buttons">
        <button 
          class="oauth-button oauth-button--google" 
          @click="handleGoogleLogin"
        >
          <span class="icon icon-google"></span>
          <span>Login with Google</span>
        </button>
        
        <button 
          class="oauth-button oauth-button--azure" 
          @click="handleAzureLogin"
        >
          <span class="icon icon-azure"></span>
          <span>Login with Azure</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Handle Google OAuth login
function handleGoogleLogin() {
  window.location.href = `${apiBaseUrl}/api/accounts/auth/google`;
}

// Handle Azure OAuth login
function handleAzureLogin() {
  window.location.href = `${apiBaseUrl}/api/accounts/auth/azure`;
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f5f5f5;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.oauth-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
  color: #333;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.oauth-button:hover {
  background-color: #f5f5f5;
}

.oauth-button--google {
  border-color: #4285F4;
  color: #4285F4;
}

.oauth-button--google:hover {
  background-color: rgba(66, 133, 244, 0.1);
}

.oauth-button--azure {
  border-color: #0078d4;
  color: #0078d4;
}

.oauth-button--azure:hover {
  background-color: rgba(0, 120, 212, 0.1);
}

/* Icons */
.icon {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.icon-google {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="%234285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="%2334A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="%23FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="%23EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>');
}

.icon-azure {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="%230078d4" d="M12 2L5.5 4.5 2 9.5 4.5 19.5 12 22 19.5 19.5 22 9.5 18.5 4.5 12 2z"/><path fill="white" d="M12 5L8 14.5 10 14.5 10 19 16 9.5 14 9.5 14 5z"/></svg>');
}
</style>