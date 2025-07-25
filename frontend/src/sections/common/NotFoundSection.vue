<script setup lang="ts">
import { defineProps } from 'vue';

interface Props {
  sectionKey?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="not-found-section">
    <div class="container">
      <div class="icon">🔍</div>
      <h2>Section Not Found</h2>
      <p v-if="sectionKey">The section "{{ sectionKey }}" could not be found.</p>
      <p v-else>The requested section could not be found.</p>
    </div>
  </div>
</template>

<style scoped>
.not-found-section {
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

.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

p {
  color: #6b7280;
  line-height: 1.5;
}
</style>