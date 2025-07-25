<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Project } from '../types/Project'

// Router setup
const route = useRoute()
const router = useRouter()
const projectId = computed(() => route.params.id as string)

// Project data state
const project = ref<Project | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Mock data for demonstration
const mockProject: Project = {
  id: '1',
  projectTitle: 'Luxury Downtown Apartment',
  location: 'New York, NY',
  description: 'Premium apartment in the heart of Manhattan with stunning views of the city skyline. This property features high-end finishes, smart home technology, and exclusive amenities including a rooftop pool, fitness center, and 24/7 concierge service. Located in a prime location with easy access to restaurants, shopping, and public transportation.',
  tokenSymbol: 'LDA',
  totalTokens: 10000,
  pricePerToken: 250,
  expectedYield: 12.5,
  projectImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
  status: 'active',
  price: 2500000,
  tokenPrice: 250,
  minInvestment: 1000,
  irr: 14.2,
  apr: 12.5,
  valueGrowth: 8.3,
  tokensAvailable: 75,
  imageUrls: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800&h=600&fit=crop'
  ],
  tags: ['LANDSHARE', 'Apartment'],
  visitsThisWeek: 127,
  totalVisitors: 1543,
  isFavorite: false,
  country: 'USA',
  createdAt: '2023-05-15T10:30:00Z',
  updatedAt: '2023-06-20T14:45:00Z'
}

// Fetch project data
const fetchProject = async () => {
  loading.value = true
  error.value = null
  
  try {
    // In a real app, this would be an API call
    // const response = await api.getProject(projectId.value)
    // project.value = response.data
    
    // For demo, use mock data
    await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
    project.value = mockProject
  } catch (err) {
    console.error('Error fetching project:', err)
    error.value = 'Failed to load project details. Please try again.'
  } finally {
    loading.value = false
  }
}

// Format currency
const formatCurrency = (value?: number) => {
  if (value === undefined) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value)
}

// Format percentage
const formatPercentage = (value?: number | string) => {
  if (value === undefined) return 'N/A'
  if (typeof value === 'string') return value
  return `${value.toFixed(1)}%`
}

// Handle favorite toggle
const toggleFavorite = () => {
  if (project.value) {
    project.value.isFavorite = !project.value.isFavorite
    // In a real app, you would call an API to update the favorite status
  }
}

// Current image index for gallery
const currentImageIndex = ref(0)

// Navigate through images
const nextImage = () => {
  if (project.value?.imageUrls) {
    currentImageIndex.value = (currentImageIndex.value + 1) % project.value.imageUrls.length
  }
}

const previousImage = () => {
  if (project.value?.imageUrls) {
    currentImageIndex.value = (currentImageIndex.value - 1 + (project.value.imageUrls.length || 0)) % (project.value.imageUrls.length || 1)
  }
}

// Current image URL
const currentImage = computed(() => {
  if (!project.value?.imageUrls?.length) return ''
  return project.value.imageUrls[currentImageIndex.value]
})

// Load data on component mount
onMounted(() => {
  fetchProject()
})
</script>

