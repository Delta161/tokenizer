<script setup lang="ts">
import { ref } from 'vue'

// Mock data for featured properties
const featuredProperties = ref([
  {
    id: 1,
    name: 'Luxury Downtown Apartment',
    location: 'New York, NY',
    price: '2.5 ETH',
    image: 'https://via.placeholder.com/300x200?text=Luxury+Apartment',
    tokenized: true,
    availableTokens: 1000
  },
  {
    id: 2,
    name: 'Modern Office Building',
    location: 'San Francisco, CA',
    price: '15.8 ETH',
    image: 'https://via.placeholder.com/300x200?text=Office+Building',
    tokenized: true,
    availableTokens: 5000
  },
  {
    id: 3,
    name: 'Beachfront Villa',
    location: 'Miami, FL',
    price: '8.2 ETH',
    image: 'https://via.placeholder.com/300x200?text=Beachfront+Villa',
    tokenized: false,
    availableTokens: 0
  }
])
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

    <!-- Featured Properties -->
    <section class="featured-properties">
      <div class="container">
        <h2>Featured Properties</h2>
        <div class="properties-grid">
          <div v-for="property in featuredProperties" :key="property.id" class="property-card">
            <img :src="property.image" :alt="property.name" />
            <div class="property-info">
              <h3>{{ property.name }}</h3>
              <p class="location">{{ property.location }}</p>
              <p class="price">{{ property.price }}</p>
              <div class="tokenization-status">
                <span v-if="property.tokenized" class="status tokenized">✓ Tokenized</span>
                <span v-else class="status pending">⏳ Coming Soon</span>
              </div>
              <div v-if="property.tokenized" class="tokens-available">
                <span>{{ property.availableTokens }} tokens available</span>
              </div>
              <router-link :to="`/project/${property.id}`" class="btn btn-outline">View Details</router-link>
            </div>
          </div>
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

.featured-properties {
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

.featured-properties h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  color: #1e293b;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.property-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.property-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.property-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.property-info {
  padding: 1.5rem;
}

.property-info h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.location {
  color: #666;
  margin-bottom: 0.5rem;
}

.price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 1rem;
}

.tokenization-status {
  margin-bottom: 0.5rem;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status.tokenized {
  background: #d4edda;
  color: #155724;
}

.status.pending {
  background: #fff3cd;
  color: #856404;
}

.tokens-available {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
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
  
  .featured-properties,
  .stats {
    padding: 2rem 1rem;
    margin: 1rem 0;
  }
  
  .properties-grid {
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
