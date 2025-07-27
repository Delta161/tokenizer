<template>
  <div class="property-list-component">
    <div class="section-header">
      <h2 class="title">{{ title }}</h2>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </div>
    
    <div class="properties-grid">
      <project-card 
        v-for="project in properties" 
        :key="project.id" 
        :project="project"
        @favorite="handleToggleFavorite(project.id)"
        @view="viewProject(project.id)"
      />
    </div>
    
    <div v-if="showPagination" class="pagination">
      <button 
        class="pagination-button" 
        :disabled="currentPage === 1"
        @click="$emit('page-change', currentPage - 1)"
      >
        Previous
      </button>
      <div class="pagination-numbers">
        <button 
          v-for="page in totalPages" 
          :key="page"
          class="pagination-number"
          :class="{ active: page === currentPage }"
          @click="$emit('page-change', page)"
        >
          {{ page }}
        </button>
      </div>
      <button 
        class="pagination-button"
        :disabled="currentPage === totalPages"
        @click="$emit('page-change', currentPage + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import ProjectCard from './ProjectCard.vue';
import type { Project } from '../types/Project';

interface Props {
  title?: string;
  subtitle?: string;
  properties: Project[];
  currentPage?: number;
  totalPages?: number;
  showPagination?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Featured Properties',
  subtitle: 'Discover our selection of premium tokenized real estate properties',
  currentPage: 1,
  totalPages: 1,
  showPagination: true
});

const emit = defineEmits<{
  'toggle-favorite': [propertyId: string];
  'page-change': [page: number];
}>();

const router = useRouter();

const handleToggleFavorite = (propertyId: string) => {
  emit('toggle-favorite', propertyId);
};

const viewProject = (id: string) => {
  router.push(`/projects/${id}`);
};
</script>

<style scoped>
.property-list-component {
  padding: 2rem 0;
  background-color: var(--color-surface, #f9fafb);
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--color-text-primary, #111827);
}

.subtitle {
  font-size: 1.25rem;
  color: var(--color-text-secondary, #6b7280);
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination-button {
  padding: 0.5rem 1rem;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  background-color: #f9fafb;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
}

.pagination-number {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  font-weight: 500;
  background-color: white;
  border: 1px solid #d1d5db;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-number:hover:not(.active) {
  background-color: #f9fafb;
}

.pagination-number.active {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
}

@media (min-width: 768px) {
  .properties-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .properties-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1.125rem;
  }
  
  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>