// Auth Module Entry Point

// Export components
export * from './components';

// Export composables
export * from './composables';

// Export services
export * from './services';

// Export store
export { useAuthStore } from './store';

// Export types
export * from './types';

// Export views for router
export * from './views';

// Module initialization function
export function initAuthModule() {
  // Initialize any module-specific requirements here
  console.log('Auth module initialized');
}