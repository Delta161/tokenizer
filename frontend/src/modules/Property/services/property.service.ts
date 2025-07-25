import apiClient from '@/services/apiClient';
import type {
  Property,
  PropertyCreate,
  PropertyUpdate,
  PropertyStatusUpdate,
  PropertySearchParams,
  PropertySearchResult
} from '../types/property.types';

/**
 * Property Service
 * Handles all API calls related to properties
 */
const propertyService = {
  /**
   * Get all approved properties with optional search parameters
   * @param params - Search parameters for filtering and pagination
   * @returns Promise with properties and pagination info
   */
  async getAllApproved(params?: PropertySearchParams): Promise<PropertySearchResult> {
    try {
      const response = await apiClient.get('/properties/approved', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching approved properties:', error);
      throw error;
    }
  },

  /**
   * Get a specific property by ID if it's approved
   * @param id - Property ID
   * @returns Promise with property data
   */
  async getByIdIfApproved(id: string): Promise<Property> {
    try {
      const response = await apiClient.get(`/properties/approved/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching property ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get properties owned by the current user
   * @param params - Search parameters for filtering and pagination
   * @returns Promise with properties and pagination info
   */
  async getMyProperties(params?: PropertySearchParams): Promise<PropertySearchResult> {
    try {
      const response = await apiClient.get('/properties/my', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching my properties:', error);
      throw error;
    }
  },

  /**
   * Create a new property
   * @param property - Property data to create
   * @returns Promise with created property
   */
  async createProperty(property: PropertyCreate): Promise<Property> {
    try {
      const response = await apiClient.post('/properties', property);
      return response.data;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  /**
   * Update an existing property
   * @param property - Property data to update
   * @returns Promise with updated property
   */
  async updateProperty(property: PropertyUpdate): Promise<Property> {
    try {
      const response = await apiClient.put(`/properties/${property.id}`, property);
      return response.data;
    } catch (error) {
      console.error(`Error updating property ${property.id}:`, error);
      throw error;
    }
  },

  /**
   * Update property status
   * @param update - Property status update data
   * @returns Promise with updated property
   */
  async updatePropertyStatus(update: PropertyStatusUpdate): Promise<Property> {
    try {
      const response = await apiClient.patch(`/properties/${update.id}/status`, {
        status: update.status
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating property status ${update.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a property
   * @param id - Property ID to delete
   * @returns Promise with success message
   */
  async deleteProperty(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting property ${id}:`, error);
      throw error;
    }
  }
};

export default propertyService;