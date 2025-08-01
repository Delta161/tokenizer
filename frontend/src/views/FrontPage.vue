<script setup lang="ts">
import { ref } from 'vue';
import PageBuilder from '@/components/PageBuilder.vue';

// Page configuration with sections
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
    id: 'stats-1',
    type: 'common/stats',
    data: {
      title: 'Platform Statistics',
      stats: [
        { value: '$2.4M', label: 'Total Value Locked' },
        { value: '156', label: 'Properties Tokenized' },
        { value: '3,247', label: 'Active Investors' },
        { value: '12.5%', label: 'Average Annual Return' }
      ],
      backgroundColor: '#ffffff',
      textColor: '#1f2937'
    }
  }
]);
</script>

<template>
  <div class="front-page">
    <PageBuilder :sections="pageSections" />
  </div>
</template>

<style scoped>
.front-page {
  min-height: 100vh;
}
</style>