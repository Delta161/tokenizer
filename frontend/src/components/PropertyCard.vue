<template>
  <div class="property-card">
    <img :src="property.image" alt="Property image" />
    <h3>{{ property.name }}</h3>
    <p>{{ property.description }}</p>
    <p>Price: {{ property.price }} ETH</p>
    <button @click="emit('invest')">Invest</button>
  </div>
</template>

<script setup lang="ts">
import { Property } from '@/types';

defineProps<{
  property: Property;
}>();
const emit = defineEmits<{
  invest: [];
}>();
</script>

<style scoped>
.property-card {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
}
</style>