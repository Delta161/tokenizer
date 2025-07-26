<template>
  <div class="user-settings-view">
    <h1 class="text-2xl font-bold mb-6">User Settings</h1>
    
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>
    
    <template v-else>
      <UserSettingsForm 
        v-if="currentUser" 
        :user="currentUser" 
        @update="handleSettingsUpdate" 
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUser } from '../composables/useUser';
import UserSettingsForm from '../components/UserSettingsForm.vue';
import type { UserSettings } from '../types/userTypes';

const { 
  loading, 
  error, 
  currentUser, 
  fetchCurrentUser,
  updateUserSettings 
} = useUser();

onMounted(async () => {
  await fetchCurrentUser();
});

async function handleSettingsUpdate(settingsData: Partial<UserSettings>) {
  if (currentUser.value) {
    await updateUserSettings(currentUser.value.id, settingsData);
    await fetchCurrentUser();
  }
}
</script>