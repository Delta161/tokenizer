<script setup lang="ts">
import { defineProps } from 'vue';

interface Props {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  alignment?: 'left' | 'center' | 'right';
  textColor?: string;
  overlayOpacity?: number;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Welcome to Tokenizer',
  subtitle: 'The future of real estate investment is here',
  backgroundImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=600&fit=crop',
  ctaText: 'Get Started',
  ctaLink: '#',
  alignment: 'center',
  textColor: 'white',
  overlayOpacity: 0.5
});
</script>

<template>
  <section 
    class="hero-section" 
    :class="`text-${alignment}`"
    :style="{
      backgroundImage: `url(${backgroundImage})`,
      color: textColor
    }"
  >
    <div 
      class="overlay" 
      :style="{ opacity: overlayOpacity }"
    ></div>
    <div class="container">
      <h1 class="title">{{ title }}</h1>
      <p class="subtitle">{{ subtitle }}</p>
      <div class="cta-container">
        <a 
          v-if="ctaText" 
          :href="ctaLink" 
          class="cta-button"
        >
          {{ ctaText }}
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  padding: 6rem 2rem;
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  z-index: 1;
}

.container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  z-index: 2;
}

.title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.5;
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
}

.cta-container {
  margin-top: 2rem;
}

.cta-button {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: linear-gradient(90deg, #667eea, #764ba2);
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1.125rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 4rem 1rem;
  }
  
  .title {
    font-size: 2.25rem;
  }
  
  .subtitle {
    font-size: 1.25rem;
  }
}
</style>