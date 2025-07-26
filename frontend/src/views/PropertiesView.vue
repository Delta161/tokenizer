<template>
  <div class="properties-view">
    <!-- This content will be rendered in the main slot of PropertiesLayout -->
    <div class="properties-container">
      <h1 class="text-3xl font-bold mb-6">Properties</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Placeholder for property cards -->
        <div v-for="i in 6" :key="i" class="property-card bg-white rounded-lg shadow-md p-4">
          <div class="bg-gray-200 h-48 rounded-md mb-4"></div>
          <h3 class="text-xl font-semibold mb-2">Property {{ i }}</h3>
          <p class="text-gray-600 mb-2">Location {{ i }}</p>
          <p class="text-gray-800 font-medium">${{ 500000 + (i * 100000) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Component logic will go here
</script>

<style scoped>
.properties-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.property-card {
  transition: transform 0.2s ease-in-out;
}

.property-card:hover {
  transform: translateY(-5px);
}
</style>