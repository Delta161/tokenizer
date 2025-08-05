<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">My Profile</h1>
        <p class="mt-2 text-gray-600">Manage your account information and preferences</p>
      </div>

      <!-- Profile Component -->
      <UserComponent :editable="true" />

      <!-- Actions -->
      <div class="mt-8 flex justify-between">
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
import { useRouter } from 'vue-router';
import UserComponent from '../modules/Accounts/components/user.component.vue';
import { useAuthStore } from '../modules/Accounts';

const router = useRouter();
const authStore = useAuthStore();

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