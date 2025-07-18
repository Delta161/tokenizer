<script setup lang="ts">
// No specific logic needed for this layout
</script>

<template>
  <div class="layout-auth">
    <div class="auth-container">
      <div class="auth-logo">
        <router-link to="/">
          <span class="logo-text">Tokenizer</span>
        </router-link>
      </div>
      
      <div class="auth-card">
        <slot></slot>
      </div>
      
      <div class="auth-footer">
        <p class="copyright">&copy; {{ new Date().getFullYear() }} Tokenizer. All rights reserved.</p>
        <div class="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout-auth {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem 1rem;
  background-color: var(--color-background-soft);
}

.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 480px;
}

.auth-logo {
  margin-bottom: 2rem;
  text-align: center;
}

.auth-logo a {
  text-decoration: none;
  color: var(--color-heading);
}

.logo-text {
  font-size: 2rem;
  font-weight: 700;
}

.auth-card {
  width: 100%;
  background-color: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.auth-footer {
  text-align: center;
  width: 100%;
}

.copyright {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.footer-links a {
  font-size: 0.875rem;
  color: var(--color-text-light);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: var(--color-primary);
}

@media (max-width: 576px) {
  .auth-card {
    padding: 1.5rem;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>