import { useApi } from '@/composables/useApi'
import type { Client } from '../types/Client'

// Create a single instance of the API client for all methods
const { get, post, put, patch, delete: deleteRequest } = useApi()

/**
 * Client Service
 * Handles all API calls related to client profiles
 */
export const clientService = {
  /**
   * Get the current user's client profile
   * @returns Promise with client profile data
   */
  async getCurrentClientProfile(): Promise<Client> {
    try {
      const response = await get('/clients/me')
      return response.data
    } catch (error) {
      console.error('Error fetching current client profile:', error)
      throw error
    }
  },

  /**
   * Get a client by ID
   * @param id - Client ID
   * @returns Promise with client data
   */
  async getClientById(id: string): Promise<Client> {
    try {
      const response = await get(`/clients/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching client ${id}:`, error)
      throw error
    }
  }
}