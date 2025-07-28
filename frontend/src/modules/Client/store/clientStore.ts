/**
 * Client Store
 * Manages client-related state using Pinia
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { clientService } from '../services/clientService'
import type { Client, ClientStatus } from '../types/Client'

/**
 * Client Store
 */
export const useClientStore = defineStore('client', () => {
  // State
  const client = ref<Client | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isClientLoaded = computed(() => !!client.value)
  const clientStatus = computed(() => client.value?.status || null)
  const isApproved = computed(() => clientStatus.value === ClientStatus.APPROVED)
  
  // Actions
  async function fetchClientProfile() {
    loading.value = true
    error.value = null
    
    try {
      client.value = await clientService.getCurrentClientProfile()
      return client.value
    } catch (err) {
      console.error('Error fetching client profile:', err)
      error.value = 'Failed to load client profile'
      return null
    } finally {
      loading.value = false
    }
  }

  function resetClientState() {
    client.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    client,
    loading,
    error,
    
    // Getters
    isClientLoaded,
    clientStatus,
    isApproved,
    
    // Actions
    fetchClientProfile,
    resetClientState
  }
})