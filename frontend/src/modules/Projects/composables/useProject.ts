import { ref, computed } from 'vue'
import { useProjectStore } from '../store/projectStore'
import type { Project, CreateProjectRequest } from '../types/Project'

/**
 * Composable for project-related functionality
 */
export function useProject() {
  const projectStore = useProjectStore()
  const searchQuery = ref('')
  const selectedTags = ref<string[]>([])
  const sortBy = ref<'newest' | 'price' | 'yield'>('newest')
  
  // Filtered and sorted projects
  const filteredProjects = computed(() => {
    let result = [...projectStore.projects]
    
    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(project => 
        project.projectTitle.toLowerCase().includes(query) ||
        project.location.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    // Filter by selected tags
    if (selectedTags.value.length > 0) {
      result = result.filter(project => 
        project.tags?.some(tag => selectedTags.value.includes(tag))
      )
    }
    
    // Sort projects
    result.sort((a, b) => {
      switch (sortBy.value) {
        case 'price':
          return (b.price || 0) - (a.price || 0)
        case 'yield':
          return (b.expectedYield || 0) - (a.expectedYield || 0)
        case 'newest':
        default:
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      }
    })
    
    return result
  })
  
  // Available tags from all projects
  const availableTags = computed(() => {
    const tagSet = new Set<string>()
    projectStore.projects.forEach(project => {
      project.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet)
  })
  
  // Load all projects
  const loadProjects = async () => {
    await projectStore.fetchProjects()
  }
  
  // Load a specific project
  const loadProject = async (id: string) => {
    await projectStore.fetchProjectById(id)
    return projectStore.currentProject
  }
  
  // Create a new project
  const createProject = async (projectData: CreateProjectRequest) => {
    return await projectStore.createProject(projectData)
  }
  
  // Update a project
  const updateProject = async (id: string, projectData: Partial<Project>) => {
    return await projectStore.updateProject(id, projectData)
  }
  
  // Delete a project
  const deleteProject = async (id: string) => {
    await projectStore.deleteProject(id)
  }
  
  // Toggle favorite status
  const toggleFavorite = async (id: string) => {
    await projectStore.toggleFavorite(id)
  }
  
  // Filter and sort controls
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }
  
  const toggleTag = (tag: string) => {
    if (selectedTags.value.includes(tag)) {
      selectedTags.value = selectedTags.value.filter(t => t !== tag)
    } else {
      selectedTags.value.push(tag)
    }
  }
  
  const clearFilters = () => {
    searchQuery.value = ''
    selectedTags.value = []
  }
  
  const setSortBy = (sort: 'newest' | 'price' | 'yield') => {
    sortBy.value = sort
  }
  
  return {
    // State from store
    projects: computed(() => projectStore.projects),
    loading: computed(() => projectStore.loading),
    error: computed(() => projectStore.error),
    currentProject: computed(() => projectStore.currentProject),
    favoriteProjects: computed(() => projectStore.getFavoriteProjects),
    
    // Local state
    searchQuery,
    selectedTags,
    sortBy,
    filteredProjects,
    availableTags,
    
    // Methods
    loadProjects,
    loadProject,
    createProject,
    updateProject,
    deleteProject,
    toggleFavorite,
    setSearchQuery,
    toggleTag,
    clearFilters,
    setSortBy
  }
}