<template>
  <div class="project-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <!-- Project image -->
    <div class="relative h-48 overflow-hidden">
      <img
        :src="project.projectImage || project.imageUrls?.[0] || '/images/placeholder-property.jpg'"
        :alt="project.title || project.projectTitle"
        class="w-full h-full object-cover"
      />
      
      <!-- Status badge -->
      <div
        class="absolute top-4 left-4 px-2 py-1 rounded-md text-xs font-medium"
        :class="statusClass"
      >
        {{ formatStatus(project.status) }}
      </div>
      
      <!-- Favorite button -->
      <button
        @click.stop="$emit('favorite')"
        class="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-colors duration-200"
        :aria-label="project.isFavorite ? 'Remove from favorites' : 'Add to favorites'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          :class="project.isFavorite ? 'text-red-500' : 'text-gray-400'"
          fill="currentColor"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
    </div>
    
    <!-- Project content -->
    <div class="p-4">
      <!-- Title and location -->
      <div class="mb-3">
        <h3 class="text-lg font-semibold text-gray-900 truncate">
          {{ project.title || project.projectTitle }}
        </h3>
        <p class="text-sm text-gray-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {{ locationDisplay }}
        </p>
      </div>
      
      <!-- Price and token info -->
      <div class="mb-3">
        <div class="flex justify-between items-baseline">
          <p class="text-xl font-bold text-primary-600">
            {{ priceDisplay }}
          </p>
          <p v-if="project.tokenSymbol" class="text-sm font-medium text-gray-700">
            {{ project.tokenSymbol }}
          </p>
        </div>
        <p v-if="project.pricePerToken" class="text-sm text-gray-600">
          {{ formatCurrency(project.pricePerToken) }} per token
        </p>
      </div>
      
      <!-- Project stats -->
      <div class="grid grid-cols-2 gap-2 mb-3">
        <div v-if="project.expectedYield || project.apr" class="text-sm">
          <span class="text-gray-500">Expected Yield:</span>
          <span class="font-medium text-gray-900">
            {{ project.expectedYield || project.apr }}%
          </span>
        </div>
        <div v-if="project.irr" class="text-sm">
          <span class="text-gray-500">IRR:</span>
          <span class="font-medium text-gray-900">{{ project.irr }}%</span>
        </div>
        <div v-if="project.totalTokens" class="text-sm">
          <span class="text-gray-500">Total Tokens:</span>
          <span class="font-medium text-gray-900">{{ project.totalTokens }}</span>
        </div>
        <div v-if="project.tokensAvailable" class="text-sm">
          <span class="text-gray-500">Available:</span>
          <span class="font-medium text-gray-900">{{ project.tokensAvailable }}</span>
        </div>
      </div>
      
      <!-- Tags -->
      <div v-if="hasTags" class="flex flex-wrap gap-1 mb-3">
        <span
          v-for="tag in projectTags"
          :key="tag"
          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
        >
          {{ tag }}
        </span>
      </div>
      
      <!-- View button -->
      <button
        @click="$emit('view')"
        class="w-full mt-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        View Details
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '../types/Project'
import { ProjectStatus } from '../types/Project'

const props = defineProps<{
  project: Project
}>()

const emit = defineEmits<{
  (e: 'favorite'): void
  (e: 'view'): void
}>()

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

// Computed properties
const statusClass = computed(() => {
  switch (props.project.status) {
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
  const city = props.project.city
  const country = props.project.country
  const location = props.project.location
  
  if (city && country) return `${city}, ${country}`
  if (city) return city
  if (country) return country
  if (location) return location
  return 'Location not specified'
})

const priceDisplay = computed(() => {
  if (typeof props.project.price === 'number') {
    return formatCurrency(props.project.price)
  }
  if (typeof props.project.pricePerToken === 'number' && typeof props.project.totalTokens === 'number') {
    return formatCurrency(props.project.pricePerToken * props.project.totalTokens)
  }
  return 'Price on request'
})

const projectTags = computed(() => {
  if (props.project.tags && Array.isArray(props.project.tags)) {
    return props.project.tags
  }
  if (props.project.tag) {
    return [props.project.tag]
  }
  return []
})

const hasTags = computed(() => projectTags.value.length > 0)
</script>