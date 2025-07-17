import { ref } from 'vue'
import type { CreateProjectRequest, CreateProjectResponse } from '../types/Project'

export function useApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    body?: unknown,
    isFormData = false
  ): Promise<T> {
    loading.value = true
    error.value = null
    try {
      const headers: Record<string, string> = {}
      if (!isFormData) {
        headers['Content-Type'] = 'application/json'
      }

      const response = await fetch(`/api${url}`, {
        method,
        headers,
        body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'API error' }))
        throw new Error(errorData.message || 'API error')
      }
      return await response.json()
    } catch (err) {
      error.value = (err as Error).message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function postNewProject(projectData: CreateProjectRequest): Promise<CreateProjectResponse> {
    // Convert to JSON payload instead of FormData for now
    // File upload will be handled separately in future iterations
    const payload = {
      projectTitle: projectData.projectTitle,
      location: projectData.location,
      description: projectData.description,
      tokenSymbol: projectData.tokenSymbol,
      totalTokens: projectData.totalTokens,
      pricePerToken: projectData.pricePerToken,
      expectedYield: projectData.expectedYield,
      projectImage: typeof projectData.projectImage === 'string' ? projectData.projectImage : null
    }

    return request<CreateProjectResponse>('POST', '/properties/create', payload)
  }

  return { request, postNewProject, loading, error }
}