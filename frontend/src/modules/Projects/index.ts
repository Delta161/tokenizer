/**
 * Unified Projects Module
 * This module combines functionality from both Property and Project modules
 */

// Components
export { default as ProjectList } from './components/ProjectList.vue'
export { default as ProjectDetail } from './components/ProjectDetail.vue'
export { default as ProjectForm } from './components/ProjectForm.vue'
// ProjectCard has been replaced by PropertyCardSection

// Composables
export { useProjectSearch } from './composables/useProjectSearch'

// Store
export { useProjectStore } from './store/projectStore'

// Services
export { projectService } from './services/projectService'

// Types
export * from './types/Project'

// Routes
export { default as projectRoutes } from './routes/index'

/**
 * Initialize the Projects module
 * This function should be called once during application startup
 */
export function initProjectsModule() {
  // Any initialization logic can go here
  console.log('Projects module initialized')
}