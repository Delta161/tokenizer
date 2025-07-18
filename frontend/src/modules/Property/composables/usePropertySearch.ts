import { ref, computed, watch } from 'vue';
import { useProperty } from './useProperty';
import type { PropertySearchParams, PropertyStatus } from '../types';

/**
 * Composable for property search functionality
 * Provides reactive search state and methods
 */
export function usePropertySearch() {
  const { 
    properties, 
    myProperties, 
    isLoading, 
    error, 
    pagination, 
    myPagination,
    fetchAllApproved, 
    fetchMyProperties 
  } = useProperty();

  // Search state
  const searchQuery = ref('');
  const selectedStatus = ref<PropertyStatus | ''>('');
  const selectedCountry = ref('');
  const minPrice = ref<string>('');
  const maxPrice = ref<string>('');
  const sortBy = ref('createdAt');
  const sortDirection = ref('desc');
  const showMyProperties = ref(false);

  // Computed properties
  const filteredProperties = computed(() => {
    const source = showMyProperties.value ? myProperties.value : properties.value;
    
    return source.filter(property => {
      // Filter by search query
      if (searchQuery.value && !(
        property.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        property.country.toLowerCase().includes(searchQuery.value.toLowerCase())
      )) {
        return false;
      }
      
      // Filter by status
      if (selectedStatus.value && property.status !== selectedStatus.value) {
        return false;
      }
      
      // Filter by country
      if (selectedCountry.value && property.country !== selectedCountry.value) {
        return false;
      }
      
      // Filter by price range
      const price = parseFloat(property.totalPrice);
      if (minPrice.value && price < parseFloat(minPrice.value)) {
        return false;
      }
      if (maxPrice.value && price > parseFloat(maxPrice.value)) {
        return false;
      }
      
      return true;
    });
  });

  const currentPagination = computed(() => {
    return showMyProperties.value ? myPagination.value : pagination.value;
  });

  const availableCountries = computed(() => {
    const source = showMyProperties.value ? myProperties.value : properties.value;
    const countries = new Set<string>();
    
    source.forEach(property => {
      if (property.country) {
        countries.add(property.country);
      }
    });
    
    return Array.from(countries).sort();
  });

  // Methods
  const search = async () => {
    const params: PropertySearchParams = {
      limit: currentPagination.value.limit,
      offset: 0 // Reset to first page
    };
    
    if (selectedStatus.value) {
      params.status = selectedStatus.value;
    }
    
    if (showMyProperties.value) {
      await fetchMyProperties(params);
    } else {
      await fetchAllApproved(params);
    }
  };

  const loadMore = async () => {
    if (!currentPagination.value.hasMore) return;
    
    const params: PropertySearchParams = {
      limit: currentPagination.value.limit,
      offset: currentPagination.value.offset + currentPagination.value.limit
    };
    
    if (selectedStatus.value) {
      params.status = selectedStatus.value;
    }
    
    if (showMyProperties.value) {
      await fetchMyProperties(params);
    } else {
      await fetchAllApproved(params);
    }
  };

  const resetFilters = () => {
    searchQuery.value = '';
    selectedStatus.value = '';
    selectedCountry.value = '';
    minPrice.value = '';
    maxPrice.value = '';
    sortBy.value = 'createdAt';
    sortDirection.value = 'desc';
  };

  const toggleMyProperties = async (value: boolean) => {
    showMyProperties.value = value;
    await search(); // Reload with the appropriate data source
  };

  // Watch for changes in filters to trigger search
  watch([selectedStatus, showMyProperties], () => {
    search();
  });

  return {
    // State
    searchQuery,
    selectedStatus,
    selectedCountry,
    minPrice,
    maxPrice,
    sortBy,
    sortDirection,
    showMyProperties,
    isLoading,
    error,
    
    // Computed
    filteredProperties,
    currentPagination,
    availableCountries,
    
    // Methods
    search,
    loadMore,
    resetFilters,
    toggleMyProperties
  };
}