/**
 * Client Module Index
 * Exports all components of the client module
 */

// Components
export { default as ClientInfo } from './components/ClientInfo.vue'
export { default as ClientApplicationForm } from './components/ClientApplicationForm.vue'

// Composables
export { useClientProfile } from './composables/useClientProfile'

// Controllers
export { clientController, ClientController } from './controllers/client.controller'

// Services
export { clientService } from './services/clientService'

// Store
export { useClientStore } from './store/clientStore'

// Types
export * from './types/Client'

// Utils
export * from './utils/clientUtils'

// Validators
export * from './validators/clientValidators'

// Routes
export { default as clientRoutes } from './routes'

/**
 * Initialize the Client module
 * This function should be called once during application startup
 */
export function initClientModule() {
  // Any initialization logic can go here
  console.log('Client module initialized')
}