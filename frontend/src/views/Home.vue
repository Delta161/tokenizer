<script setup lang="ts">
import { ref } from 'vue'
import PropertyCardSection from '@/sections/property/ProjectCard.section.vue'
import type { Project } from '@/types/Project'

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
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Real Estate Tokenization Platform</h1>
        <p class="hero-subtitle">
          Invest in premium real estate through blockchain technology.
          Own fractions of properties with complete transparency and liquidity.
        </p>
        <div class="hero-buttons">
          <button class="btn btn-primary">Explore Properties</button>
          <button class="btn btn-secondary">View Dashboard</button>
        </div>
      </div>
    </section>

    <!-- Featured Projects -->
    <section class="featured-projects">
      <div class="container">
        <h2>Featured Projects</h2>
        <div class="projects-grid">
          <PropertyCardSection 
            v-for="project in featuredProjects" 
            :key="project.id" 
            :property="project"
            @toggle-favorite="handleToggleFavorite"
          />
        </div>
      </div>
    </section>

    <!-- Platform Stats -->
    <section class="stats">
      <div class="container">
        <h2>Platform Statistics</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <h3>$2.4M</h3>
            <p>Total Value Locked</p>
          </div>
          <div class="stat-item">
            <h3>156</h3>
            <p>Properties Tokenized</p>
          </div>
          <div class="stat-item">
            <h3>3,247</h3>
            <p>Active Investors</p>
          </div>
          <div class="stat-item">
            <h3>12.5%</h3>
            <p>Average Annual Return</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  min-height: calc(100vh - 120px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  margin-top: 1rem;
}

.hero {
  text-align: center;
  padding: 2rem;
  color: white;
  width: 100%;
  max-width: 1200px;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-content h1 {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-content p {
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #fff;
  color: #667eea;
}

.btn-primary:hover {
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: transparent;
  color: #fff;
  border: 2px solid #fff;
}

.btn-secondary:hover {
  background: #fff;
  color: #667eea;
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border-color: #667eea;
  font-size: 0.9rem;
  padding: 8px 16px;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.featured-projects {
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

.featured-projects h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  color: #1e293b;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(384px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.stats {
  padding: 3rem 2rem;
  background: #1e293b;
  color: white;
  width: 100%;
  max-width: 1200px;
  border-radius: 12px;
}

.stats h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.stat-item {
  text-align: center;
}

.stat-item h3 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-item p {
  font-size: 1rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }
  
  .hero {
    padding: 1rem;
  }
  
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .hero-content p {
    font-size: 1.1rem;
  }
  
  .btn {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
  
  .featured-projects,
  .stats {
    padding: 2rem 1rem;
    margin: 1rem 0;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-item h3 {
    font-size: 2rem;
  }
}
</style>
