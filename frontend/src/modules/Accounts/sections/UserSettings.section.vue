<template>
  <div class="user-settings-section">
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section Header -->
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p class="mt-2 text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>
          
          <!-- Mode switcher -->
          <div class="flex space-x-2">
            <button 
              @click="$emit('mode-change', 'profile')"
              class="px-4 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            >
              Profile
            </button>
            <button 
              @click="$emit('mode-change', 'settings')"
              class="px-4 py-2 text-sm font-medium rounded-md bg-primary text-white"
            >
              Settings
            </button>
          </div>
        </div>

        <!-- User Settings Component -->
        <UserComponent 
          :user-id="userId"
          mode="settings"
          @update="handleSettingsUpdate"
          @error="handleError"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserComponent from '../components/user.component.vue';
import type { UserSettings } from '../types/user.types';

// Layer 2: Section handles complex UI coordination
interface Props {
  userId?: string;
}

const props = defineProps<Props>();

// Events
const emit = defineEmits<{
  (e: 'mode-change', mode: 'profile' | 'settings'): void;
  (e: 'settings-updated', settings: UserSettings): void;
  (e: 'error', error: string): void;
}>();

// Section-level event handlers
const handleSettingsUpdate = (settings: UserSettings) => {
  emit('settings-updated', settings);
};

const handleError = (error: string) => {
  emit('error', error);
};
</script>

<style scoped>
.user-settings-section {
  /* Section-specific styles */
}
</style>
