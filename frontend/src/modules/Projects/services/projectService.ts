import { useApi } from '@/composables/useApi'
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  UpdateProjectStatusRequest,
  ProjectSearchParams,
  ProjectSearchResult,
  CreateProjectResponse
} from '../types/Project'

// Create a single instance of the API client for all methods
const { get, post, put, patch, delete: deleteRequest, upload } = useApi()

/**
 * Unified Project Service
 * Handles all API calls related to projects and properties
 */
export const projectService = {
  /**
   * Get all approved projects with optional search parameters
   * @param params - Search parameters for filtering and pagination
   * @returns Promise with projects and pagination info
   */
  async getProjects(params?: ProjectSearchParams): Promise<ProjectSearchResult> {
    try {
      const response = await get('/combined', { params })
      return response
    } catch (error) {
      console.error('Error fetching projects:', error)
      throw error
    }
  },

  /**
   * Get a specific project by ID
   * @param id - Project ID
   * @returns Promise with project data
   */
  async getProjectById(id: string): Promise<Project> {
    try {
      return await get(`/combined/${id}`)
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error)
      throw error
    }
  },

  /**
   * Get projects owned by the current user
   * @param params - Search parameters for filtering and pagination
   * @returns Promise with projects and pagination info
   */
  async getMyProjects(params?: ProjectSearchParams): Promise<ProjectSearchResult> {
    try {
      // Import the client service to get the current client profile
      const { clientService } = await import('../../Client')
      
      // Get the current client profile to obtain the client ID
      const clientProfile = await clientService.getCurrentClientProfile()
      
      if (!clientProfile || !clientProfile.id) {
        throw new Error('No client profile found or client ID is missing')
      }
      
      // Use the client ID to fetch properties associated with this client
      const response = await get(`/properties/client/${clientProfile.id}`, { params })
      return response
    } catch (error) {
      console.error('Error fetching my projects:', error)
      throw error
    }
  },

  /**
   * Create a new project
   * @param projectData - Project creation data
   * @returns Promise with created project data
   */
  async createProject(projectData: CreateProjectRequest): Promise<CreateProjectResponse> {
    try {
      // Using properties endpoint as per backend routes
      return await post('/properties', projectData)
    } catch (error) {
      console.error('Error creating project:', error)
      throw error
    }
  },

  /**
   * Update an existing project
   * @param projectData - Updated project data with ID
   * @returns Promise with updated project data
   */
  async updateProject(projectData: UpdateProjectRequest): Promise<Project> {
    try {
      // Using properties endpoint as per backend routes
      return await put(`/properties/${projectData.id}`, projectData)
    } catch (error) {
      console.error(`Error updating project ${projectData.id}:`, error)
      throw error
    }
  },

  /**
   * Update project status
   * @param statusUpdate - Project status update data
   * @returns Promise with updated project
   */
  async updateProjectStatus(statusUpdate: UpdateProjectStatusRequest): Promise<Project> {
    try {
      // Using properties endpoint as per backend routes
      return await patch(`/properties/${statusUpdate.id}/status`, {
        status: statusUpdate.status
      })
    } catch (error) {
      console.error(`Error updating project status ${statusUpdate.id}:`, error)
      throw error
    }
  },

  /**
   * Delete a project
   * @param id - Project ID
   * @returns Promise with deletion status
   */
  async deleteProject(id: string): Promise<void> {
    try {
      // Using properties endpoint as per backend routes
      await deleteRequest(`/properties/${id}`)
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error)
      throw error
    }
  },

  /**
   * Toggle favorite status for a project
   * @param id - Project ID
   * @param isFavorite - New favorite status
   * @returns Promise with updated project data
   */
  async toggleFavorite(id: string, isFavorite: boolean): Promise<Project> {
    try {
      // Note: This endpoint might not exist in the backend yet
      // May need to be implemented or handled differently
      return await patch(`/properties/${id}/favorite`, { isFavorite })
    } catch (error) {
      console.error(`Error toggling favorite for project ${id}:`, error)
      throw error
    }
  },
  
  /**
   * Upload a project image
   * @param id - Project ID
   * @param imageFile - The image file to upload
   * @returns Promise with updated project data
   */
  async uploadProjectImage(id: string, imageFile: File): Promise<Project> {
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      // Using properties endpoint as per backend routes
      return await upload(`/properties/${id}/image`, formData)
    } catch (error) {
      console.error(`Error uploading image for project ${id}:`, error)
      throw error
    }
  }
}