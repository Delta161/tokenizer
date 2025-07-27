import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  UpdateProjectStatusRequest,
  ProjectSearchParams,
  ProjectSearchResult
} from '../types/Project'
import { projectService } from '../services/projectService'

/**
 * Unified Project Store
 * Manages project state and actions
 */
export const useProjectStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])
  const myProjects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    limit: 10,
    offset: 0,
    total: 0,
    hasMore: false
  })
  const myPagination = ref({
    limit: 10,
    offset: 0,
    total: 0,
    hasMore: false
  })
  
  // Getters
  const getProjectById = computed(() => {
    return (id: string) => projects.value.find(project => project.id === id) ||
      myProjects.value.find(project => project.id === id)
  })
  
  const getFavoriteProjects = computed(() => {
    return projects.value.filter(project => project.isFavorite)
  })

  const getFeaturedProjects = computed(() => {
    return projects.value.filter(project => project.isFeatured)
  })
  
  // Actions
  async function fetchProjects(params?: ProjectSearchParams) {
    loading.value = true
    error.value = null
    
    try {
      const result = await projectService.getProjects(params)
      projects.value = result.projects
      pagination.value = result.pagination
    } catch (err: any) {
      console.error('Error in fetchProjects:', err)
      error.value = err.message || 'Failed to load projects. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function fetchMyProjects(params?: ProjectSearchParams) {
    loading.value = true
    error.value = null
    
    try {
      const result = await projectService.getMyProjects(params)
      myProjects.value = result.projects
      myPagination.value = result.pagination
    } catch (err: any) {
      console.error('Error in fetchMyProjects:', err)
      error.value = err.message || 'Failed to load your projects. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function fetchProjectById(id: string) {
    loading.value = true
    error.value = null
    currentProject.value = null
    
    try {
      currentProject.value = await projectService.getProjectById(id)
      
      // Update the project in the projects array if it exists
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = currentProject.value
      }
      
      // Also check in myProjects
      const myIndex = myProjects.value.findIndex(p => p.id === id)
      if (myIndex !== -1) {
        myProjects.value[myIndex] = currentProject.value
      }
      
      return currentProject.value
    } catch (err: any) {
      console.error(`Error in fetchProjectById for ${id}:`, err)
      error.value = err.message || 'Failed to load project details. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function createProject(projectData: CreateProjectRequest) {
    loading.value = true
    error.value = null
    
    try {
      const response = await projectService.createProject(projectData)
      if (response.success && response.data) {
        // Fetch the complete project data
        const newProject = await projectService.getProjectById(response.data.id)
        myProjects.value.unshift(newProject)
        return newProject
      }
      return response
    } catch (err: any) {
      console.error('Error in createProject:', err)
      error.value = err.message || 'Failed to create project. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function updateProject(projectData: UpdateProjectRequest) {
    loading.value = true
    error.value = null
    
    try {
      const updatedProject = await projectService.updateProject(projectData)
      
      // Update in projects array if exists
      const index = projects.value.findIndex(p => p.id === projectData.id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
      
      // Update in myProjects array if exists
      const myIndex = myProjects.value.findIndex(p => p.id === projectData.id)
      if (myIndex !== -1) {
        myProjects.value[myIndex] = updatedProject
      }
      
      // Update currentProject if it's the same project
      if (currentProject.value?.id === projectData.id) {
        currentProject.value = updatedProject
      }
      
      return updatedProject
    } catch (err: any) {
      console.error(`Error in updateProject for ${projectData.id}:`, err)
      error.value = err.message || 'Failed to update project. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function updateProjectStatus(statusUpdate: UpdateProjectStatusRequest) {
    loading.value = true
    error.value = null
    
    try {
      const updatedProject = await projectService.updateProjectStatus(statusUpdate)
      
      // Update in projects array if exists
      const index = projects.value.findIndex(p => p.id === statusUpdate.id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
      
      // Update in myProjects array if exists
      const myIndex = myProjects.value.findIndex(p => p.id === statusUpdate.id)
      if (myIndex !== -1) {
        myProjects.value[myIndex] = updatedProject
      }
      
      // Update currentProject if it's the same project
      if (currentProject.value?.id === statusUpdate.id) {
        currentProject.value = updatedProject
      }
      
      return updatedProject
    } catch (err: any) {
      console.error(`Error in updateProjectStatus for ${statusUpdate.id}:`, err)
      error.value = err.message || 'Failed to update project status. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function deleteProject(id: string) {
    loading.value = true
    error.value = null
    
    try {
      await projectService.deleteProject(id)
      
      // Remove from projects array if exists
      projects.value = projects.value.filter(p => p.id !== id)
      
      // Remove from myProjects array if exists
      myProjects.value = myProjects.value.filter(p => p.id !== id)
      
      // Clear currentProject if it's the same project
      if (currentProject.value?.id === id) {
        currentProject.value = null
      }
    } catch (err: any) {
      console.error(`Error in deleteProject for ${id}:`, err)
      error.value = err.message || 'Failed to delete project. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function toggleFavorite(id: string) {
    try {
      const project = projects.value.find(p => p.id === id) || 
                     myProjects.value.find(p => p.id === id)
      if (!project) return
      
      const newFavoriteStatus = !project.isFavorite
      const updatedProject = await projectService.toggleFavorite(id, newFavoriteStatus)
      
      // Update in projects array if exists
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
      
      // Update in myProjects array if exists
      const myIndex = myProjects.value.findIndex(p => p.id === id)
      if (myIndex !== -1) {
        myProjects.value[myIndex] = updatedProject
      }
      
      // Update currentProject if it's the same project
      if (currentProject.value?.id === id) {
        currentProject.value = updatedProject
      }
    } catch (err: any) {
      console.error(`Error in toggleFavorite for ${id}:`, err)
      error.value = err.message || 'Failed to update favorite status. Please try again.'
    }
  }

  function clearCurrentProject() {
    currentProject.value = null
  }
  
  async function uploadProjectImage(projectId: string, formData: FormData) {
    loading.value = true
    error.value = null
    
    try {
      const updatedProject = await projectService.uploadProjectImage(projectId, formData.get('image') as File)
      
      // Update in projects array if exists
      const index = projects.value.findIndex(p => p.id === projectId)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
      
      // Update in myProjects array if exists
      const myIndex = myProjects.value.findIndex(p => p.id === projectId)
      if (myIndex !== -1) {
        myProjects.value[myIndex] = updatedProject
      }
      
      // Update currentProject if it's the same project
      if (currentProject.value?.id === projectId) {
        currentProject.value = updatedProject
      }
      
      return updatedProject
    } catch (err: any) {
      console.error(`Error in uploadProjectImage for ${projectId}:`, err)
      error.value = err.message || 'Failed to upload project image. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    // State
    projects,
    myProjects,
    currentProject,
    loading,
    error,
    pagination,
    myPagination,
    
    // Getters
    getProjectById,
    getFavoriteProjects,
    getFeaturedProjects,
    
    // Actions
    fetchProjects,
    fetchMyProjects,
    fetchProjectById,
    createProject,
    updateProject,
    updateProjectStatus,
    deleteProject,
    toggleFavorite,
    clearCurrentProject,
    uploadProjectImage
  }
})