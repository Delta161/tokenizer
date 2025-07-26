<template>
  <div class="user-profile-view">
    <h1 class="text-2xl font-bold mb-6">User Profile</h1>
    
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>
    
    <template v-else>
      <UserProfileCard 
        v-if="currentUser" 
        :user="currentUser" 
        @update="handleProfileUpdate" 
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUser } from '../composables/useUser';
import UserProfileCard from '../components/UserProfileCard.vue';
import type { UserProfile } from '../types/userTypes';

const { 
  loading, 
  error, 
  currentUser, 
  fetchCurrentUser,
  updateUserProfile 
} = useUser();

onMounted(async () => {
  await fetchCurrentUser();
});

async function handleProfileUpdate(profileData: Partial<UserProfile>) {
  if (currentUser.value) {
    await updateUserProfile(currentUser.value.id, profileData);
    await fetchCurrentUser();
  }
}
</script>