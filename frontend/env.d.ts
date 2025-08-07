/// <reference types="vite/client" />

/**
 * Vite Environment Variables Type Definitions
 * Provides TypeScript support for import.meta.env and import.meta.hot
 * 
 * @see https://vitejs.dev/guide/env-and-mode.html#env-files
 */

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_URL: string
  
  // Debug Flags  
  readonly VITE_DEBUG_AUTH: string
  readonly VITE_DEBUG_API: string
  readonly VITE_DEBUG_KYC: string
  
  // Build Information
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
