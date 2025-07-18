import { defineAsyncComponent } from 'vue';

// Import components
import { propertyRoutes } from './views';
import { usePropertyStore } from './store';
import { PropertyService } from './services';
import { useProperty, usePropertySearch } from './composables';
import type { Property, PropertyCreate, PropertyUpdate, PropertyStatus } from './types';

// Lazy-loaded components
const PropertyCard = defineAsyncComponent(() => import('./components/PropertyCard.vue'));
const PropertyDetails = defineAsyncComponent(() => import('./components/PropertyDetails.vue'));
const PropertyForm = defineAsyncComponent(() => import('./components/PropertyForm.vue'));
const PropertyList = defineAsyncComponent(() => import('./components/PropertyList.vue'));
const PropertyFilters = defineAsyncComponent(() => import('./components/PropertyFilters.vue'));

/**
 * Initialize the Property module
 * This function should be called when the application starts
 */
export function initPropertyModule() {
  // Initialize any module-specific logic here
  console.log('Property module initialized');
}

// Export module components, services, and types
export {
  // Components
  PropertyCard,
  PropertyDetails,
  PropertyForm,
  PropertyList,
  PropertyFilters,
  
  // Routes
  propertyRoutes,
  
  // Store
  usePropertyStore,
  
  // Services
  PropertyService,
  
  // Composables
  useProperty,
  usePropertySearch,
  
  // Types
  Property,
  PropertyCreate,
  PropertyUpdate,
  PropertyStatus
};