/**
 * Projects Consolidated Module Index
 * 
 * This module consolidates functionality from the Projects and Property modules
 * to provide a unified interface for project and property management.
 */

import { defineAsyncComponent } from 'vue';

// Import from Projects module
import * as ProjectsComponents from '../Projects/components';
import * as ProjectsTypes from '../Projects/types';
import * as ProjectsViews from '../Projects/views';
import * as ProjectsServices from '../Projects/services';
import * as ProjectsStore from '../Projects/store';
import * as ProjectsComposables from '../Projects/composables';

// Import from Property module
// Note: Property routes are handled directly in the router
import { usePropertyStore } from '../Property/store';
import { PropertyService } from '../Property/services';
import { useProperty, usePropertySearch } from '../Property/composables';
import type { Property, PropertyCreate, PropertyUpdate, PropertyStatus } from '../Property/types';

// Lazy-loaded components from Property module
const PropertyCard = defineAsyncComponent(() => import('../Property/components/PropertyCard.vue'));
const PropertyFilters = defineAsyncComponent(() => import('../Property/components/PropertyFilters.vue'));

/**
 * Initialize the consolidated Projects module
 * This function consolidates the initialization of Projects and Property modules
 */
export function initProjectsConsolidatedModule() {
  console.log('Projects Consolidated module initialized');
  
  // Initialize Property module
  console.log('Property module initialized through Projects Consolidated module');
}

// Export consolidated components, services, and types
// Explicitly export ProjectsView and ProjectDetailView for router
import { ProjectsView, ProjectDetailView } from '../Projects/views';

export {
  // Projects exports
  ProjectsComponents,
  ProjectsTypes,
  ProjectsViews,
  ProjectsServices,
  ProjectsStore,
  ProjectsComposables,
  
  // Explicit view exports for router
  ProjectsView,
  ProjectDetailView,
  
  // Property Components
  PropertyCard,
  PropertyFilters,
  
  // Note: Property Routes are handled directly in the router
  
  // Property Store
  usePropertyStore,
  
  // Property Services
  PropertyService,
  
  // Property Composables
  useProperty,
  usePropertySearch,
  
  // Property Types
  Property,
  PropertyCreate,
  PropertyUpdate,
  PropertyStatus
};