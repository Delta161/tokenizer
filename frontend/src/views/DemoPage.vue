<script setup lang="ts">
import { ref } from 'vue';
import PageBuilder from '@/components/PageBuilder.vue';

// Example page configuration with sections
const pageSections = ref([
  {
    id: 'hero-1',
    type: 'common/hero',
    data: {
      title: 'Welcome to Tokenizer',
      subtitle: 'Invest in real estate with as little as $100 through blockchain technology',
      backgroundImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=600&fit=crop',
      ctaText: 'Explore Properties',
      ctaLink: '/projects',
      alignment: 'center',
      textColor: 'white',
      overlayOpacity: 0.6
    }
  },
  {
    id: 'features-1',
    type: 'common/features',
    data: {
      title: 'Why Choose Tokenizer',
      subtitle: 'Our platform offers unique advantages for real estate investors',
      columns: 3,
      features: [
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
        },
        {
          icon: '🔄',
          title: 'Liquidity',
          description: 'Trade your property tokens anytime on our marketplace for increased liquidity.'
        },
        {
          icon: '📱',
          title: 'Easy Management',
          description: 'Manage your real estate portfolio from anywhere using our mobile app.'
        }
      ],
      backgroundColor: '#f9fafb',
      textColor: '#1f2937'
    }
  },
  {
    id: 'footer-1',
    type: 'common/footer',
    data: {
      companyName: 'Tokenizer',
      description: 'Revolutionizing real estate investment through blockchain technology and tokenization.',
      backgroundColor: '#1f2937',
      textColor: '#f9fafb'
    }
  }
]);

// Function to add a custom section (for demonstration)
const addCustomSection = () => {
  // This would typically come from a CMS or API
  pageSections.value.splice(2, 0, {
    id: `custom-${Date.now()}`,
    type: 'common/hero',
    data: {
      title: 'Custom Section Added Dynamically',
      subtitle: 'This section was added programmatically to demonstrate the flexibility of the system',
      backgroundImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=400&fit=crop',
      ctaText: 'Learn More',
      ctaLink: '#',
      alignment: 'center',
      textColor: 'white',
      overlayOpacity: 0.7
    }
  });
};
</script>

<template>
  <div class="demo-page">
    <div class="admin-controls">
      <h3>Admin Controls</h3>
      <p>This panel demonstrates how sections can be managed dynamically</p>
      <button @click="addCustomSection" class="add-section-button">
        Add Custom Section
      </button>
    </div>
    
    <PageBuilder :sections="pageSections" />
  </div>
</template>

<style scoped>
.demo-page {
  position: relative;
}

.admin-controls {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 300px;
}

.admin-controls h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.admin-controls p {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #64748b;
}

.add-section-button {
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-section-button:hover {
  background-color: #5a67d8;
}
</style>