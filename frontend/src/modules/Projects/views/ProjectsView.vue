<script setup lang="ts">
import { ref } from 'vue'
import { ProjectCard } from '../components'
import type { Project } from '../types/Project'

// Mock data for featured projects
const featuredProjects = ref<Project[]>([
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
])

// Handle project card events
const handleToggleFavorite = (projectId: string) => {
  const project = featuredProjects.value.find(p => p.id === projectId)
  if (project) {
    project.isFavorite = !project.isFavorite
  }
}
</script>

<template>
  <div class="projects-page">
    <!-- Header Section -->
    <section class="header-section">
      <div class="header-content">
        <h1 class="header-title">Available Projects</h1>
        <p class="header-subtitle">
          Browse our curated selection of tokenized real estate properties.
          Invest in premium real estate through blockchain technology.
        </p>
      </div>
    </section>

    <!-- Projects List -->
    <section class="projects-section">
      <div class="container">
        <div class="filters">
          <div class="search-bar">
            <input type="text" placeholder="Search projects..." />
            <button class="search-button">
              <span class="search-icon">🔍</span>
            </button>
          </div>
          <div class="filter-options">
            <select class="filter-select">
              <option value="">All Types</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
            </select>
            <select class="filter-select">
              <option value="">All Locations</option>
              <option value="usa">USA</option>
              <option value="europe">Europe</option>
              <option value="asia">Asia</option>
            </select>
            <select class="filter-select">
              <option value="">Sort By</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="yield-desc">Highest Yield</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
        
        <div class="projects-grid">
          <ProjectCard 
            v-for="project in featuredProjects" 
            :key="project.id" 
            :project="project"
            @toggle-favorite="handleToggleFavorite"
          />
        </div>
        
        <div class="pagination">
          <button class="pagination-button">Previous</button>
          <div class="pagination-numbers">
            <button class="pagination-number active">1</button>
            <button class="pagination-number">2</button>
            <button class="pagination-number">3</button>
          </div>
          <button class="pagination-button">Next</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.projects-page {
  min-height: calc(100vh - 120px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  margin-top: 1rem;
}

.header-section {
  text-align: center;
  padding: 2rem;
  color: white;
  width: 100%;
  max-width: 1200px;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.header-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
  opacity: 0.9;
  line-height: 1.6;
}

.projects-section {
  padding: 3rem 2rem;
  background: #f8fafc;
  width: 100%;
  max-width: 1200px;
  margin: 2rem 0;
  border-radius: 12px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.filters {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-bar {
  display: flex;
  width: 100%;
}

.search-bar input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px 0 0 8px;
  font-size: 1rem;
}

.search-button {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  padding: 0 1rem;
  cursor: pointer;
}

.filter-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  flex: 1;
  min-width: 150px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(384px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination-button {
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-button:hover {
  background: #e2e8f0;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
}

.pagination-number {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-number:hover {
  background: #e2e8f0;
}

.pagination-number.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

@media (max-width: 768px) {
  .projects-page {
    padding: 1rem;
  }
  
  .header-section {
    padding: 1rem;
  }
  
  .header-title {
    font-size: 2.5rem;
  }
  
  .header-subtitle {
    font-size: 1.1rem;
  }
  
  .projects-section {
    padding: 2rem 1rem;
    margin: 1rem 0;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-options {
    flex-direction: column;
  }
  
  .filter-select {
    width: 100%;
  }
}
</style>