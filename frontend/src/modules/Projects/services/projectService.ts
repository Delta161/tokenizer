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
      const response = await get('/projects', { params })
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
      return await get(`/projects/${id}`)
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
      const response = await get('/projects/my', { params })
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
      return await post('/projects', projectData)
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
      return await put(`/projects/${projectData.id}`, projectData)
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
      return await patch(`/projects/${statusUpdate.id}/status`, {
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
      await deleteRequest(`/projects/${id}`)
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
      return await patch(`/projects/${id}/favorite`, { isFavorite })
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
      return await upload(`/projects/${id}/image`, formData)
    } catch (error) {
      console.error(`Error uploading image for project ${id}:`, error)
      throw error
    }
  }
}