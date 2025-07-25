<script setup lang="ts">
import { defineProps } from 'vue';

interface Props {
  sectionKey?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="loading-section">
    <div class="container">
      <div class="spinner"></div>
      <p v-if="sectionKey">Loading section "{{ sectionKey }}"...</p>
      <p v-else>Loading section...</p>
    </div>
  </div>
</template>

<style scoped>
.loading-section {
  padding: 3rem 1rem;
  text-align: center;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px dashed #d1d5db;
}

.container {
  max-width: 32rem;
  margin: 0 auto;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

p {
  color: #6b7280;
  line-height: 1.5;
}
</style>