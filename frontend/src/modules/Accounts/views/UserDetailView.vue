<template>
  <div class="user-detail-view">
    <div class="flex items-center mb-6">
      <button 
        @click="router.back()" 
        class="mr-4 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-2xl font-bold">User Details</h1>
    </div>
    
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>
    
    <div v-else-if="!user" class="text-center py-8 text-gray-500">
      User not found.
    </div>
    
    <template v-else>
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <div class="flex items-center mb-6">
            <div class="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl mr-4">
              {{ user.firstName?.charAt(0) }}{{ user.lastName?.charAt(0) }}
            </div>
            
            <div>
              <h2 class="text-xl font-semibold">{{ user.firstName }} {{ user.lastName }}</h2>
              <div class="flex items-center mt-1">
                <UserRoleBadge :role="user.role" />
                <span class="ml-4 text-gray-500">{{ user.email }}</span>
              </div>
            </div>
          </div>
          
          <div class="border-t pt-6">
            <component :is="userProfileSection" :user="user" :editable="isAdmin" @update="handleUserUpdate" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUser } from '../composables/useUser';
import { getAsyncSection } from '@/sections';
import UserRoleBadge from '../components/UserRoleBadge.vue';
import type { User, UserUpdate } from '../types/userTypes';

const userProfileSection = computed(() => getAsyncSection('common/user-profile'));

const route = useRoute();
const router = useRouter();
const userId = ref(route.params.id as string);
const user = ref<User | null>(null);

const { 
  loading, 
  error, 
  isAdmin,
  getUserById,
  updateUser 
} = useUser();

onMounted(async () => {
  await fetchUserData();
});

async function fetchUserData() {
  if (userId.value) {
    user.value = await getUserById(userId.value);
  }
}

async function handleUserUpdate(userData: UserUpdate) {
  if (user.value) {
    await updateUser(user.value.id, userData);
    await fetchUserData();
  }
}
</script>