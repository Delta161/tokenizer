<script setup lang="ts">
import { defineProps } from 'vue';

interface Stat {
  value: string;
  label: string;
}

interface Props {
  title?: string;
  stats?: Stat[];
  backgroundColor?: string;
  textColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Platform Statistics',
  stats: () => [],
  backgroundColor: '#f9fafb',
  textColor: '#1f2937'
});
</script>

<template>
  <section 
    class="stats-section" 
    :style="{
      backgroundColor: props.backgroundColor,
      color: props.textColor
    }"
  >
    <div class="container">
      <h2 class="title" v-if="props.title">{{ props.title }}</h2>
      
      <div class="stats-grid">
        <div 
          v-for="(stat, index) in props.stats" 
          :key="index"
          class="stat-item"
        >
          <h3 class="stat-value">{{ stat.value }}</h3>
          <p class="stat-label">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats-section {
  padding: 5rem 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.stat-item {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #667eea;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.8;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>