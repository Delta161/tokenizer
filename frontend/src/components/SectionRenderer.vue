<script setup lang="ts">
import { computed, defineProps } from 'vue';
import { getAsyncSection } from '@/sections';

interface Props {
  sectionKey: string;
  data?: Record<string, any>;
  fallback?: any;
}

const props = defineProps<Props>();

const sectionComponent = computed(() => {
  return getAsyncSection(props.sectionKey, props.fallback);
});
</script>

<template>
  <component 
    :is="sectionComponent" 
    v-bind="data || {}"
  />
</template>