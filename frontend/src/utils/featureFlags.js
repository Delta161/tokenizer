/**
 * Feature Flags Utility for Frontend
 * 
 * This utility provides functions to check feature flags from the backend API
 * and conditionally render UI components based on feature flag status.
 */

import { ref, computed } from 'vue';
import axios from 'axios';

// Store for feature flags
const featureFlags = ref({});
const isLoading = ref(true);
const error = ref(null);

/**
 * Fetch all feature flags from the API
 */
async function fetchFeatureFlags() {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await axios.get('/api/flags');
    featureFlags.value = response.data.reduce((acc, flag) => {
      acc[flag.key] = flag.enabled;
      return acc;
    }, {});
  } catch (err) {
    console.error('Failed to fetch feature flags:', err);
    error.value = 'Failed to load feature flags';
  } finally {
    isLoading.value = false;
  }
}

/**
 * Check if a feature flag is enabled
 * @param {string} key - The feature flag key
 * @param {boolean} defaultValue - Default value if flag is not found
 * @returns {boolean} - Whether the feature is enabled
 */
function isFeatureEnabled(key, defaultValue = false) {
  return featureFlags.value[key] ?? defaultValue;
}

/**
 * Vue composable for using feature flags in components
 * @returns {Object} - Feature flags utilities
 */
export function useFeatureFlags() {
  return {
    // State
    featureFlags: computed(() => featureFlags.value),
    isLoading,
    error,
    
    // Methods
    fetchFeatureFlags,
    isFeatureEnabled,
    
    // Computed helpers for specific features
    isDarkModeEnabled: computed(() => isFeatureEnabled('DARK_MODE', false)),
    isNewDashboardEnabled: computed(() => isFeatureEnabled('NEW_DASHBOARD', false)),
    isAdvancedAnalyticsEnabled: computed(() => isFeatureEnabled('ADVANCED_ANALYTICS', false)),
    isBetaFeaturesEnabled: computed(() => isFeatureEnabled('BETA_FEATURES', false)),
  };
}

/**
 * Example usage in a Vue component:
 * 
 * <script setup>
 * import { useFeatureFlags } from '@/utils/featureFlags';
 * 
 * const { 
 *   isLoading, 
 *   error, 
 *   fetchFeatureFlags, 
 *   isFeatureEnabled,
 *   isDarkModeEnabled
 * } = useFeatureFlags();
 * 
 * // Fetch flags when component is mounted
 * onMounted(() => {
 *   fetchFeatureFlags();
 * });
 * </script>
 * 
 * <template>
 *   <div v-if="isLoading">Loading feature flags...</div>
 *   <div v-else-if="error">{{ error }}</div>
 *   <div v-else>
 *     <div v-if="isDarkModeEnabled">Dark Mode is enabled!</div>
 *     <div v-if="isFeatureEnabled('NEW_EXAMPLE_FEATURE')">New Example Feature is enabled!</div>
 *   </div>
 * </template>
 */