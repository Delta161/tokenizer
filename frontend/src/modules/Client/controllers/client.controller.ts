/**
 * Client Controller
 * Handles client-related operations and interactions
 */

import { clientService } from '../services/clientService'
import type { Client, ClientApplicationRequest, ClientUpdateRequest } from '../types/Client'

/**
 * Client Controller Class
 */
export class ClientController {
  /**
   * Get the current user's client profile
   * @returns Promise with client profile data
   */
  async getCurrentClientProfile(): Promise<Client> {
    return clientService.getCurrentClientProfile()
  }

  /**
   * Get a client by ID
   * @param id - Client ID
   * @returns Promise with client data
   */
  async getClientById(id: string): Promise<Client> {
    return clientService.getClientById(id)
  }
}

// Create a singleton instance
export const clientController = new ClientController()