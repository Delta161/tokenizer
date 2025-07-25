<script setup lang="ts">
import { defineProps } from 'vue';

interface Feature {
  icon?: string;
  title: string;
  description: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  features?: Feature[];
  columns?: 2 | 3 | 4;
  backgroundColor?: string;
  textColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Our Features',
  subtitle: 'Discover what makes our platform unique',
  features: () => [
    {
      icon: '🔒',
      title: 'Secure Investments',
      description: 'All investments are secured by real estate assets and protected by smart contracts.'
    },
    {
      icon: '💰',
      title: 'Fractional Ownership',
      description: 'Invest in high-quality real estate with as little as $100 through tokenization.'
    },
    {
      icon: '📊',
      title: 'Transparent Returns',
      description: 'Track your investment performance in real-time with detailed analytics.'
    },
    {
      icon: '🌐',
      title: 'Global Access',
      description: 'Invest in real estate markets worldwide without geographical limitations.'
    }
  ],
  columns: 3,
  backgroundColor: '#f9fafb',
  textColor: '#1f2937'
});
</script>

<template>
  <section 
    class="feature-section" 
    :style="{
      backgroundColor,
      color: textColor
    }"
  >
    <div class="container">
      <div class="section-header">
        <h2 class="title">{{ title }}</h2>
        <p class="subtitle">{{ subtitle }}</p>
      </div>
      
      <div 
        class="features-grid" 
        :class="`columns-${columns}`"
      >
        <div 
          v-for="(feature, index) in features" 
          :key="index"
          class="feature-card"
        >
          <div v-if="feature.icon" class="feature-icon">{{ feature.icon }}</div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.feature-section {
  padding: 5rem 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.25rem;
  opacity: 0.8;
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.features-grid {
  display: grid;
  gap: 2rem;
}

.columns-2 {
  grid-template-columns: repeat(2, 1fr);
}

.columns-3 {
  grid-template-columns: repeat(3, 1fr);
}

.columns-4 {
  grid-template-columns: repeat(4, 1fr);
}

.feature-card {
  padding: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.feature-description {
  font-size: 1rem;
  line-height: 1.5;
  opacity: 0.8;
}

@media (max-width: 1024px) {
  .columns-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .feature-section {
    padding: 4rem 1rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1.125rem;
  }
  
  .columns-2, .columns-3, .columns-4 {
    grid-template-columns: 1fr;
  }
}
</style>