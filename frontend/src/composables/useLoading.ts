import { ref } from 'vue'

/**
 * Composable for managing loading states and errors
 * Provides reactive loading state and error handling
 */
export function useLoading() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Execute an async function with loading state management
   * @param asyncFn - Async function to execute
   * @returns Promise with the result of the async function
   */
  async function withLoading<T>(asyncFn: () => Promise<T>): Promise<T> {
    isLoading.value = true
    error.value = null
    
    try {
      return await asyncFn()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset the error state
   */
  function clearError() {
    error.value = null
  }

  /**
   * Set a specific error message
   * @param message - Error message to set
   */
  function setError(message: string) {
    error.value = message
  }

  return {
    isLoading,
    error,
    withLoading,
    clearError,
    setError
  }
}