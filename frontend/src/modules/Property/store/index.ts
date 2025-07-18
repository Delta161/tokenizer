// Property Module Store
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  Property, 
  PropertyCreate, 
  PropertyUpdate, 
  PropertyStatusUpdate,
  PropertySearchParams,
  PropertySearchResult
} from '../types';
import { propertyService } from '../services';

export const usePropertyStore = defineStore('property', () => {
  // State
  const properties = ref<Property[]>([]);
  const currentProperty = ref<Property | null>(null);
  const myProperties = ref<Property[]>([]);
  const isLoading = ref(false);
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
  const featuredProperties = computed(() => {
    return properties.value.filter(property => property.isFeatured);
  });
  
  const propertyById = computed(() => {
    return (id: string) => properties.value.find(property => property.id === id) || null;
  });
  
  // Actions
  async function fetchAllApproved(params?: PropertySearchParams) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await propertyService.getAllApproved(params);
      properties.value = result.properties;
      pagination.value = result.pagination;
      return result;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch properties';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function fetchPropertyById(id: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const property = await propertyService.getByIdIfApproved(id);
      currentProperty.value = property;
      return property;
    } catch (err: any) {
      error.value = err.message || `Failed to fetch property ${id}`;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function fetchMyProperties(params?: PropertySearchParams) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await propertyService.getMyProperties(params);
      myProperties.value = result.properties;
      myPagination.value = result.pagination;
      return result;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch my properties';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function createProperty(data: PropertyCreate) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const property = await propertyService.create(data);
      myProperties.value.unshift(property); // Add to the beginning of the list
      return property;
    } catch (err: any) {
      error.value = err.message || 'Failed to create property';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function updateProperty(id: string, data: PropertyUpdate) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const property = await propertyService.update(id, data);
      
      // Update in myProperties list
      const index = myProperties.value.findIndex(p => p.id === id);
      if (index !== -1) {
        myProperties.value[index] = { ...myProperties.value[index], ...property };
      }
      
      // Update in properties list
      const propIndex = properties.value.findIndex(p => p.id === id);
      if (propIndex !== -1) {
        properties.value[propIndex] = { ...properties.value[propIndex], ...property };
      }
      
      // Update currentProperty if it's the same
      if (currentProperty.value?.id === id) {
        currentProperty.value = { ...currentProperty.value, ...property };
      }
      
      return property;
    } catch (err: any) {
      error.value = err.message || `Failed to update property ${id}`;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function deleteProperty(id: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const success = await propertyService.delete(id);
      
      if (success) {
        // Remove from myProperties list
        myProperties.value = myProperties.value.filter(p => p.id !== id);
        
        // Remove from properties list
        properties.value = properties.value.filter(p => p.id !== id);
        
        // Clear currentProperty if it's the same
        if (currentProperty.value?.id === id) {
          currentProperty.value = null;
        }
      }
      
      return success;
    } catch (err: any) {
      error.value = err.message || `Failed to delete property ${id}`;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function updatePropertyStatus(id: string, data: PropertyStatusUpdate) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const property = await propertyService.updateStatus(id, data);
      
      // Update in myProperties list
      const index = myProperties.value.findIndex(p => p.id === id);
      if (index !== -1) {
        myProperties.value[index] = { ...myProperties.value[index], ...property };
      }
      
      // Update in properties list
      const propIndex = properties.value.findIndex(p => p.id === id);
      if (propIndex !== -1) {
        properties.value[propIndex] = { ...properties.value[propIndex], ...property };
      }
      
      // Update currentProperty if it's the same
      if (currentProperty.value?.id === id) {
        currentProperty.value = { ...currentProperty.value, ...property };
      }
      
      return property;
    } catch (err: any) {
      error.value = err.message || `Failed to update property status ${id}`;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  function toggleFavorite(id: string) {
    // Find property in properties list
    const index = properties.value.findIndex(p => p.id === id);
    if (index !== -1) {
      properties.value[index].isFavorite = !properties.value[index].isFavorite;
    }
    
    // Find property in myProperties list
    const myIndex = myProperties.value.findIndex(p => p.id === id);
    if (myIndex !== -1) {
      myProperties.value[myIndex].isFavorite = !myProperties.value[myIndex].isFavorite;
    }
    
    // Update currentProperty if it's the same
    if (currentProperty.value?.id === id) {
      currentProperty.value.isFavorite = !currentProperty.value.isFavorite;
    }
    
    // TODO: Implement API call to save favorite status
  }
  
  function clearCurrentProperty() {
    currentProperty.value = null;
  }
  
  return {
    // State
    properties,
    currentProperty,
    myProperties,
    isLoading,
    error,
    pagination,
    myPagination,
    
    // Getters
    featuredProperties,
    propertyById,
    
    // Actions
    fetchAllApproved,
    fetchPropertyById,
    fetchMyProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    updatePropertyStatus,
    toggleFavorite,
    clearCurrentProperty
  };
});