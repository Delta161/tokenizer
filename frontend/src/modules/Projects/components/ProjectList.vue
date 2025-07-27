<template>
  <div class="project-list-container">
    <!-- Section header when used with SectionRenderer -->
    <div v-if="props.title || props.subtitle" class="section-header text-center mb-12">
      <h2 v-if="props.title" class="text-3xl font-bold mb-4">{{ props.title }}</h2>
      <p v-if="props.subtitle" class="text-lg text-gray-600 max-w-2xl mx-auto">{{ props.subtitle }}</p>
    </div>
    <!-- Search and filters -->
    <div class="filters-container bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search input -->
        <div class="col-span-1 md:col-span-3">
          <label for="search" class="block text-sm font-medium text-gray-700">Search Projects</label>
          <input
            id="search"
            v-model="searchQuery"
            type="text"
            placeholder="Search by title, description, location..."
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <!-- Status filter -->
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            v-model="selectedStatus"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option :value="null">All Statuses</option>
            <option v-for="status in projectStatuses" :key="status" :value="status">
              {{ formatStatus(status) }}
            </option>
          </select>
        </div>

        <!-- Country filter -->
        <div>
          <label for="country" class="block text-sm font-medium text-gray-700">Country</label>
          <select
            id="country"
            v-model="selectedCountry"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option :value="null">All Countries</option>
            <option v-for="country in availableCountries" :key="country" :value="country">
              {{ country }}
            </option>
          </select>
        </div>

        <!-- City filter (only shown if country is selected) -->
        <div v-if="selectedCountry">
          <label for="city" class="block text-sm font-medium text-gray-700">City</label>
          <select
            id="city"
            v-model="selectedCity"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option :value="null">All Cities</option>
            <option v-for="city in availableCities" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
        </div>

        <!-- Price range -->
        <div class="col-span-1 md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">Price Range</label>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <input
                v-model.number="minPrice"
                type="number"
                placeholder="Min Price"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <input
                v-model.number="maxPrice"
                type="number"
                placeholder="Max Price"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <!-- Tags filter -->
        <div class="col-span-1 md:col-span-3">
          <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in availableTags"
              :key="tag"
              @click="toggleTag(tag)"
              :class="[
                'px-3 py-1 rounded-full text-sm',
                selectedTags.includes(tag)
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </div>

      <!-- Filter controls -->
      <div class="flex justify-between mt-6">
        <button
          @click="clearFilters"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Clear Filters
        </button>

        <div class="flex space-x-4">
          <!-- Sort controls -->
          <select
            v-model="sortByOption"
            class="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="createdAt">Date Added</option>
            <option value="price">Price</option>
            <option value="title">Title</option>
            <option value="expectedYield">Expected Yield</option>
          </select>

          <button
            @click="toggleSortDirection"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <span v-if="sortDirection === 'asc'">↑ Ascending</span>
            <span v-else>↓ Descending</span>
          </button>

          <!-- Toggle My Projects -->
          <button
            @click="toggleMyProjects()"
            :class="[
              'px-4 py-2 rounded-md shadow-sm text-sm font-medium',
              showMyProjects
                ? 'bg-primary-500 text-white'
                : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            ]"
          >
            {{ showMyProjects ? 'My Projects' : 'All Projects' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center my-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-6">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredProjects.length === 0" class="text-center my-12">
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
      <h3 class="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ showMyProjects ? "You don't have any projects yet." : "No projects match your search criteria." }}
      </p>
      <div class="mt-6" v-if="showMyProjects">
        <router-link
          to="/projects/create"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg
            class="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          Create a new project
        </router-link>
      </div>
    </div>

    <!-- View toggle buttons -->
    <div v-if="filteredProjects.length > 0" class="flex justify-end mb-4">
      <div class="inline-flex rounded-md shadow-sm" role="group">
        <button
          type="button"
          @click="viewMode = 'grid'"
          :class="[
            'px-4 py-2 text-sm font-medium border',
            viewMode === 'grid'
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          ]"
          class="rounded-l-md"
        >
          Grid View
        </button>
        <button
          type="button"
          @click="viewMode = 'property'"
          :class="[
            'px-4 py-2 text-sm font-medium border',
            viewMode === 'property'
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          ]"
          class="rounded-r-md"
        >
          Property View
        </button>
      </div>
    </div>

    <!-- Project grid view when not used with SectionRenderer -->
    <div v-if="viewMode === 'grid' && filteredProjects.length > 0 && !props.properties" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <property-card-section
        v-for="project in filteredProjects"
        :key="project.id"
        :property="project"
        @toggle-favorite="toggleFavorite(project.id)"
      />
    </div>

    <!-- Property list view when not used with SectionRenderer -->
    <div v-if="viewMode === 'property' && filteredProjects.length > 0 && !props.properties" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <property-card-section
        v-for="project in filteredProjects"
        :key="project.id"
        :property="project"
        @toggle-favorite="toggleFavorite(project.id)"
      />
    </div>
    
    <!-- Properties grid when used with SectionRenderer -->
    <div v-if="props.properties && props.properties.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <property-card-section
        v-for="property in props.properties"
        :key="property.id"
        :property="property"
        @toggle-favorite="emit('toggle-favorite', property.id)"
      />
    </div>

    <!-- Pagination -->
    <!-- Default pagination when not used with SectionRenderer -->
    <div v-if="filteredProjects.length > 0 && !props.properties" class="flex justify-center mt-8">
      <div class="flex space-x-2">
        <button
          @click="previousPage"
          :disabled="currentPagination.offset === 0"
          :class="[
            'px-4 py-2 border rounded-md',
            currentPagination.offset === 0
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          ]"
        >
          Previous
        </button>
        <button
          @click="nextPage"
          :disabled="!currentPagination.hasMore"
          :class="[
            'px-4 py-2 border rounded-md',
            !currentPagination.hasMore
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          ]"
        >
          Next
        </button>
      </div>
    </div>
    
    <!-- SectionRenderer pagination with page numbers -->
    <div v-if="props.properties && props.properties.length > 0 && props.showPagination" class="flex justify-center mt-8">
      <div class="flex items-center gap-4">
        <button 
          class="px-4 py-2 border border-gray-300 rounded-md" 
          :disabled="props.currentPage === 1"
          :class="props.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'"
          @click="emit('page-change', props.currentPage - 1)"
        >
          Previous
        </button>
        <div class="flex gap-2">
          <button 
            v-for="page in props.totalPages" 
            :key="page"
            class="w-10 h-10 flex items-center justify-center rounded-md"
            :class="page === props.currentPage ? 'bg-primary-500 text-white' : 'border border-gray-300 hover:bg-gray-50'"
            @click="emit('page-change', page)"
          >
            {{ page }}
          </button>
        </div>
        <button 
          class="px-4 py-2 border border-gray-300 rounded-md"
          :disabled="props.currentPage === props.totalPages"
          :class="props.currentPage === props.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'"
          @click="emit('page-change', props.currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectSearch } from '../composables/useProjectSearch'
