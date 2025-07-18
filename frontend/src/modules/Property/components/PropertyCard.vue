<template>
  <article class="property-card">
    <!-- Left Side: Fixed Width Image -->
    <div class="property-card__image">
      <img 
        :src="displayImage" 
        :alt="property.title"
        class="image"
      />
      
      <!-- Image Navigation Arrows -->
      <button 
        v-if="property.imageUrls && property.imageUrls.length > 1"
        @click="previousImage"
        class="nav-button nav-button-left"
        aria-label="Previous image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <button 
        v-if="property.imageUrls && property.imageUrls.length > 1"
        @click="nextImage"
        class="nav-button nav-button-right"
        aria-label="Next image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
      
      <!-- Status Badge -->
      <div class="status-badge" :class="statusClass">
        {{ property.status }}
      </div>
      
      <!-- Favorite Button -->
      <button 
        @click="toggleFavorite"
        class="favorite-button"
        :aria-label="property.isFavorite ? 'Remove from favorites' : 'Add to favorites'"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          :class="['heart-icon', { 'heart-favorite': property.isFavorite }]"
          viewBox="0 0 24 24" 
          fill="currentColor" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
    </div>
    
    <!-- Right Side: Content -->
    <div class="property-card__content">
      <div class="property-card__header">
        <h3 class="property-title">{{ property.title }}</h3>
        <p class="property-location">
          <svg xmlns="http://www.w3.org/2000/svg" class="location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {{ property.city }}, {{ property.country }}
        </p>
      </div>
      
      <p class="property-description">{{ truncatedDescription }}</p>
      
      <div class="property-card__pricing-grid">
        <div class="pricing-item">
          <span class="pricing-label">Property Price</span>
          <span class="pricing-value">${{ formatPrice(property.totalPrice) }}</span>
        </div>
        
        <div class="pricing-item">
          <span class="pricing-label">Token Price</span>
          <span class="pricing-value">${{ formatPrice(property.tokenPrice) }}</span>
        </div>
        
        <div class="pricing-item">
          <span class="pricing-label">Min Investment</span>
          <span class="pricing-value">${{ formatPrice(property.minInvestment) }}</span>
        </div>
        
        <div class="pricing-item">
          <span class="pricing-label">IRR</span>
          <span class="pricing-value">{{ property.irr }}%</span>
        </div>
        
        <div class="pricing-item">
          <span class="pricing-label">APR</span>
          <span class="pricing-value">{{ property.apr }}%</span>
        </div>
        
        <div class="pricing-item">
          <span class="pricing-label">Value Growth</span>
          <span class="pricing-value">{{ property.valueGrowth }}%</span>
        </div>
      </div>
      
      <div class="property-card__footer">
        <div class="tokens-available">
          <span class="tokens-label">Tokens Available:</span>
          <span class="tokens-value">{{ property.tokensAvailablePercent }}%</span>
          <div class="tokens-progress">
            <div 
              class="tokens-progress-bar" 
              :style="{ width: `${property.tokensAvailablePercent}%` }"
            ></div>
          </div>
        </div>
        
        <div class="property-card__actions">
          <router-link 
            :to="{ name: 'property-detail', params: { id: property.id } }"
            class="view-details-button"
          >
            View Details
          </router-link>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProperty } from '../composables/useProperty';
import type { Property } from '../types';

const props = defineProps<{
  property: Property;
}>();

const emit = defineEmits<{
  (e: 'toggleFavorite', id: string): void;
}>();

// State
const currentImageIndex = ref(0);

// Composables
const { toggleFavorite: toggleFavoriteStore } = useProperty();

// Computed
const displayImage = computed(() => {
  if (!props.property.imageUrls || props.property.imageUrls.length === 0) {
    return 'https://via.placeholder.com/400x300?text=No+Image';
  }
  return props.property.imageUrls[currentImageIndex.value];
});

const truncatedDescription = computed(() => {
  if (props.property.description.length > 120) {
    return props.property.description.substring(0, 120) + '...';
  }
  return props.property.description;
});

const statusClass = computed(() => {
  switch (props.property.status) {
    case 'APPROVED':
      return 'status-approved';
    case 'PENDING':
      return 'status-pending';
    case 'REJECTED':
      return 'status-rejected';
    case 'DRAFT':
      return 'status-draft';
    default:
      return '';
  }
});

// Methods
function nextImage() {
  if (!props.property.imageUrls || props.property.imageUrls.length <= 1) return;
  currentImageIndex.value = (currentImageIndex.value + 1) % props.property.imageUrls.length;
}

function previousImage() {
  if (!props.property.imageUrls || props.property.imageUrls.length <= 1) return;
  currentImageIndex.value = (currentImageIndex.value - 1 + props.property.imageUrls.length) % props.property.imageUrls.length;
}

function toggleFavorite() {
  toggleFavoriteStore(props.property.id);
  emit('toggleFavorite', props.property.id);
}

function formatPrice(price: string | undefined): string {
  if (!price) return '0';
  const num = parseFloat(price);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

// Initialize
onMounted(() => {
  // Set initial image index if property already has one
  if (props.property.currentImageIndex !== undefined) {
    currentImageIndex.value = props.property.currentImageIndex;
  }
});
</script>

<style scoped>
.property-card {
  display: flex;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background-color: white;
  margin-bottom: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.property-card__image {
  position: relative;
  width: 300px;
  min-width: 300px;
  height: 300px;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-button:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

.nav-button-left {
  left: 10px;
}

.nav-button-right {
  right: 10px;
}

.nav-icon {
  width: 20px;
  height: 20px;
  color: #333;
}

.status-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-approved {
  background-color: #10B981;
  color: white;
}

.status-pending {
  background-color: #F59E0B;
  color: white;
}

.status-rejected {
  background-color: #EF4444;
  color: white;
}

.status-draft {
  background-color: #6B7280;
  color: white;
}

.favorite-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.favorite-button:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

.heart-icon {
  width: 20px;
  height: 20px;
  color: #9CA3AF;
  transition: color 0.2s;
}

.heart-favorite {
  color: #EF4444;
}

.property-card__content {
  flex: 1;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
}

.property-card__header {
  margin-bottom: 0.75rem;
}

.property-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.property-location {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.location-icon {
  width: 16px;
  height: 16px;
  margin-right: 0.25rem;
}

.property-description {
  font-size: 0.875rem;
  color: #4B5563;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.property-card__pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.pricing-item {
  display: flex;
  flex-direction: column;
}

.pricing-label {
  font-size: 0.75rem;
  color: #6B7280;
  margin-bottom: 0.25rem;
}

.pricing-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.property-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tokens-available {
  flex: 1;
}

.tokens-label {
  font-size: 0.75rem;
  color: #6B7280;
  margin-right: 0.5rem;
}

.tokens-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.tokens-progress {
  height: 6px;
  background-color: #E5E7EB;
  border-radius: 3px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.tokens-progress-bar {
  height: 100%;
  background-color: #3B82F6;
  border-radius: 3px;
}

.property-card__actions {
  margin-left: 1rem;
}

.view-details-button {
  display: inline-block;
  background-color: #3B82F6;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-decoration: none;
  transition: background-color 0.2s;
}

.view-details-button:hover {
  background-color: #2563EB;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .property-card {
    flex-direction: column;
  }
  
  .property-card__image {
    width: 100%;
    height: 200px;
  }
  
  .property-card__pricing-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>