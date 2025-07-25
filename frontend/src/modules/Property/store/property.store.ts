import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  Property, 
  PropertyCreate, 
  PropertyUpdate, 
  PropertyStatusUpdate,
  PropertySearchParams,
  PropertySearchResult
} from '../types/property.types';
import propertyService from '../services/property.service';

/**
 * Property Store
 * Manages property state and actions
 */
export const usePropertyStore = defineStore('property', () => {
  // State
  const properties = ref<Property[]>([]);
  const myProperties = ref<Property[]>([]);
  const currentProperty = ref<Property | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    limit: 10,
    offset: 0,
    total: 0,
    hasMore: false
  });
  const myPagination = ref({
    limit: 10,
    offset: 0,
    total: 0,
    hasMore: false
  });
  
  // Getters
  const getPropertyById = computed(() => {
    return (id: string) => properties.value.find(property => property.id === id) ||
      myProperties.value.find(property => property.id === id);
  });
  
  const getFeaturedProperties = computed(() => {
    return properties.value.filter(property => property.isFeatured);
  });
  
  // Actions
  async function fetchApprovedProperties(params?: PropertySearchParams) {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await propertyService.getAllApproved(params);
      properties.value = result.properties;
      pagination.value = result.pagination;
    } catch (err: any) {
      console.error('Error in fetchApprovedProperties:', err);
      error.value = err.message || 'Failed to load properties. Please try again.';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  async function fetchMyProperties(params?: PropertySearchParams) {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await propertyService.getMyProperties(params);
      myProperties.value = result.properties;
      myPagination.value = result.pagination;
    } catch (err: any) {
      console.error('Error in fetchMyProperties:', err);
      error.value = err.message || 'Failed to load your properties. Please try again.';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  async function fetchPropertyById(id: string) {
    loading.value = true;
    error.value = null;
    currentProperty.value = null;
    
    try {
      currentProperty.value = await propertyService.getByIdIfApproved(id);
      
      // Update the property in the properties array if it exists
      const index = properties.value.findIndex(p => p.id === id);
      if (index !== -1) {
        properties.value[index] = currentProperty.value;
      }
      
      // Also check in myProperties
      const myIndex = myProperties.value.findIndex(p => p.id === id);
      if (myIndex !== -1) {
        myProperties.value[myIndex] = currentProperty.value;
      }
      
      return currentProperty.value;
    } catch (err: any) {
      console.error(`Error in fetchPropertyById for ${id}:`, err);
      error.value = err.message || 'Failed to load property details. Please try again.';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  async function createProperty(propertyData: PropertyCreate) {
    loading.value = true;
    error.value = null;
    
    try {
      const newProperty = await propertyService.createProperty(propertyData);
      myProperties.value.unshift(newProperty);
      return newProperty;
    } catch (err: any) {
      console.error('Error in createProperty:', err);
      error.value = err.message || 'Failed to create property. Please try again.';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  async function updateProperty(propertyData: PropertyUpdate) {
    loading.value = true;
    error.value = null;
    
    try {
      const updatedProperty = await propertyService.updateProperty(propertyData);
      
      // Update in properties array if exists
      const index = properties.value.findIndex(p => p.id === propertyData.id);
      if (index !== -1) {
        properties.value[index] = updatedProperty;
      }
      
      // Update in myProperties array if exists
      const myIndex = myProperties.value.findIndex(p => p.id === propertyData.id);
      if (myIndex !== -1) {
        myProperties.value[myIndex] = updatedProperty;
      }
      
      // Update currentProperty if it's the same property
      if (currentProperty.value?.id === propertyData.id) {
        currentProperty.value = updatedProperty;
      }
      
      return updatedProperty;
    } catch (err: any) {
      console.error(`Error in updateProperty for ${propertyData.id}:`, err);
      error.value = err.message || 'Failed to update property. Please try again.';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  async function updatePropertyStatus(statusUpdate: PropertyStatusUpdate) {
    loading.value = true;
    error.value = null;
    
    try {
      const updatedProperty = await propertyService.updatePropertyStatus(statusUpdate);
      
      // Update in properties array if exists
      const index = properties.value.findIndex(p => p.id === statusUpdate.id);
      if (index !== -1) {
        properties.value[index] = updatedProperty;
      }
      
      // Update in myProperties array if exists
      const myIndex = myProperties.value.findIndex(p => p.id === statusUpdate.id);
      if (myIndex !== -1) {
        myProperties.value[myIndex] = updatedProperty;
      }
      
      // Update currentProperty if it's the same property
      if (currentProperty.value?.id === statusUpdate.id) {
        currentProperty.value = updatedProperty;
      }
      
      return updatedProperty;
    } catch (err: any) {
      console.error(`Error in updatePropertyStatus for ${statusUpdate.id}:`, err);
      error.value = err.message || 'Failed to update property status. Please try again.';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  async function deleteProperty(id: string) {
    loading.value = true;
    error.value = null;
    
    try {
      await propertyService.deleteProperty(id);
      
      // Remove from properties array if exists
      properties.value = properties.value.filter(p => p.id !== id);
      
      // Remove from myProperties array if exists
      myProperties.value = myProperties.value.filter(p => p.id !== id);
      
      // Clear currentProperty if it's the same property
      if (currentProperty.value?.id === id) {
        currentProperty.value = null;
      }
    } catch (err: any) {
      console.error(`Error in deleteProperty for ${id}:`, err);
      error.value = err.message || 'Failed to delete property. Please try again.';
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  return {
    // State
    properties,
    myProperties,
    currentProperty,
    loading,
    error,
    pagination,
    myPagination,
    
    // Getters
    getPropertyById,
    getFeaturedProperties,
    
    // Actions
    fetchApprovedProperties,
    fetchMyProperties,
    fetchPropertyById,
    createProperty,
    updateProperty,
    updatePropertyStatus,
    deleteProperty
  };
});