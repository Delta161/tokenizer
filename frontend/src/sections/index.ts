import { defineAsyncComponent } from 'vue';
import type { Component } from 'vue';

// Section registry interface
interface SectionRegistry {
  [key: string]: () => Promise<Component>;
}

// Dynamic section registry
const sections: SectionRegistry = {
  // Auth sections
  // 'auth/login': () => import('./auth/LoginSection.vue'),
  // 'auth/register': () => import('./auth/RegisterSection.vue'),
  
  // Dashboard sections
  // 'dashboard/summary': () => import('./dashboard/SummarySection.vue'),
  // 'dashboard/stats': () => import('./dashboard/StatsSection.vue'),
  
  // Property sections
  'property/list': () => import('./property/PropertyListSection.vue'),
  'property/card': () => import('./property/PropertyCardSection.vue'),
  // 'property/detail': () => import('./property/PropertyDetailSection.vue'),
  
  // Investment sections
  // 'investment/opportunities': () => import('./investment/OpportunitiesSection.vue'),
  // 'investment/portfolio': () => import('./investment/PortfolioSection.vue'),
  
  // Common sections
  // 'common/header': () => import('./common/HeaderSection.vue'),
  'common/footer': () => import('./common/FooterSection.vue'),
  'common/hero': () => import('./common/HeroSection.vue'),
  'common/features': () => import('./common/FeatureSection.vue'),
  'common/stats': () => import('./common/StatsSection.vue'),
  'common/not-found': () => import('./common/NotFoundSection.vue'),
  'common/error': () => import('./common/ErrorSection.vue'),
  'common/loading': () => import('./common/LoadingSection.vue'),
};

/**
 * Load a section component asynchronously
 * @param sectionKey - The key of the section to load
 * @returns The async component or undefined if not found
 */
export function loadSection(sectionKey: string): () => Promise<Component> | undefined {
  return sections[sectionKey];
}

/**
 * Get an async component for a section
 * @param sectionKey - The key of the section to load
 * @param fallback - Optional fallback component
 * @returns The async component or fallback
 */
export function getAsyncSection(sectionKey: string, fallback?: Component): Component {
  const sectionLoader = loadSection(sectionKey);
  
  if (!sectionLoader && fallback) {
    return fallback;
  }
  
  if (!sectionLoader) {
    // Return empty component if section not found and no fallback
    return defineAsyncComponent({
      loader: () => import('./common/NotFoundSection.vue'),
      delay: 200,
      timeout: 3000,
      errorComponent: defineAsyncComponent(() => import('./common/ErrorSection.vue')),
      loadingComponent: defineAsyncComponent(() => import('./common/LoadingSection.vue'))
    });
  }
  
  return defineAsyncComponent({
    loader: sectionLoader,
    delay: 200,
    timeout: 3000,
    errorComponent: defineAsyncComponent(() => import('./common/ErrorSection.vue')),
    loadingComponent: defineAsyncComponent(() => import('./common/LoadingSection.vue'))
  });
}

// Export all sections for direct access
export default sections;