// Property Module Components
import { defineAsyncComponent } from 'vue';

// Import components
import PropertyCard from './PropertyCard.vue';
import PropertyFilters from './PropertyFilters.vue';

// Lazy-loaded components
const PropertyDetails = defineAsyncComponent(() => import('./PropertyDetails.vue'));
const PropertyForm = defineAsyncComponent(() => import('./PropertyForm.vue'));
const PropertyList = defineAsyncComponent(() => import('./PropertyList.vue'));

// Export components
export {
  PropertyCard,
  PropertyDetails,
  PropertyForm,
  PropertyList,
  PropertyFilters
};