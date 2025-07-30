<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref } from 'vue'

const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<template>
  <nav class="navbar">
    <!-- Mobile Navigation -->
    <div class="mobile-nav" :class="{ 'open': mobileMenuOpen }">
      <div class="mobile-nav-links">
        <RouterLink to="/" class="nav-link" @click="toggleMobileMenu">Home</RouterLink>
        <RouterLink to="/projects" class="nav-link" @click="toggleMobileMenu">Properties</RouterLink>
        <RouterLink to="/properties-list" class="nav-link" @click="toggleMobileMenu">Properties List</RouterLink>
        <RouterLink to="/dashboard" class="nav-link" @click="toggleMobileMenu">Dashboard</RouterLink>
        <RouterLink to="/sections-demo" class="nav-link" @click="toggleMobileMenu">Sections Demo</RouterLink>
        <RouterLink to="/error-handling-demo" class="nav-link" @click="toggleMobileMenu">Error Handling</RouterLink>
        <RouterLink to="/button-demo" class="nav-link" @click="toggleMobileMenu">Button Demo</RouterLink>
      </div>
      <div class="mobile-nav-actions">
        <button class="btn btn-outline">Connect Wallet</button>
        <button class="btn btn-primary">Sign In</button>
      </div>
    </div>
    
    <div class="nav-container">
      <div class="nav-brand">
        <RouterLink to="/" class="brand-link">
          <span class="brand-text">TokenEstate</span>
        </RouterLink>
      </div>
      
      <!-- Desktop Navigation -->
      <div class="nav-links desktop-nav">
        <RouterLink to="/" class="nav-link">Home</RouterLink>
        <RouterLink to="/projects" class="nav-link">Properties</RouterLink>
        <RouterLink to="/dashboard" class="nav-link">Dashboard</RouterLink>
        <RouterLink to="/sections-demo" class="nav-link">Sections Demo</RouterLink>
        <RouterLink to="/error-handling-demo" class="nav-link">Error Handling</RouterLink>
        <RouterLink to="/button-demo" class="nav-link">Button Demo</RouterLink>
      </div>
      
      <div class="nav-actions desktop-nav">
        <button class="btn btn-outline">Connect Wallet</button>
        <button class="btn btn-primary">Sign In</button>
      </div>
      
      <!-- Mobile Menu Toggle -->
      <button class="mobile-menu-toggle" :class="{ 'active': mobileMenuOpen }" @click="toggleMobileMenu" aria-label="Toggle menu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 1rem;
  z-index: 1000;
  width: 100%;
  padding: 0 max(1rem, 5%);
  margin-bottom: 2rem;
  box-sizing: border-box;
}

.nav-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--box-shadow-md);
  border: 1px solid var(--color-border);
  flex-wrap: wrap;
  position: relative;
}

.nav-brand {
  flex-shrink: 0;
}

.brand-link {
  text-decoration: none;
}

.brand-text {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 700;
  background: linear-gradient(45deg, var(--color-primary), var(--color-accent-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: clamp(1rem, 2vw, 2rem);
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: var(--color-text-light);
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
  font-size: clamp(0.875rem, 1vw, 1rem);
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--color-accent-3);
}

.nav-link.router-link-active {
  color: var(--color-primary);
  font-weight: 600;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(45deg, var(--color-primary), var(--color-accent-3));
  border-radius: 1px;
}

.nav-actions {
  display: flex;
  gap: clamp(0.5rem, 1vw, 1rem);
  align-items: center;
}

.btn {
  padding: clamp(0.4rem, 1vw, 0.5rem) clamp(0.8rem, 2vw, 1rem);
  border-radius: var(--border-radius-md);
  font-size: clamp(0.8rem, 1vw, 0.875rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  border: none;
  white-space: nowrap;
}

.btn-outline {
  background: transparent;
  color: var(--color-accent-3);
  border: 1px solid var(--color-accent-3);
}

.btn-outline:hover {
  background: var(--color-accent-3);
  color: white;
  transform: translateY(-1px);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--box-shadow-md);
  background: var(--color-primary-light);
}

/* Mobile Menu Toggle Button */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;
}

.bar {
  height: 3px;
  width: 100%;
  background-color: var(--color-primary);
  border-radius: 10px;
  transition: all 0.3s ease-in-out;
}

/* Hamburger menu animation */
.mobile-menu-toggle.active .bar:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}

.mobile-menu-toggle.active .bar:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.active .bar:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}

/* Mobile Navigation */
.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 999;
  transform: translateY(-100%);
  transition: transform 0.3s ease-in-out;
  padding: 2rem;
}

.mobile-nav.open {
  transform: translateY(0);
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 2rem;
}

.mobile-nav-links .nav-link {
  font-size: 1.25rem;
}

.mobile-nav-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
}

.mobile-nav-actions .btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  text-align: center;
}

/* Responsive Breakpoints */
@media (max-width: 1024px) {
  .nav-links {
    gap: 1.5rem;
  }
}

@media (max-width: 900px) {
  .nav-links {
    gap: 1rem;
  }
  
  .nav-actions .btn {
    padding: 0.4rem 0.8rem;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 1rem;
  }
  
  .nav-container {
    padding: 0.75rem 1rem;
  }
  
  .desktop-nav {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: flex;
  }
  
  .brand-text {
    font-size: 1.25rem;
  }
}

/* For very small screens */
@media (max-width: 350px) {
  .mobile-nav-links .nav-link {
    font-size: 1.1rem;
  }
  
  .mobile-nav-actions .btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
}
</style>