<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../modules/Auth/store/authStore';
import { useUser } from '../modules/User/composables';

// Get router and auth store
const router = useRouter();
const authStore = useAuthStore();
const { currentUser } = useUser();

// Mobile menu state
const isMobileMenuOpen = ref(false);

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userInitials = computed(() => {
  if (!currentUser.value) return '';
  return `${currentUser.value.firstName.charAt(0)}${currentUser.value.lastName.charAt(0)}`.toUpperCase();
});

// Toggle mobile menu
function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

// Close mobile menu
function closeMobileMenu() {
  isMobileMenuOpen.value = false;
}

// Handle logout
async function handleLogout() {
  try {
    await authStore.logout();
    router.push({ name: 'login' });
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
</script>

<template>
  <div class="layout-default">
    <!-- Header -->
    <header class="header">
      <div class="header-container">
        <!-- Logo -->
        <div class="logo">
          <router-link to="/" @click="closeMobileMenu">
            <span class="logo-text">Tokenizer</span>
          </router-link>
        </div>
        
        <!-- Navigation -->
        <nav class="nav" :class="{ 'nav-open': isMobileMenuOpen }">
          <ul class="nav-list">
            <li class="nav-item">
              <router-link to="/" @click="closeMobileMenu">Home</router-link>
            </li>
            
            <template v-if="isAuthenticated">
              <li class="nav-item">
                <router-link to="/dashboard" @click="closeMobileMenu">Dashboard</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/profile" @click="closeMobileMenu">Profile</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/settings" @click="closeMobileMenu">Settings</router-link>
              </li>
              <li class="nav-item">
                <button @click="handleLogout" class="logout-button">Logout</button>
              </li>
            </template>
            
            <template v-else>
              <li class="nav-item">
                <router-link to="/login" @click="closeMobileMenu">Sign In</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/register" @click="closeMobileMenu" class="register-button">Sign Up</router-link>
              </li>
            </template>
          </ul>
        </nav>
        
        <!-- User menu (desktop) -->
        <div v-if="isAuthenticated" class="user-menu">
          <router-link to="/profile" class="user-avatar">
            <span v-if="currentUser?.profile?.avatarUrl">
              <img :src="currentUser.profile.avatarUrl" alt="User avatar" />
            </span>
            <span v-else class="user-initials">{{ userInitials }}</span>
          </router-link>
        </div>
        
        <!-- Mobile menu toggle -->
        <button class="mobile-menu-toggle" @click="toggleMobileMenu" aria-label="Toggle menu">
          <span class="hamburger" :class="{ 'is-active': isMobileMenuOpen }"></span>
        </button>
      </div>
    </header>
    
    <!-- Main content -->
    <main class="main">
      <slot></slot>
    </main>
    
    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-content">
          <p class="copyright">&copy; {{ new Date().getFullYear() }} Tokenizer. All rights reserved.</p>
          <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.layout-default {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Logo */
.logo a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--color-heading);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
}

/* Navigation */
.nav {
  display: flex;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1.5rem;
}

.nav-item a,
.nav-item button {
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-item a:hover,
.nav-item button:hover {
  color: var(--color-primary);
}

.nav-item a.router-link-active {
  color: var(--color-primary);
  font-weight: 600;
}

.logout-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.register-button {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: var(--color-primary);
  color: white !important;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.register-button:hover {
  background-color: var(--color-primary-dark);
}

/* User menu */
.user-menu {
  margin-left: 1rem;
}

.user-avatar {
  display: block;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--color-border);
  transition: border-color 0.2s;
}

.user-avatar:hover {
  border-color: var(--color-primary);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: var(--color-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Mobile menu toggle */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
}

.hamburger {
  display: block;
  position: relative;
  width: 24px;
  height: 18px;
}

.hamburger::before,
.hamburger::after,
.hamburger::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: var(--color-text);
  transition: transform 0.3s, top 0.3s;
}

.hamburger::before {
  top: 0;
}

.hamburger::after {
  bottom: 0;
}

.hamburger::after {
  top: 8px;
}

.hamburger.is-active::before {
  transform: rotate(45deg);
  top: 8px;
}

.hamburger.is-active::after {
  transform: rotate(-45deg);
  top: 8px;
}

.hamburger.is-active::after {
  opacity: 0;
}

/* Main content */
.main {
  flex: 1;
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Footer */
.footer {
  background-color: var(--color-background-soft);
  border-top: 1px solid var(--color-border);
  padding: 2rem 1rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.copyright {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.footer-links {
  display: flex;
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

/* Responsive styles */
@media (max-width: 768px) {
  .nav {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background-color: var(--color-background);
    border-bottom: 1px solid var(--color-border);
    padding: 1rem;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: transform 0.3s, opacity 0.3s, visibility 0.3s;
  }
  
  .nav-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
  
  .nav-list {
    flex-direction: column;
    gap: 1rem;
  }
  
  .mobile-menu-toggle {
    display: block;
  }
  
  .user-menu {
    display: none;
  }
}
</style>