import { ref } from 'vue'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useLoading } from './useLoading'
import apiClient from '@/services/apiClient'
import { useAuthStore } from '@/modules/Auth/store/authStore'
import errorHandler from '@/services/errorHandler'

/**
 * Configuration options for the API client
 */
interface ApiOptions {
  /**
   * Custom axios instance to use instead of the default apiClient
   */
  axiosInstance?: AxiosInstance
}

/**
 * Composable for making API requests with built-in loading and error handling
 */
export function useApi(options: ApiOptions = {}) {
  // Use the provided loading composable
  const { isLoading, error, withLoading, clearError, setError } = useLoading()
  
  // Use the provided axios instance or the centralized apiClient
  const api = options.axiosInstance || apiClient
  
  // Get auth store for token management
  const authStore = useAuthStore()
  
  /**
   * Make a GET request
   * @param url - The URL to request
   * @param config - Optional axios request configuration
   * @returns Promise with the response data
   */
  async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return withLoading(async () => {
      try {
        const response = await api.get<T>(url, config)
        return response.data
      } catch (err) {
        handleApiError(err)
        throw err
      }
    })
  }
  
  /**
   * Make a POST request
   * @param url - The URL to request
   * @param data - The data to send
   * @param config - Optional axios request configuration
   * @returns Promise with the response data
   */
  async function post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return withLoading(async () => {
      try {
        const response = await api.post<T>(url, data, config)
        return response.data
      } catch (err) {
        handleApiError(err)
        throw err
      }
    })
  }
  
  /**
   * Make a PUT request
   * @param url - The URL to request
   * @param data - The data to send
   * @param config - Optional axios request configuration
   * @returns Promise with the response data
   */
  async function put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return withLoading(async () => {
      try {
        const response = await api.put<T>(url, data, config)
        return response.data
      } catch (err) {
        handleApiError(err)
        throw err
      }
    })
  }
  
  /**
   * Make a PATCH request
   * @param url - The URL to request
   * @param data - The data to send
   * @param config - Optional axios request configuration
   * @returns Promise with the response data
   */
  async function patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return withLoading(async () => {
      try {
        const response = await api.patch<T>(url, data, config)
        return response.data
      } catch (err) {
        handleApiError(err)
        throw err
      }
    })
  }
  
  /**
   * Make a DELETE request
   * @param url - The URL to request
   * @param config - Optional axios request configuration
   * @returns Promise with the response data
   */
  async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return withLoading(async () => {
      try {
        const response = await api.delete<T>(url, config)
        return response.data
      } catch (err) {
        handleApiError(err)
        throw err
      }
    })
  }
  
  /**
   * Upload a file or form data
   * @param url - The URL to request
   * @param formData - The FormData object to send
   * @param config - Optional axios request configuration
   * @returns Promise with the response data
   */
  async function upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const uploadConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data'
      }
    }
    
    return withLoading(async () => {
      try {
        const response = await api.post<T>(url, formData, uploadConfig)
        return response.data
      } catch (err) {
        handleApiError(err)
        throw err
      }
    })
  }
  
  /**
   * Handle API errors and set the error message
   */
  function handleApiError(err: any): void {
    // Process the error through our error handler
    const appError = errorHandler.processError(err);
    
    // Set the error message in the loading state
    setError(appError.message);
    
    // Show a notification for the error
    errorHandler.showErrorNotification(appError);
  }
  
  return {
    // Axios instance
    api,
    
    // Request methods
    get,
    post,
    put,
    patch,
    delete: del,
    upload,
    
    // State
    isLoading,
    error,
    clearError
  }
}