<template>
  <div class="profile-view">
    <h1 class="page-title">
      <!-- Show “My Profile” if no userId is provided, otherwise “User Profile” -->
      {{ userId ? 'User Profile' : 'My Profile' }}
    </h1>

    <!-- Render the profile component -->
    <UserProfileComponent :userId="userId" :editable="isEditable" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import UserProfileComponent from '../components/UserProfile.component.vue';
// If you have a store (e.g. Pinia) to get the current user, import it here
// import { useAuthStore } from '@/stores/auth';

const route = useRoute();

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
 * Replace this with your own logic based on your auth implementation.
 */
// Example using a hypothetical auth store:
const isEditable = computed(() => {
  // If you have a store to check the logged-in user/role:
  // const authStore = useAuthStore();
  // const currentUser = authStore.user;
  // return (
  //   !userId.value ||
  //   userId.value === currentUser?.id ||
  //   currentUser?.role === 'admin'
  // );

  // Simple example: allow editing only if no userId is provided
  return !userId.value;
});
</script>

<style scoped>
.profile-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
</style>