<template>
  <div class="project-detail">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading project details...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="fetchProject" class="retry-button">Try Again</button>
      <button @click="router.push('/projects')" class="back-button">Back to Projects</button>
    </div>
    
    <!-- Project Details -->
    <div v-else-if="project" class="project-content">
      <!-- Back Button -->
      <div class="back-link">
        <button @click="router.push('/projects')" class="back-button">
          ← Back to Projects
        </button>
      </div>
      
      <!-- Project Header -->
      <div class="project-header">
        <h1 class="project-title">{{ project.projectTitle }}</h1>
        <div class="project-location">
          <span class="location-icon">📍</span>
          <span>{{ project.location }}{{ project.country ? `, ${project.country}` : '' }}</span>
        </div>
        <div class="project-tags">
          <span 
            v-for="tag in project.tags" 
            :key="tag"
            class="tag"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      
      <!-- Project Gallery -->
      <div class="project-gallery">
        <div class="main-image-container">
          <img 
            :src="currentImage" 
            :alt="project.projectTitle"
            class="main-image"
          />
          
          <!-- Image Navigation -->
          <button 
            v-if="project.imageUrls && project.imageUrls.length > 1"
            @click="previousImage"
            class="gallery-nav gallery-nav-left"
            aria-label="Previous image"
          >
            ←
          </button>
          
          <button 
            v-if="project.imageUrls && project.imageUrls.length > 1"
            @click="nextImage"
            class="gallery-nav gallery-nav-right"
            aria-label="Next image"
          >
            →
          </button>
          
          <!-- Favorite Button -->
          <button 
            @click="toggleFavorite"
            class="favorite-button"
            :aria-label="project.isFavorite ? 'Remove from favorites' : 'Add to favorites'"
          >
            <span class="heart-icon" :class="{ 'heart-favorite': project.isFavorite }">
              ♥
            </span>
          </button>
        </div>
        
        <!-- Thumbnail Navigation -->
        <div v-if="project.imageUrls && project.imageUrls.length > 1" class="thumbnails">
          <button 
            v-for="(img, index) in project.imageUrls" 
            :key="index"
            @click="currentImageIndex = index"
            class="thumbnail-button"
            :class="{ 'active': currentImageIndex === index }"
          >
            <img :src="img" :alt="`Thumbnail ${index + 1}`" class="thumbnail-image" />
          </button>
        </div>
      </div>
      
      <!-- Project Details Grid -->
      <div class="details-grid">
        <!-- Left Column: Description and Features -->
        <div class="details-column">
          <section class="detail-section">
            <h2 class="section-title">Description</h2>
            <p class="description-text">{{ project.description }}</p>
          </section>
          
          <section class="detail-section">
            <h2 class="section-title">Property Features</h2>
            <ul class="features-list">
              <li>Prime location in downtown area</li>
              <li>Recently renovated with modern finishes</li>
              <li>Energy-efficient appliances and systems</li>
              <li>24/7 security and concierge services</li>
              <li>Rooftop amenities including pool and lounge</li>
              <li>Close proximity to public transportation</li>
            </ul>
          </section>
        </div>
        
        <!-- Right Column: Investment Details -->
        <div class="details-column">
          <section class="detail-section investment-card">
            <h2 class="section-title">Investment Details</h2>
            
            <div class="investment-grid">
              <div class="investment-item">
                <div class="item-label">Property Value</div>
                <div class="item-value">{{ formatCurrency(project.price) }}</div>
              </div>
              
              <div class="investment-item">
                <div class="item-label">Token Symbol</div>
                <div class="item-value token-symbol">{{ project.tokenSymbol }}</div>
              </div>
              
              <div class="investment-item">
                <div class="item-label">Total Tokens</div>
                <div class="item-value">{{ project.totalTokens?.toLocaleString() }}</div>
              </div>
              
              <div class="investment-item">
                <div class="item-label">Token Price</div>
                <div class="item-value">{{ formatCurrency(project.tokenPrice || project.pricePerToken) }}</div>
              </div>
              
              <div class="investment-item">
                <div class="item-label">Minimum Investment</div>
                <div class="item-value">{{ formatCurrency(project.minInvestment) }}</div>
              </div>
              
              <div class="investment-item">
                <div class="item-label">Expected Annual Yield</div>
                <div class="item-value yield-value">{{ formatPercentage(project.expectedYield) }}</div>
              </div>
              
              <div class="investment-item">
                <div class="item-label">IRR (5-year)</div>
                <div class="item-value">{{ formatPercentage(project.irr) }}</div>
              </div>
              
              <div class="investment-item">
                <div class="item-label">Projected Value Growth</div>
                <div class="item-value">{{ formatPercentage(project.valueGrowth) }}</div>
              </div>
            </div>
            
            <!-- Tokens Available Progress -->
            <div class="tokens-available">
              <div class="tokens-header">
                <span class="tokens-label">Tokens Available</span>
                <span class="tokens-percentage">{{ formatPercentage(project.tokensAvailable) }}</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: `${project.tokensAvailable || 0}%` }"
                ></div>
              </div>
            </div>
            
            <!-- Investment Action -->
            <div class="investment-action">
              <button class="invest-button">Buy Tokens</button>
            </div>
          </section>
          
          <!-- Project Status -->
          <section class="detail-section status-card">
            <h2 class="section-title">Project Status</h2>
            
            <div class="status-item">
              <div class="status-label">Current Status</div>
              <div class="status-value status-badge">{{ project.status?.toUpperCase() }}</div>
            </div>
            
            <div class="status-item">
              <div class="status-label">Listed Date</div>
              <div class="status-value">{{ new Date(project.createdAt || '').toLocaleDateString() }}</div>
            </div>
            
            <div class="status-item">
              <div class="status-label">Last Updated</div>
              <div class="status-value">{{ new Date(project.updatedAt || '').toLocaleDateString() }}</div>
            </div>
            
            <div class="status-item">
              <div class="status-label">Popularity</div>
              <div class="status-value">
                <span class="visitor-count">{{ project.visitsThisWeek }} visits this week</span>
                <span class="total-visitors">{{ project.totalVisitors }} all time</span>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <!-- Related Projects (placeholder) -->
      <section class="related-projects">
        <h2 class="section-title">Similar Projects You May Like</h2>
        <p class="placeholder-text">Related projects would be displayed here</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.project-detail {
  min-height: calc(100vh - 120px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  margin-top: 1rem;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  padding: 3rem;
  margin: 2rem 0;
  width: 100%;
  max-width: 800px;
  text-align: center;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-button, .back-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.retry-button {
  background: #667eea;
  color: white;
  border: none;
  margin-right: 1rem;
}

.retry-button:hover {
  background: #5a67d8;
  transform: translateY(-2px);
}

.back-button {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.back-button:hover {
  background: #667eea;
  color: white;
}

.project-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 1200px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.back-link {
  padding: 1rem 2rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.project-header {
  padding: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.project-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.project-location {
  display: flex;
  align-items: center;
  color: #64748b;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.location-icon {
  margin-right: 0.5rem;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #e0e7ff;
  color: #4f46e5;
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
}

.project-gallery {
  padding: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.main-image-container {
  position: relative;
  width: 100%;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.gallery-nav:hover {
  background: rgba(0, 0, 0, 0.7);
}

.gallery-nav-left {
  left: 1rem;
}

.gallery-nav-right {
  right: 1rem;
}

.favorite-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.favorite-button:hover {
  background: white;
  transform: scale(1.1);
}

.heart-icon {
  color: #9ca3af;
  transition: color 0.3s ease;
}

.heart-favorite {
  color: #ef4444;
}

.thumbnails {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.thumbnail-button {
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.thumbnail-button.active {
  border-color: #667eea;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
}

.detail-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.description-text {
  color: #4b5563;
  line-height: 1.6;
  font-size: 1.1rem;
}

.features-list {
  list-style-type: none;
  padding: 0;
  color: #4b5563;
}

.features-list li {
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
}

.features-list li::before {
  content: '✓';
  color: #10b981;
  font-weight: bold;
  margin-right: 0.5rem;
}

.investment-card, .status-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.investment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.investment-item {
  padding: 0.5rem 0;
}

.item-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.item-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.token-symbol {
  color: #6366f1;
  background: #e0e7ff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.yield-value {
  color: #10b981;
}

.tokens-available {
  margin-bottom: 1.5rem;
}

.tokens-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.tokens-label {
  font-size: 0.875rem;
  color: #64748b;
}

.tokens-percentage {
  font-weight: 600;
  color: #1e293b;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
}

.investment-action {
  text-align: center;
}

.invest-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(90deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.invest-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  color: #64748b;
}

.status-value {
  font-weight: 600;
  color: #1e293b;
}

.status-badge {
  background: #10b981;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.visitor-count, .total-visitors {
  display: block;
  text-align: right;
}

.total-visitors {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.related-projects {
  padding: 2rem;
  border-top: 1px solid #e2e8f0;
}

.placeholder-text {
  color: #64748b;
  font-style: italic;
  text-align: center;
  padding: 2rem;
}

@media (max-width: 768px) {
  .project-detail {
    padding: 1rem;
  }
  
  .project-title {
    font-size: 2rem;
  }
  
  .main-image-container {
    height: 300px;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .investment-grid {
    grid-template-columns: 1fr;
  }
}
</style>