<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '../../composables/useApi'
import { useNotification } from '../../composables/useNotification'
import { useConfirmation } from '../../composables/useConfirmation'
import { useFormatter } from '../../composables/useFormatter'
import { usePagination } from '../../composables/usePagination'

// Define types for our data
interface Project {
  id: string
  projectTitle: string
  location: string
  description: string
  tokenSymbol: string
  totalTokens: number
  pricePerToken: number
  expectedYield?: number
  projectImage?: string
  createdAt: string
}

// Initialize composables
const { get, post, delete: deleteRequest, upload, isLoading, error } = useApi()
const { showSuccess, showError } = useNotification()
const { confirm, confirmDanger } = useConfirmation()
const { formatCurrency, formatDate, formatPercent } = useFormatter()
const { currentPage, itemsPerPage, totalItems, totalPages, setTotalItems, goToPage } = usePagination()

// State
const projects = ref<Project[]>([])
const selectedProject = ref<Project | null>(null)
const searchQuery = ref('')

// Fetch projects with pagination
async function fetchProjects() {
  try {
    const response = await get<{ data: Project[], total: number }>(
      `/properties?page=${currentPage.value}&limit=${itemsPerPage.value}&search=${searchQuery.value}`
    )
    projects.value = response.data
    setTotalItems(response.total)
  } catch (err) {
    showError('Failed to load projects')
  }
}

// View project details
function viewProject(project: Project) {
  selectedProject.value = project
}

// Delete a project
async function removeProject(project: Project) {
  const confirmed = await confirmDanger(
    'Delete Project',
    `Are you sure you want to delete ${project.projectTitle}? This action cannot be undone.`,
    'Delete',
    'Cancel'
  )
  
  if (confirmed) {
    try {
      await deleteRequest(`/properties/${project.id}`)
      showSuccess('Project deleted successfully')
      projects.value = projects.value.filter(p => p.id !== project.id)
    } catch (err) {
      showError('Failed to delete project')
    }
  }
}

// Create a new project with file upload
async function createProject(formData: FormData) {
  try {
    const response = await upload<Project>('/properties/create', formData)
    showSuccess('Project created successfully')
    projects.value.unshift(response)
    return response
  } catch (err) {
    showError('Failed to create project')
    throw err
  }
}

// Search projects
function searchProjects() {
  goToPage(1) // Reset to first page when searching
  fetchProjects()
}

// Watch for pagination changes
watch([currentPage, itemsPerPage], () => {
  fetchProjects()
})

// Load projects on component mount
onMounted(() => {
  fetchProjects()
})
</script>

<template>
  <div class="api-example">
    <h1>Projects Management</h1>
    
    <!-- Search and filters -->
    <div class="search-container">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search projects..."
        @keyup.enter="searchProjects"
      />
      <button @click="searchProjects" :disabled="isLoading">Search</button>
    </div>
    
    <!-- Loading and error states -->
    <div v-if="isLoading" class="loading">Loading projects...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <!-- Projects list -->
    <div v-if="!isLoading && projects.length === 0" class="empty-state">
      No projects found. Try adjusting your search criteria.
    </div>
    
    <div v-else class="projects-grid">
      <div v-for="project in projects" :key="project.id" class="project-card">
        <div class="project-image">
          <img 
            :src="project.projectImage || '/placeholder-image.jpg'" 
            :alt="project.projectTitle"
          />
        </div>
        <div class="project-details">
          <h3>{{ project.projectTitle }}</h3>
          <p class="location">{{ project.location }}</p>
          <p class="description">{{ project.description }}</p>
          <div class="project-stats">
            <div class="stat">
              <span class="label">Price:</span>
              <span class="value">{{ formatCurrency(project.pricePerToken) }}</span>
            </div>
            <div class="stat">
              <span class="label">Total Tokens:</span>
              <span class="value">{{ project.totalTokens }}</span>
            </div>
            <div class="stat" v-if="project.expectedYield">
              <span class="label">Expected Yield:</span>
              <span class="value">{{ formatPercent(project.expectedYield) }}</span>
            </div>
            <div class="stat">
              <span class="label">Created:</span>
              <span class="value">{{ formatDate(project.createdAt) }}</span>
            </div>
          </div>
          <div class="project-actions">
            <button @click="viewProject(project)" class="view-btn">View Details</button>
            <button @click="removeProject(project)" class="delete-btn">Delete</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pagination controls -->
    <div class="pagination" v-if="totalPages > 1">
      <button 
        @click="goToPage(currentPage - 1)" 
        :disabled="currentPage === 1 || isLoading"
      >
        Previous
      </button>
      
      <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
      
      <button 
        @click="goToPage(currentPage + 1)" 
        :disabled="currentPage === totalPages || isLoading"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
.api-example {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-container {
  display: flex;
  margin-bottom: 20px;
}

.search-container input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
}

.search-container button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.search-container button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading, .error, .empty-state {
  padding: 20px;
  text-align: center;
  margin: 20px 0;
  border-radius: 4px;
}

.loading {
  background-color: #f8f9fa;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
}

.empty-state {
  background-color: #f8f9fa;
  color: #6c757d;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.project-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.project-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.project-details {
  padding: 15px;
}

.project-details h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.location {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.description {
  margin-bottom: 15px;
  font-size: 0.9rem;
  color: #444;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.stat {
  font-size: 0.85rem;
}

.label {
  color: #666;
  margin-right: 5px;
}

.value {
  font-weight: 600;
  color: #333;
}

.project-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.view-btn, .delete-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.view-btn {
  background-color: #007bff;
  color: white;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
}

.pagination button {
  padding: 8px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 10px;
}

.pagination button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  color: #666;
}
</style>