<template>
  <div class="properties-list-view">
    <!-- Using SectionRenderer to render the property list section -->
    <SectionRenderer 
      section-key="property/list" 
      :data="{
        title: 'Our Properties',
        subtitle: 'Discover our selection of premium tokenized real estate properties',
        properties: properties,
        showPagination: true,
        currentPage: currentPage,
        totalPages: totalPages
      }"
      @toggle-favorite="handleToggleFavorite"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SectionRenderer from '@/components/SectionRenderer.vue';
import type { Project } from '@/modules/ProjectsConsolidated';

// State
const currentPage = ref(1);
const totalPages = ref(3); // Mock total pages

// Mock properties data
const properties = ref<Project[]>([
  {
    id: '1',
    projectTitle: 'Luxury Downtown Apartment',
    location: 'New York, NY',
    description: 'Premium apartment in the heart of Manhattan',
    tokenSymbol: 'LDA',
    totalTokens: 10000,
    pricePerToken: 250,
    expectedYield: 12.5,
    projectImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
    status: 'active',
    // Additional ProjectCard fields
    price: 2500000,
    tokenPrice: 250,
    minInvestment: 1000,
    irr: 14.2,
    apr: 12.5,
    valueGrowth: 8.3,
    tokensAvailable: 75,
    imageUrls: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop'
    ],
    tags: ['LANDSHARE', 'Apartment'],
    visitsThisWeek: 127,
    totalVisitors: 1543,
    isFavorite: false,
    country: 'USA'
  },
  {
    id: '2',
    projectTitle: 'Modern Office Building',
    location: 'San Francisco, CA',
    description: 'State-of-the-art commercial building in SOMA district',
    tokenSymbol: 'MOB',
    totalTokens: 50000,
    pricePerToken: 316,
    expectedYield: 15.8,
    projectImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    status: 'active',
    // Additional ProjectCard fields
    price: 15800000,
    tokenPrice: 316,
    minInvestment: 2500,
    irr: 'Request',
    apr: 15.8,
    valueGrowth: 12.1,
    tokensAvailable: 42,
    imageUrls: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
    ],
    tags: ['LANDSHARE', 'Commercial'],
    visitsThisWeek: 89,
    totalVisitors: 2156,
    isFavorite: true,
    country: 'USA'
  },
  {
    id: '3',
    projectTitle: 'Beachfront Villa',
    location: 'Miami, FL',
    description: 'Luxury oceanfront property with private beach access',
    tokenSymbol: 'BFV',
    totalTokens: 25000,
    pricePerToken: 328,
    expectedYield: 10.2,
    projectImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    status: 'active',
    // Additional ProjectCard fields
    price: 8200000,
    tokenPrice: 328,
    minInvestment: 1500,
    irr: 11.8,
    apr: 10.2,
    valueGrowth: 15.7,
    tokensAvailable: 88,
    imageUrls: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop'
    ],
    tags: ['LANDSHARE', 'Villa'],
    visitsThisWeek: 203,
    totalVisitors: 3421,
    isFavorite: false,
    country: 'USA'
  }
]);

// Methods
const handleToggleFavorite = (propertyId: string) => {
  // In a real application, this would call an API to toggle favorite status
  const property = properties.value.find(p => p.id === propertyId);
  if (property) {
    property.isFavorite = !property.isFavorite;
  }
};

const handlePageChange = (page: number) => {
  // In a real application, this would fetch the next page of properties
  currentPage.value = page;
  console.log(`Fetching page ${page}`);
  // Mock API call to fetch properties for the selected page
  // fetchProperties(page);
};

// In a real application, you would have a function to fetch properties from the API
// const fetchProperties = async (page: number) => {
//   try {
//     const response = await api.get(`/properties?page=${page}`);
//     properties.value = response.data.properties;
//     totalPages.value = response.data.totalPages;
//   } catch (error) {
//     console.error('Error fetching properties:', error);
//   }
// };

// Initial fetch
// onMounted(() => {
//   fetchProperties(currentPage.value);
// });
</script>

<style scoped>
.properties-list-view {
  width: 100%;
}
</style>