<template>
  <div class="property-filters">
    <div class="filter-section">
      <h3 class="filter-title">Search</h3>
      <div class="search-input">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search properties..."
          @input="applyFilters"
        />
        <button class="search-button" @click="applyFilters">
          <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="filter-section">
      <h3 class="filter-title">Location</h3>
      <select 
        v-model="selectedCountry" 
        class="filter-select"
        @change="applyFilters"
      >
        <option value="">All Countries</option>
        <option v-for="country in availableCountries" :key="country" :value="country">
          {{ country }}
        </option>
      </select>
    </div>
    
    <div class="filter-section">
      <h3 class="filter-title">Price Range</h3>
      <div class="price-range">
        <div class="price-input">
          <span class="price-label">Min:</span>
          <input 
            type="number" 
            v-model.number="minPrice" 
            placeholder="Min"
            @change="applyFilters"
          />
        </div>
        <div class="price-input">
          <span class="price-label">Max:</span>
          <input 
            type="number" 
            v-model.number="maxPrice" 
            placeholder="Max"
            @change="applyFilters"
          />
        </div>
      </div>
    </div>
    
    <div class="filter-section">
      <h3 class="filter-title">Sort By</h3>
      <select 
        v-model="sortOption" 
        class="filter-select"
        @change="applyFilters"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="priceAsc">Price: Low to High</option>
        <option value="priceDesc">Price: High to Low</option>
        <option value="irrDesc">Highest IRR</option>
        <option value="aprDesc">Highest APR</option>
      </select>
    </div>
    
    <div class="filter-section" v-if="showMyPropertiesToggle">
      <h3 class="filter-title">View</h3>
      <div class="toggle-container">
        <button 
          :class="['toggle-button', { active: !showOnlyMyProperties }]"
          @click="toggleMyProperties(false)"
        >
          All Properties
        </button>
        <button 
          :class="['toggle-button', { active: showOnlyMyProperties }]"
          @click="toggleMyProperties(true)"
        >
          My Properties
        </button>
      </div>
    </div>
    
    <div class="filter-section">
      <button class="reset-button" @click="resetFilters">
        Reset Filters
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { usePropertySearch } from '../composables/usePropertySearch';
import { useAuth } from '@/modules/Auth/composables/useAuth';

const props = defineProps<{
  showMyPropertiesToggle?: boolean;
}>();

// Composables
const { isAuthenticated } = useAuth();
const { 
  searchQuery: storeSearchQuery,
  selectedCountry: storeSelectedCountry,
  minPrice: storeMinPrice,
  maxPrice: storeMaxPrice,
  sortOption: storeSortOption,
  showOnlyMyProperties: storeShowOnlyMyProperties,
  availableCountries,
  applyFilters: storeApplyFilters,
  resetFilters: storeResetFilters,
  toggleMyProperties: storeToggleMyProperties
} = usePropertySearch();

// Local state that syncs with store
const searchQuery = ref(storeSearchQuery.value);
const selectedCountry = ref(storeSelectedCountry.value);
const minPrice = ref(storeMinPrice.value);
const maxPrice = ref(storeMaxPrice.value);
const sortOption = ref(storeSortOption.value);
const showOnlyMyProperties = computed(() => storeShowOnlyMyProperties.value);

// Methods
function applyFilters() {
  // Update store values
  storeSearchQuery.value = searchQuery.value;
  storeSelectedCountry.value = selectedCountry.value;
  storeMinPrice.value = minPrice.value;
  storeMaxPrice.value = maxPrice.value;
  storeSortOption.value = sortOption.value;
  
  // Apply filters in store
  storeApplyFilters();
}

function resetFilters() {
  storeResetFilters();
  
  // Update local refs
  searchQuery.value = storeSearchQuery.value;
  selectedCountry.value = storeSelectedCountry.value;
  minPrice.value = storeMinPrice.value;
  maxPrice.value = storeMaxPrice.value;
  sortOption.value = storeSortOption.value;
}

function toggleMyProperties(value: boolean) {
  storeToggleMyProperties(value);
}

// Watch for store changes to update local state
watch(storeSearchQuery, (newVal) => {
  searchQuery.value = newVal;
});

watch(storeSelectedCountry, (newVal) => {
  selectedCountry.value = newVal;
});

watch(storeMinPrice, (newVal) => {
  minPrice.value = newVal;
});

watch(storeMaxPrice, (newVal) => {
  maxPrice.value = newVal;
});

watch(storeSortOption, (newVal) => {
  sortOption.value = newVal;
});
</script>

<style scoped>
.property-filters {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-section {
  margin-bottom: 1.5rem;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.search-input {
  position: relative;
}

input[type="text"],
input[type="number"],
select {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1F2937;
  background-color: #F9FAFB;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input[type="text"]:focus,
input[type="number"]:focus,
select:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.search-button {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
}

.search-icon {
  width: 18px;
  height: 18px;
  color: #6B7280;
}

.filter-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  padding-right: 2rem;
}

.price-range {
  display: flex;
  gap: 0.75rem;
}

.price-input {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 0.75rem;
  color: #6B7280;
  margin-bottom: 0.25rem;
}

.toggle-container {
  display: flex;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  overflow: hidden;
}

.toggle-button {
  flex: 1;
  padding: 0.5rem;
  background-color: #F9FAFB;
  border: none;
  font-size: 0.875rem;
  color: #6B7280;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.toggle-button.active {
  background-color: #3B82F6;
  color: white;
}

.reset-button {
  width: 100%;
  padding: 0.625rem;
  background-color: #F3F4F6;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4B5563;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-button:hover {
  background-color: #E5E7EB;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .price-range {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>