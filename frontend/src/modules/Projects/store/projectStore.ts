import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project } from '../types/Project'
import { projectService } from '../services/projectService'

export const useProjectStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentProject = ref<Project | null>(null)
  
  // Getters
  const getProjectById = computed(() => {
    return (id: string) => projects.value.find(project => project.id === id)
  })
  
  const getFavoriteProjects = computed(() => {
    return projects.value.filter(project => project.isFavorite)
  })
  
  // Actions
  async function fetchProjects() {
    loading.value = true
    error.value = null
    
    try {
      projects.value = await projectService.getProjects()
    } catch (err) {
      console.error('Error in fetchProjects:', err)
      error.value = 'Failed to load projects. Please try again.'
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
    } catch (err) {
      console.error(`Error in fetchProjectById for ${id}:`, err)
      error.value = 'Failed to load project details. Please try again.'
    } finally {
      loading.value = false
    }
  }
  
  async function createProject(projectData: any) {
    loading.value = true
    error.value = null
    
    try {
      const newProject = await projectService.createProject(projectData)
      // Add the new project to the projects array
      if (newProject) {
        projects.value.push(newProject as unknown as Project)
      }
      return newProject
    } catch (err) {
      console.error('Error in createProject:', err)
      error.value = 'Failed to create project. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function updateProject(id: string, projectData: Partial<Project>) {
    loading.value = true
    error.value = null
    
    try {
      const updatedProject = await projectService.updateProject(id, projectData)
      
      // Update the project in the projects array
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
      
      // Update currentProject if it's the same project
      if (currentProject.value && currentProject.value.id === id) {
        currentProject.value = updatedProject
      }
      
      return updatedProject
    } catch (err) {
      console.error(`Error in updateProject for ${id}:`, err)
      error.value = 'Failed to update project. Please try again.'
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
      
      // Remove the project from the projects array
      projects.value = projects.value.filter(p => p.id !== id)
      
      // Clear currentProject if it's the same project
      if (currentProject.value && currentProject.value.id === id) {
        currentProject.value = null
      }
    } catch (err) {
      console.error(`Error in deleteProject for ${id}:`, err)
      error.value = 'Failed to delete project. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function toggleFavorite(id: string) {
    try {
      const project = projects.value.find(p => p.id === id)
      if (!project) return
      
      const newFavoriteStatus = !project.isFavorite
      const updatedProject = await projectService.toggleFavorite(id, newFavoriteStatus)
      
      // Update the project in the projects array
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
      
      // Update currentProject if it's the same project
      if (currentProject.value && currentProject.value.id === id) {
        currentProject.value = updatedProject
      }
    } catch (err) {
      console.error(`Error in toggleFavorite for ${id}:`, err)
      error.value = 'Failed to update favorite status. Please try again.'
    }
  }
  
  return {
    // State
    projects,
    loading,
    error,
    currentProject,
    
    // Getters
    getProjectById,
    getFavoriteProjects,
    
    // Actions
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    toggleFavorite
  }
})