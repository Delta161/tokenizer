<template>
  <article class="property-card">
    <!-- Left Side: Fixed Width Image -->
    <div class="property-card__image">
      <img 
        :src="displayImage" 
        :alt="property.projectTitle"
        class="image"
      />
      
      <!-- Image Navigation Arrows -->
      <button 
        v-if="property.imageUrls && property.imageUrls.length > 1"
        @click="previousImage"
        class="nav-button nav-button-left"
        aria-label="Previous image"
      >
        <ChevronLeftIcon class="nav-icon" />
      </button>
      
      <button 
        v-if="property.imageUrls && property.imageUrls.length > 1"
        @click="nextImage"
        class="nav-button nav-button-right"
        aria-label="Next image"
      >
        <ChevronRightIcon class="nav-icon" />
      </button>
      
      <!-- Tags -->
      <div class="tags-container">
        <span 
          v-for="tag in property.tags" 
          :key="tag"
          class="tag"
        >
          {{ tag }}
        </span>
      </div>
      
      <!-- Favorite Button -->
      <button 
        @click="toggleFavorite"
        class="favorite-button"
        :aria-label="property.isFavorite ? 'Remove from favorites' : 'Add to favorites'"
      >
        <HeartIcon 
          :class="['heart-icon', { 'heart-favorite': property.isFavorite }]"
        />
      </button>
    </div>
    
    <!-- Right Side: Content Section -->
    <div class="property-card__content">
      <!-- Title and Location -->
      <div class="title-section">
        <h3 class="property-title">
          {{ property.projectTitle }}
        </h3>
        <div class="location-info">
          <MapPinIcon class="location-icon" />
          <span class="location-text">{{ property.location }}{{ property.country ? `, ${property.country}` : '' }}</span>
        </div>
      </div>
      
      <!-- Pricing Grid -->
      <div class="price-grid">
        <div class="price-item">
          <div class="price-label">Property Price</div>
          <div class="price-value price-value-bold">{{ formatCurrency(property.price) }}</div>
        </div>
        <div class="price-item">
          <div class="price-label">Token Price</div>
          <div class="price-value">{{ formatCurrency(property.tokenPrice || property.pricePerToken) }}</div>
        </div>
        <div class="price-item">
          <div class="price-label">Min Investment</div>
          <div class="price-value">{{ formatCurrency(property.minInvestment) }}</div>
        </div>
        <div class="price-item">
          <div class="price-label">IRR</div>
          <div class="price-value irr-value">
            {{ property.irr === 'Request' ? 'Request' : formatPercentage(property.irr) }}
          </div>
        </div>
        <div class="price-item">
          <div class="price-label">APR</div>
          <div class="price-value">{{ formatPercentage(property.apr) }}</div>
        </div>
        <div class="price-item">
          <div class="price-label">Value Growth</div>
          <div class="price-value">{{ formatPercentage(property.valueGrowth) }}</div>
        </div>
      </div>
      
      <!-- Tokens Available -->
      <div class="tokens-section">
        <div class="tokens-header">
          <span class="tokens-label">Tokens Available</span>
          <span class="tokens-percentage">{{ formatPercentage(property.tokensAvailable) }}</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: `${property.tokensAvailable || 0}%` }"
          ></div>
        </div>
      </div>
      
      <!-- Visit Stats -->
      <div class="visit-stats">
        <div class="visit-item">
          <div class="visit-indicator"></div>
          <span class="visit-text">Visited {{ property.visitsThisWeek || 0 }} times this week</span>
        </div>
        <div class="visit-total">
          {{ property.totalVisitors || 0 }} all time visitors
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="action-buttons">
        <router-link 
          :to="`/property/${property.id}`"
          class="button button-secondary"
        >
          Details
        </router-link>
        <router-link 
          :to="`/invest/${property.id}`"
          class="button button-primary"
        >
          Buy Tokens
        </router-link>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Project } from '@/modules/ProjectsConsolidated'
import { 
  HeartIcon, 
  MapPinIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon 
} from '@heroicons/vue/24/outline'

// Props
interface Props {
  property: Project
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  toggleFavorite: [propertyId: string]
}>()

// Image carousel state
const currentImageIndex = ref(0)

// Computed properties
const displayImage = computed(() => {
  if (props.property.imageUrls && props.property.imageUrls.length > 0) {
    return props.property.imageUrls[currentImageIndex.value]
  }
  if (typeof props.property.projectImage === 'string') {
    return props.property.projectImage
  }
  return 'https://via.placeholder.com/400x300?text=Property+Image'
})

