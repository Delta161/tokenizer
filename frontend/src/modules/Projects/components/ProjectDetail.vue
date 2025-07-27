<template>
  <div class="project-detail">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center my-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-6">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <!-- Project not found -->
    <div v-else-if="!project" class="text-center my-12">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Project not found</h3>
      <p class="mt-1 text-sm text-gray-500">The project you're looking for doesn't exist or has been removed.</p>
      <div class="mt-6">
        <router-link
          to="/projects"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Back to Projects
        </router-link>
      </div>
    </div>

    <!-- Project details -->
    <div v-else>
      <!-- Back button and actions -->
      <div class="flex justify-between items-center mb-6">
        <router-link
          to="/projects"
          class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg class="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Back to Projects
        </router-link>

        <div class="flex space-x-3">
          <!-- Favorite button -->
          <button
            @click="toggleFavorite(project.id)"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            :class="project.isFavorite ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100' : 'text-gray-700 bg-white hover:bg-gray-50'"
          >
            <svg class="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
            </svg>
            {{ project.isFavorite ? 'Favorited' : 'Add to Favorites' }}
          </button>

          <!-- Edit button (only for owner) -->
          <router-link
            v-if="canEdit"
            :to="`/projects/${project.id}/edit`"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg class="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Project
          </router-link>

          <!-- Delete button (only for owner) -->
          <button
            v-if="canEdit"
            @click="confirmDelete"
            class="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg class="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            Delete Project
          </button>
        </div>
      </div>

      <!-- Project header -->
      <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div class="relative">
          <!-- Project image -->
          <div class="h-64 sm:h-80 w-full overflow-hidden">
            <img
              :src="project.projectImage || project.imageUrls?.[0] || '/images/placeholder-property.jpg'"
              :alt="project.title || project.projectTitle"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Status badge -->
          <div
            class="absolute top-4 left-4 px-3 py-1 rounded-md text-sm font-medium"
            :class="statusClass"
          >
            {{ formatStatus(project.status) }}
          </div>
        </div>

        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-2xl font-bold text-gray-900">
            {{ project.title || project.projectTitle }}
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ locationDisplay }}
          </p>
        </div>

        <!-- Project details grid -->
        <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl class="sm:divide-y sm:divide-gray-200">
            <!-- Price information -->
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Price</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ priceDisplay }}
              </dd>
            </div>

            <!-- Token information -->
            <div v-if="project.tokenSymbol" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Token Symbol</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ project.tokenSymbol }}
              </dd>
            </div>

            <div v-if="project.totalTokens" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Total Tokens</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ project.totalTokens }}
              </dd>
            </div>

            <div v-if="project.pricePerToken" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Price Per Token</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ formatCurrency(project.pricePerToken) }}
              </dd>
            </div>

            <!-- Expected returns -->
            <div v-if="project.expectedYield || project.apr" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Expected Yield</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ project.expectedYield || project.apr }}%
              </dd>
            </div>

            <div v-if="project.irr" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">IRR</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ project.irr }}%
              </dd>
            </div>

            <div v-if="project.valueGrowth" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Value Growth</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ project.valueGrowth }}%
              </dd>
            </div>

            <!-- Tags -->
            <div v-if="hasTags" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Tags</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in projectTags"
                    :key="tag"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-primary-100 text-primary-800"
                  >
                    {{ tag }}
                  </span>
                </div>
              </dd>
            </div>

            <!-- Created/Updated dates -->
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Created</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ formatDate(project.createdAt) }}
              </dd>
            </div>

            <div v-if="project.updatedAt" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ formatDate(project.updatedAt) }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Project description -->
      <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Description</h3>
        </div>
        <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
          <p class="text-gray-700 whitespace-pre-line">{{ project.description }}</p>
        </div>
      </div>

      <!-- Additional images if available -->
      <div v-if="hasMultipleImages" class="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Gallery</h3>
        </div>
        <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div
              v-for="(imageUrl, index) in project.imageUrls"
              :key="index"
              class="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg"
            >
              <img :src="imageUrl" :alt="`${project.title || project.projectTitle} - Image ${index + 1}`" class="object-cover" />
            </div>
          </div>
        </div>
      </div>

      <!-- Delete confirmation modal -->
      <div v-if="showDeleteModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <!-- Background overlay -->
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

          <!-- Modal panel -->
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Delete Project</h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Are you sure you want to delete this project? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                @click="deleteProject"
                type="button"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Delete
              </button>
              <button
                @click="showDeleteModal = false"
                type="button"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '@/modules/Accounts'
import { ProjectStatus } from '../types/Project'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const authStore = useAuthStore()

// State
const showDeleteModal = ref(false)

// Get project ID from route params
const projectId = computed(() => route.params.id as string)

// Fetch project data
onMounted(async () => {
  if (projectId.value) {
    try {
      await projectStore.fetchProjectById(projectId.value)
    } catch (error) {
      console.error('Error fetching project:', error)
    }
  }
})

// Computed properties
const project = computed(() => projectStore.currentProject)
const loading = computed(() => projectStore.loading)
const error = computed(() => projectStore.error)

// Check if current user can edit this project
const canEdit = computed(() => {
  if (!project.value || !authStore.user) return false
  
  // Check if user is the owner of the project
  // This logic may need to be adjusted based on your actual data structure
  return project.value.ownerId === authStore.user.id || authStore.user.role === 'admin'
})

// Format status for display
function formatStatus(status: string): string {
  return status
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^./, (str) => str.toUpperCase())
}

// Format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Format date
function formatDate(dateString: string): string {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// Status class
const statusClass = computed(() => {
  if (!project.value) return 'bg-gray-100 text-gray-800'
  
  switch (project.value.status) {
    case ProjectStatus.APPROVED:
    case ProjectStatus.ACTIVE:
      return 'bg-green-100 text-green-800'
    case ProjectStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800'
    case ProjectStatus.REJECTED:
      return 'bg-red-100 text-red-800'
    case ProjectStatus.COMPLETED:
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})

const locationDisplay = computed(() => {
  if (!project.value) return 'Location not specified'
  
  const city = project.value.city
  const country = project.value.country
  const location = project.value.location
  
  if (city && country) return `${city}, ${country}`
  if (city) return city
  if (country) return country
  if (location) return location
  return 'Location not specified'
})

const priceDisplay = computed(() => {
  if (!project.value) return 'Price not available'
  
  if (typeof project.value.price === 'number') {
    return formatCurrency(project.value.price)
  }
  if (typeof project.value.pricePerToken === 'number' && typeof project.value.totalTokens === 'number') {
    return formatCurrency(project.value.pricePerToken * project.value.totalTokens)
  }
  return 'Price on request'
})

const projectTags = computed(() => {
  if (!project.value) return []
  
  if (project.value.tags && Array.isArray(project.value.tags)) {
    return project.value.tags
  }
  if (project.value.tag) {
    return [project.value.tag]
  }
  return []
})

const hasTags = computed(() => projectTags.value.length > 0)

const hasMultipleImages = computed(() => {
  return project.value?.imageUrls && Array.isArray(project.value.imageUrls) && project.value.imageUrls.length > 0
})

// Methods
async function toggleFavorite(id: string) {
  try {
    await projectStore.toggleFavorite(id)
  } catch (error) {
    console.error('Error toggling favorite status:', error)
  }
}

function confirmDelete() {
  showDeleteModal.value = true
}

async function deleteProject() {
  if (!project.value) return
  
  try {
    await projectStore.deleteProject(project.value.id)
    showDeleteModal.value = false
    router.push('/projects')
  } catch (error) {
    console.error('Error deleting project:', error)
  }
}
</script>