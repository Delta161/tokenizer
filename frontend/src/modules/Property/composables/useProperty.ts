import { computed } from 'vue';
import { usePropertyStore } from '../store';
import type { Property, PropertyCreate, PropertyUpdate, PropertyStatusUpdate } from '../types';

/**
 * Composable for property functionality
 * Provides reactive access to property state and methods
 */
export function useProperty() {
  const propertyStore = usePropertyStore();

  // Computed properties
  const properties = computed(() => propertyStore.properties);
  const currentProperty = computed(() => propertyStore.currentProperty);
  const myProperties = computed(() => propertyStore.myProperties);
  const isLoading = computed(() => propertyStore.isLoading);
  const error = computed(() => propertyStore.error);
  const pagination = computed(() => propertyStore.pagination);
  const myPagination = computed(() => propertyStore.myPagination);
  const featuredProperties = computed(() => propertyStore.featuredProperties);

  // Methods
  const fetchAllApproved = propertyStore.fetchAllApproved;
  const fetchPropertyById = propertyStore.fetchPropertyById;
  const fetchMyProperties = propertyStore.fetchMyProperties;
  const createProperty = propertyStore.createProperty;
  const updateProperty = propertyStore.updateProperty;
  const deleteProperty = propertyStore.deleteProperty;
  const updatePropertyStatus = propertyStore.updatePropertyStatus;
  const toggleFavorite = propertyStore.toggleFavorite;
  const clearCurrentProperty = propertyStore.clearCurrentProperty;

  /**
   * Get a property by ID from the store
   * @param id - Property ID
   * @returns Property or null if not found
   */
  const getPropertyById = (id: string): Property | null => {
    return propertyStore.propertyById(id);
  };

  return {
    // State
    properties,
    currentProperty,
    myProperties,
    isLoading,
    error,
    pagination,
    myPagination,
    featuredProperties,
    
    // Methods
    fetchAllApproved,
    fetchPropertyById,
    fetchMyProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    updatePropertyStatus,
    toggleFavorite,
    clearCurrentProperty,
    getPropertyById
  };
}