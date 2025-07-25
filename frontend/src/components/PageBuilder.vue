<script setup lang="ts">
import { defineProps } from 'vue';
import SectionRenderer from './SectionRenderer.vue';

interface Section {
  id: string;
  type: string;
  data?: Record<string, any>;
}

interface Props {
  sections: Section[];
}

const props = defineProps<Props>();
</script>

<template>
  <div class="page-builder">
    <template v-for="(section, index) in sections" :key="section.id">
      <SectionRenderer 
        :section-key="section.type" 
        :data="section.data"
      />
    </template>
  </div>
</template>

<style scoped>
.page-builder {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>