// Auth Module Entry Point

// Export components
export * from './components';

// Export composables
export * from './composables';

// Export services
export * from './services';

// Export store
export { useAuthStore } from './store/authStore';

// Export types
export * from './types';

// Export views for router
export * from './views';

// Module initialization function
export function initAuthModule() {
  // Initialize any module-specific requirements here
  console.log('Auth module initialized');
  
  // Initialize the auth store
  // Note: The store will automatically initialize itself when imported
  // but we're explicitly importing it here to ensure it's loaded
  import('./store/authStore').then(({ useAuthStore }) => {
    const authStore = useAuthStore();
    
    // Make sure auth is initialized from localStorage
    authStore.initializeAuth();
  });
}