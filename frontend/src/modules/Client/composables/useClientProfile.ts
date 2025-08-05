/**
 * Client Profile Composable
 * Provides reactive access to client profile data
 */

import { ref, onMounted, type Ref } from "vue";
import { clientController } from '../controllers/client.controller'
import type { Client } from '../types/Client'

/**
 * Composable for accessing and managing client profile data
 * @returns Object with client data and loading state
 */
export function useClientProfile() {
  const client: Ref<Client | null> = ref(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  /**
   * Load the client profile data
   */
  async function loadClientProfile() {
    loading.value = true
    error.value = null
    
    try {
      client.value = await clientController.getCurrentClientProfile()
    } catch (err) {
      console.error('Error loading client profile:', err)
      error.value = 'Failed to load client profile'
    } finally {
      loading.value = false
    }
  }

  // Load client profile on component mount
  onMounted(() => {
    loadClientProfile()
  })

  return {
    client,
    loading,
    error,
    loadClientProfile
  }
}