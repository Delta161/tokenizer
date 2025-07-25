import { ref } from 'vue'
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useLoading } from './useLoading'

/**
 * Configuration options for the API client
 */
interface ApiOptions {
  /**
   * Base URL for API requests
   */
  baseURL?: string
  
  /**
   * Whether to include credentials in requests
   */
  withCredentials?: boolean
  
  /**
   * Default headers to include with every request
   */
  headers?: Record<string, string>
  
  /**
   * Whether to automatically handle 401 errors by redirecting to login
   */
  handleAuth?: boolean
  
  /**
   * Custom axios instance to use instead of creating a new one
   */
  axiosInstance?: AxiosInstance
}

/**
 * Composable for making API requests with built-in loading and error handling
 */
export function useApi(options: ApiOptions = {}) {
  // Use the provided loading composable
  const { isLoading, error, withLoading, clearError, setError } = useLoading()
  
  // Create or use provided axios instance
  const api = options.axiosInstance || axios.create({
    baseURL: options.baseURL || import.meta.env.VITE_API_BASE_URL || '/api',
    withCredentials: options.withCredentials !== false,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  
  // Add request interceptor for auth token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )
  
  // Add response interceptor for error handling
  if (options.handleAuth !== false) {
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }
  
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
    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.message || err.message || 'API request failed'
      setError(errorMessage)
    } else {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
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