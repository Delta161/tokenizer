// Property Module Services
import type { 
  Property, 
  PropertyCreate, 
  PropertyUpdate, 
  PropertyStatusUpdate,
  PropertySearchParams,
  PropertySearchResult
} from '../types';

/**
 * Service for handling property-related API calls
 */
export class PropertyService {
  private apiBaseUrl: string;
  
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }
  
  /**
   * Get all approved properties with pagination
   * @param params - Search parameters for filtering and pagination
   * @returns Promise with property list and pagination info
   */
  async getAllApproved(params?: PropertySearchParams): Promise<PropertySearchResult> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const response = await fetch(`${this.apiBaseUrl}/properties${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for JWT
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch properties');
      }
      
      const data = await response.json();
      return {
        properties: data.data,
        pagination: data.pagination || {
          limit: 10,
          offset: 0,
          total: data.data.length,
          hasMore: false
        }
      };
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }
  
  /**
   * Get a property by ID if it's approved
   * @param id - Property ID
   * @returns Promise with property details
   */
  async getByIdIfApproved(id: string): Promise<Property> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/properties/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for JWT
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch property');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error: any) {
      console.error(`Error fetching property ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get properties for the authenticated client with pagination
   * @param params - Search parameters for filtering and pagination
   * @returns Promise with property list and pagination info
   */
  async getMyProperties(params?: PropertySearchParams): Promise<PropertySearchResult> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.status) queryParams.append('status', params.status);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const response = await fetch(`${this.apiBaseUrl}/properties/my${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for JWT
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch properties');
      }
      
      const data = await response.json();
      return {
        properties: data.data,
        pagination: data.pagination || {
          limit: 10,
          offset: 0,
          total: data.data.length,
          hasMore: false
        }
      };
    } catch (error: any) {
      console.error('Error fetching my properties:', error);
      throw error;
    }
  }
  
  /**
   * Create a new property
   * @param data - Property creation data
   * @returns Promise with created property
   */
  async create(data: PropertyCreate): Promise<Property> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/properties/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for JWT
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create property');
      }
      
      const responseData = await response.json();
      return responseData.data;
    } catch (error: any) {
      console.error('Error creating property:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing property
   * @param id - Property ID
   * @param data - Property update data
   * @returns Promise with updated property
   */
  async update(id: string, data: PropertyUpdate): Promise<Property> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/properties/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for JWT
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update property');
      }
      
      const responseData = await response.json();
      return responseData.data;
    } catch (error: any) {
      console.error(`Error updating property ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a property
   * @param id - Property ID
   * @returns Promise with success status
   */
  async delete(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/properties/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for JWT
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete property');
      }
      
      return true;
    } catch (error: any) {
      console.error(`Error deleting property ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Update property status (admin only)
   * @param id - Property ID
   * @param data - Property status update data
   * @returns Promise with updated property
   */
  async updateStatus(id: string, data: PropertyStatusUpdate): Promise<Property> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/properties/admin/properties/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for JWT
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update property status');
      }
      
      const responseData = await response.json();
      return responseData.data;
    } catch (error: any) {
      console.error(`Error updating property status ${id}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const propertyService = new PropertyService();