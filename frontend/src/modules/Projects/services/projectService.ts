import { useApi } from '@/composables/useApi'
import type { Project, CreateProjectRequest, CreateProjectResponse } from '../types/Project'

// Create a single instance of the API client for all methods
const { get, post, put, patch, delete: deleteRequest, upload } = useApi()

/**
 * Service for handling project-related API calls
 */
export const projectService = {
  /**
   * Fetch all projects
   * @returns Promise with array of projects
   */
  async getProjects(): Promise<Project[]> {
    try {
      return await get('/projects')
    } catch (error) {
      console.error('Error fetching projects:', error)
      throw error
    }
  },

  /**
   * Fetch a single project by ID
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
   * @param id - Project ID
   * @param projectData - Updated project data
   * @returns Promise with updated project data
   */
  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    try {
      return await put(`/projects/${id}`, projectData)
    } catch (error) {
      console.error(`Error updating project ${id}:`, error)
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