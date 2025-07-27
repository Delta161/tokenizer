import { ref, computed, watch } from 'vue'
import { useProjectStore } from '../store/projectStore'
import type { Project, ProjectSearchParams, ProjectStatus } from '../types/Project'

/**
 * Composable for project search functionality
 * Provides reactive state and methods for searching and filtering projects
 */
export function useProjectSearch() {
  const projectStore = useProjectStore()
  
  // Search state
  const searchQuery = ref('')
  const selectedStatus = ref<ProjectStatus | null>(null)
  const selectedCountry = ref<string | null>(null)
  const selectedCity = ref<string | null>(null)
  const minPrice = ref<number | null>(null)
  const maxPrice = ref<number | null>(null)
  const sortBy = ref<string>('createdAt')
  const sortDirection = ref<'asc' | 'desc'>('desc')
  const showMyProjects = ref(false)
  const selectedTags = ref<string[]>([])
  
  // Computed properties
  const filteredProjects = computed(() => {
    let result = showMyProjects.value ? projectStore.myProjects : projectStore.projects
    
    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(project => 
        project.title?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.location?.toLowerCase().includes(query) ||
        project.tokenSymbol?.toLowerCase().includes(query)
      )
    }
    
    // Filter by status
    if (selectedStatus.value) {
      result = result.filter(project => project.status === selectedStatus.value)
    }
    
    // Filter by city
    if (selectedCity.value) {
      result = result.filter(project => 
        project.city?.toLowerCase() === selectedCity.value?.toLowerCase()
      )
    }
    
    // Filter by country
    if (selectedCountry.value) {
      result = result.filter(project => 
        project.country?.toLowerCase() === selectedCountry.value?.toLowerCase()
      )
    }
    
    // Filter by price range
    if (minPrice.value !== null) {
      result = result.filter(project => {
        const price = typeof project.price === 'number' ? project.price : 
                     typeof project.pricePerToken === 'number' ? project.pricePerToken : 0
        return price >= (minPrice.value || 0)
      })
    }
    
    if (maxPrice.value !== null) {
      result = result.filter(project => {
        const price = typeof project.price === 'number' ? project.price : 
                     typeof project.pricePerToken === 'number' ? project.pricePerToken : 0
        return price <= (maxPrice.value || Infinity)
      })
    }
    
    // Filter by tags
    if (selectedTags.value.length > 0) {
      result = result.filter(project => {
        if (!project.tags || !Array.isArray(project.tags)) return false
        return selectedTags.value.some(tag => project.tags?.includes(tag))
      })
    }
    
    return result
  })
  
  const currentPagination = computed(() => {
    return showMyProjects.value ? projectStore.myPagination : projectStore.pagination
  })
  
  const availableCountries = computed(() => {
    const projects = showMyProjects.value ? projectStore.myProjects : projectStore.projects
    const countries = new Set<string>()
    
    projects.forEach(project => {
      if (project.country) {
        countries.add(project.country)
      }
    })
    
    return Array.from(countries).sort()
  })
  
  const availableCities = computed(() => {
    const projects = showMyProjects.value ? projectStore.myProjects : projectStore.projects
    const cities = new Set<string>()
    
    projects.forEach(project => {
      if (project.city) {
        cities.add(project.city)
      }
    })
    
    return Array.from(cities).sort()
  })
  
  const availableTags = computed(() => {
    const projects = showMyProjects.value ? projectStore.myProjects : projectStore.projects
    const tags = new Set<string>()
    
    projects.forEach(project => {
      if (project.tags && Array.isArray(project.tags)) {
        project.tags.forEach(tag => tags.add(tag))
      } else if (project.tag) {
        tags.add(project.tag)
      }
    })
    
    return Array.from(tags).sort()
  })
  
  // Methods
  async function search() {
    const params: ProjectSearchParams = {
      limit: currentPagination.value.limit,
      offset: currentPagination.value.offset
    }
    
    if (searchQuery.value) {
      params.query = searchQuery.value
    }
    
    if (selectedStatus.value) {
      params.status = selectedStatus.value
    }
    
    if (selectedCountry.value) {
      params.country = selectedCountry.value
    }
    
    if (selectedCity.value) {
      params.city = selectedCity.value
    }
    
    if (minPrice.value !== null) {
      params.minPrice = minPrice.value
    }
    
    if (maxPrice.value !== null) {
      params.maxPrice = maxPrice.value
    }
    
    if (sortBy.value) {
      params.sortBy = sortBy.value
      params.sortDirection = sortDirection.value
    }
    
    if (selectedTags.value.length > 0) {
      params.tags = selectedTags.value
    }
    
    try {
      if (showMyProjects.value) {
        await projectStore.fetchMyProjects(params)
      } else {
        await projectStore.fetchProjects(params)
      }
    } catch (error) {
      console.error('Error searching projects:', error)
    }
  }
  
  // Filter controls
  function setSearchQuery(query: string) {
    searchQuery.value = query
  }
  
  function setStatus(status: ProjectStatus | null) {
    selectedStatus.value = status
  }
  
  function setCountry(country: string | null) {
    selectedCountry.value = country
    // Reset city if country changes
    if (country === null) {
      selectedCity.value = null
    }
  }
  
  function setCity(city: string | null) {
    selectedCity.value = city
  }
  
  function setPriceRange(min: number | null, max: number | null) {
    minPrice.value = min
    maxPrice.value = max
  }
  
  function setSortBy(field: string, direction: 'asc' | 'desc' = 'desc') {
    sortBy.value = field
    sortDirection.value = direction
  }
  
  function toggleMyProjects(value?: boolean) {
    if (value !== undefined) {
      showMyProjects.value = value
    } else {
      showMyProjects.value = !showMyProjects.value
    }
  }
  
  function toggleTag(tag: string) {
    const index = selectedTags.value.indexOf(tag)
    if (index === -1) {
      selectedTags.value.push(tag)
    } else {
      selectedTags.value.splice(index, 1)
    }
  }
  
  function clearFilters() {
    searchQuery.value = ''
    selectedStatus.value = null
    selectedCountry.value = null
    selectedCity.value = null
    minPrice.value = null
    maxPrice.value = null
    selectedTags.value = []
    // Keep sort and showMyProjects as they are
  }
  
  // Watch for changes to trigger search
  watch(
    [
      searchQuery,
      selectedStatus,
      selectedCountry,
      selectedCity,
      minPrice,
      maxPrice,
      sortBy,
      sortDirection,
      showMyProjects,
      selectedTags
    ],
    () => {
      // Reset pagination when filters change
      if (showMyProjects.value) {
        projectStore.myPagination.offset = 0
      } else {
        projectStore.pagination.offset = 0
      }
      search()
    },
    { deep: true }
  )
  
  // Initial search
  search()
  
  return {
    // State from store
    projects: computed(() => projectStore.projects),
    myProjects: computed(() => projectStore.myProjects),
    loading: computed(() => projectStore.loading),
    error: computed(() => projectStore.error),
    currentProject: computed(() => projectStore.currentProject),
    favoriteProjects: computed(() => projectStore.getFavoriteProjects),
    featuredProjects: computed(() => projectStore.getFeaturedProjects),
    
    // Local state
    searchQuery,
    selectedStatus,
    selectedCountry,
    selectedCity,
    minPrice,
    maxPrice,
    sortBy,
    sortDirection,
    showMyProjects,
    selectedTags,
    
    // Computed properties
    filteredProjects,
    currentPagination,
    availableCountries,
    availableCities,
    availableTags,
    
    // Methods
    search,
    setSearchQuery,
    setStatus,
    setCountry,
    setCity,
    setPriceRange,
    setSortBy,
    toggleMyProjects,
    toggleTag,
    clearFilters,
    
    // Store methods
    fetchProjectById: projectStore.fetchProjectById,
    createProject: projectStore.createProject,
    updateProject: projectStore.updateProject,
    updateProjectStatus: projectStore.updateProjectStatus,
    deleteProject: projectStore.deleteProject,
    toggleFavorite: projectStore.toggleFavorite,
    clearCurrentProject: projectStore.clearCurrentProject
  }
}