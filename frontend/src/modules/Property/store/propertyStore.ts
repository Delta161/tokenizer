import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Property, 
  PropertyCreate, 
  PropertyUpdate, 
  PropertyStatusUpdate,
  PropertySearchParams,
  PropertySearchResult
} from '../types'
import { propertyService } from '../services'

export const usePropertyStore = defineStore('property', () => {
  // State
  const properties = ref<Property[]>([])
  const myProperties = ref<Property[]>([])
  const currentProperty = ref<Property | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    limit: 10,
    offset: 0,
    total: 0,
    hasMore: false
  })
  const myPagination = ref({
    limit: 10,
    offset: 0,
    total: 0,
    hasMore: false
  })
  
  // Getters
  const getPropertyById = computed(() => {
    return (id: string) => properties.value.find(property => property.id === id) ||
      myProperties.value.find(property => property.id === id)
  })
  
  const getFeaturedProperties = computed(() => {
    return properties.value.filter(property => property.isFeatured)
  })
  
  // Actions
  async function fetchApprovedProperties(params?: PropertySearchParams) {
    loading.value = true
    error.value = null
    
    try {
      const result = await propertyService.getAllApproved(params)
      properties.value = result.properties
      pagination.value = result.pagination
    } catch (err: any) {
      console.error('Error in fetchApprovedProperties:', err)
      error.value = err.message || 'Failed to load properties. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function fetchMyProperties(params?: PropertySearchParams) {
    loading.value = true
    error.value = null
    
    try {
      const result = await propertyService.getMyProperties(params)
      myProperties.value = result.properties
      myPagination.value = result.pagination
    } catch (err: any) {
      console.error('Error in fetchMyProperties:', err)
      error.value = err.message || 'Failed to load your properties. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function fetchPropertyById(id: string) {
    loading.value = true
    error.value = null
    currentProperty.value = null
    
    try {
      currentProperty.value = await propertyService.getByIdIfApproved(id)
      
      // Update the property in the properties array if it exists
      const index = properties.value.findIndex(p => p.id === id)
      if (index !== -1) {
        properties.value[index] = currentProperty.value
      }
      
      // Also check in myProperties
      const myIndex = myProperties.value.findIndex(p => p.id === id)
      if (myIndex !== -1) {
        myProperties.value[myIndex] = currentProperty.value
      }
      
      return currentProperty.value
    } catch (err: any) {
      console.error(`Error in fetchPropertyById for ${id}:`, err)
      error.value = err.message || 'Failed to load property details. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function createProperty(propertyData: PropertyCreate) {
    loading.value = true
    error.value = null
    
    try {
      const newProperty = await propertyService.create(propertyData)
      // Add the new property to the myProperties array
      myProperties.value.unshift(newProperty)
      return newProperty
    } catch (err: any) {
      console.error('Error in createProperty:', err)
      error.value = err.message || 'Failed to create property. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function updateProperty(id: string, propertyData: PropertyUpdate) {
    loading.value = true
    error.value = null
    
    try {
      const updatedProperty = await propertyService.update(id, propertyData)
      
      // Update the property in the properties array if it exists
      const index = properties.value.findIndex(p => p.id === id)
      if (index !== -1) {
        properties.value[index] = updatedProperty
      }
      
      // Also update in myProperties
      const myIndex = myProperties.value.findIndex(p => p.id === id)
      if (myIndex !== -1) {
        myProperties.value[myIndex] = updatedProperty
      }
      
      // Update currentProperty if it's the same property
      if (currentProperty.value && currentProperty.value.id === id) {
        currentProperty.value = updatedProperty
      }
      
      return updatedProperty
    } catch (err: any) {
      console.error(`Error in updateProperty for ${id}:`, err)
      error.value = err.message || 'Failed to update property. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function deleteProperty(id: string) {
    loading.value = true
    error.value = null
    
    try {
      await propertyService.delete(id)
      
      // Remove the property from the properties array
      properties.value = properties.value.filter(p => p.id !== id)
      
      // Also remove from myProperties
      myProperties.value = myProperties.value.filter(p => p.id !== id)
      
      // Clear currentProperty if it's the same property
      if (currentProperty.value && currentProperty.value.id === id) {
        currentProperty.value = null
      }
    } catch (err: any) {
      console.error(`Error in deleteProperty for ${id}:`, err)
      error.value = err.message || 'Failed to delete property. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function updatePropertyStatus(id: string, statusData: PropertyStatusUpdate) {
    loading.value = true
    error.value = null
    
    try {
      const updatedProperty = await propertyService.updateStatus(id, statusData)
      
      // Update the property in the properties array if it exists
      const index = properties.value.findIndex(p => p.id === id)
      if (index !== -1) {
        properties.value[index] = updatedProperty
      }
      
      // Also update in myProperties
      const myIndex = myProperties.value.findIndex(p => p.id === id)
      if (myIndex !== -1) {
        myProperties.value[myIndex] = updatedProperty
      }
      
      // Update currentProperty if it's the same property
      if (currentProperty.value && currentProperty.value.id === id) {
        currentProperty.value = updatedProperty
      }
      
      return updatedProperty
    } catch (err: any) {
      console.error(`Error in updatePropertyStatus for ${id}:`, err)
      error.value = err.message || 'Failed to update property status. Please try again.'
      throw err
    } finally {
      loading.value = false
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
    deleteProperty,
    updatePropertyStatus
  }
})