import { ProjectStatus } from '../types/Project'
import PropertyCardSection from '@/sections/property/ProjectCard.section.vue'

// Props for compatibility with PropertyListSection.vue when used with SectionRenderer
interface Props {
  title?: string;
  subtitle?: string;
  properties?: any[];
  currentPage?: number;
  totalPages?: number;
  showPagination?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Featured Properties',
  subtitle: 'Discover our selection of premium tokenized real estate properties',
  currentPage: 1,
  totalPages: 1,
  showPagination: true
});

const emit = defineEmits<{
  'toggle-favorite': [propertyId: string];
  'page-change': [page: number];
}>();

const router = useRouter()

// View mode state (grid or property)
const viewMode = ref<'grid' | 'property'>('grid')

// Use the project search composable
const {
  // State
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
  loading,
  error,
  
  // Methods
  setSearchQuery,
  setStatus,
  setCountry,
  setCity,
  setPriceRange,
  setSortBy,
  toggleMyProjects,
  toggleTag,
  clearFilters,
  toggleFavorite,
  fetchProjectById
} = useProjectSearch()

// Project statuses for filter dropdown
const projectStatuses = Object.values(ProjectStatus)

// Format status for display
function formatStatus(status: string): string {
  return status
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^./, (str) => str.toUpperCase())
}

// Sort controls
const sortByOption = computed({
  get: () => sortBy.value,
  set: (value: string) => setSortBy(value, sortDirection.value)
})

function toggleSortDirection() {
  setSortBy(sortBy.value, sortDirection.value === 'asc' ? 'desc' : 'asc')
}

// Pagination
function nextPage() {
  if (currentPagination.value.hasMore) {
    if (showMyProjects.value) {
      currentPagination.value.offset += currentPagination.value.limit
    } else {
      currentPagination.value.offset += currentPagination.value.limit
    }
  }
}

function previousPage() {
  if (currentPagination.value.offset > 0) {
    currentPagination.value.offset = Math.max(0, currentPagination.value.offset - currentPagination.value.limit)
  }
}

// View project details
function viewProject(id: string) {
  router.push(`/projects/${id}`)
}
</script>