// Methods
const previousImage = () => {
  if (props.property.imageUrls && props.property.imageUrls.length > 1) {
    currentImageIndex.value = currentImageIndex.value === 0 
      ? props.property.imageUrls.length - 1 
      : currentImageIndex.value - 1
  }
}

const nextImage = () => {
  if (props.property.imageUrls && props.property.imageUrls.length > 1) {
    currentImageIndex.value = currentImageIndex.value === props.property.imageUrls.length - 1 
      ? 0 
      : currentImageIndex.value + 1
  }
}

const toggleFavorite = () => {
  if (props.property.id) {
    emit('toggleFavorite', props.property.id)
  }
}

// Utility functions
const formatCurrency = (value?: number): string => {
  if (value === undefined || value === null) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value < 10 ? 1 : 0,
    maximumFractionDigits: value < 10 ? 1 : 0
  }).format(value)
}

const formatPercentage = (value?: number | string): string => {
  if (value === undefined || value === null) return 'N/A'
  if (typeof value === 'string') return value
  return `${value.toFixed(1)}%`
}
</script>

<style scoped>
/* Main horizontal card container - strict horizontal layout */
.property-card {
  display: flex; /* Horizontal layout enforced */
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  max-width: 100%;
  margin: 0 auto;
  transition: box-shadow 0.3s ease;
  min-height: 240px;
}

.property-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Left side: Fixed width image section (260px as specified) */
.property-card__image {
  position: relative;
  width: 260px; /* Fixed width as specified */
  flex-shrink: 0; /* Prevent shrinking */
  overflow: hidden;
}

/* Image styling - full height with object-fit cover */
.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image:hover {
  transform: scale(1.05);
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.nav-button:hover {
  background: rgba(0, 0, 0, 0.7);
}

.nav-button-left {
  left: 8px;
}

.nav-button-right {
  right: 8px;
}

.nav-icon {
  width: 16px;
  height: 16px;
}

.tags-container {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  background: #2563eb;
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.favorite-button {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.favorite-button:hover {
  background: white;
}

.heart-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
  transition: color 0.3s ease;
}

.heart-favorite {
  color: #ef4444;
  fill: currentColor;
}

/* Right side: Content section - fills remaining space */
.property-card__content {
  flex: 1; /* Take all remaining space */
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.title-section {
  margin-bottom: 16px;
}

.property-title {
  font-size: 18px;
  font-weight: bold;
  color: #111827;
  margin: 0 0 4px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.location-info {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #6b7280;
}

.location-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
  flex-shrink: 0;
}

.location-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 14px;
}

.price-item {
  display: flex;
  flex-direction: column;
}

.price-label {
  color: #6b7280;
  margin-bottom: 2px;
}

.price-value {
  font-weight: 600;
  color: #111827;
}

.price-value-bold {
  font-weight: bold;
}

.irr-value {
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
}

.irr-value:hover {
  color: #1d4ed8;
}

.tokens-section {
  margin-bottom: 16px;
}

.tokens-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin-bottom: 4px;
}

.tokens-label {
  color: #6b7280;
}

.tokens-percentage {
  font-weight: 600;
  color: #111827;
}

.progress-bar {
  width: 100%;
  background: #e5e7eb;
  border-radius: 9999px;
  height: 8px;
}

.progress-fill {
  background: #10b981;
  height: 8px;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.visit-stats {
  margin-bottom: 16px;
}

.visit-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-bottom: 4px;
}

.visit-indicator {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  margin-right: 8px;
}

.visit-text {
  color: #374151;
}

.visit-total {
  font-size: 14px;
  color: #6b7280;
  margin-left: 16px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.button {
  flex: 1;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.button-secondary {
  border: 1px solid #d1d5db;
  color: #374151;
  background: white;
}

.button-secondary:hover {
  background: #f9fafb;
}

.button-primary {
  background: #2563eb;
  color: white;
}

.button-primary:hover {
  background: #1d4ed8;
}

/* Mobile responsiveness - Switch to vertical layout */
@media (max-width: 768px) {
  /* Switch main card to vertical layout on mobile */
  .property-card {
    flex-direction: column;
    max-width: 100%;
    min-height: auto;
  }
  
  /* Image section becomes full width on mobile */
  .property-card__image {
    width: 100%;
    height: 160px;
    flex-shrink: 1;
  }
  
  /* Content section adjustments for mobile */
  .property-card__content {
    justify-content: flex-start;
  }
  
  .price-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>