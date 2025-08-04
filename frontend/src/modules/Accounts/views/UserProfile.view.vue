<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          {{ userId ? 'User Profile' : 'My Profile' }}
        </h1>
        <p class="mt-2 text-gray-600">
          {{ userId ? 'View user account information' : 'Manage your account information and preferences' }}
        </p>
      </div>

      <!-- Render the profile component -->
      <UserProfileComponent :userId="userId" :editable="isEditable" />

      <!-- Actions (only show for current user's profile) -->
      <div v-if="!userId" class="mt-8 flex justify-between">
        <button 
          @click="logout" 
          class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import UserProfileComponent from '../components/UserProfile.component.vue';
import { useAuthStore } from '../../../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

/**
 * Extract a userId from the route params.
 * If your router defines a path like `/users/:id`, the `id` will be available here.
 */
const userId = computed(() => {
  const idParam = route.params.id;
  return typeof idParam === 'string' ? idParam : undefined;
});

/**
 * Determine whether the profile can be edited.
 * - If no userId is provided (current user), allow editing.
 * - If a userId is provided, you might restrict editing to admins or the user themselves.
 */
const isEditable = computed(() => {
  // Simple example: allow editing only if no userId is provided (current user's profile)
  return !userId.value;
});

/**
 * Logout functionality
 */
async function logout(): Promise<void> {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
    router.push('/login');
  }
}
</script>
