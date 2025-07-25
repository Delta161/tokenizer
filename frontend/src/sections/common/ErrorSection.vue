<script setup lang="ts">
import { defineProps } from 'vue';

interface Props {
  error?: Error;
  sectionKey?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="error-section">
    <div class="container">
      <div class="icon">⚠️</div>
      <h2>Error Loading Section</h2>
      <p v-if="sectionKey">There was an error loading the section "{{ sectionKey }}".</p>
      <p v-else>There was an error loading the requested section.</p>
      <div v-if="error" class="error-details">
        <p>{{ error.message }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-section {
  padding: 3rem 1rem;
  text-align: center;
  background-color: #fef2f2;
  border-radius: 0.5rem;
  border: 1px dashed #f87171;
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
  color: #b91c1c;
  margin-bottom: 1rem;
}

p {
  color: #ef4444;
  line-height: 1.5;
}

.error-details {
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 0.25rem;
  text-align: left;
  font-family: monospace;
}
</style>