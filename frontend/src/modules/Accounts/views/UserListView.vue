<template>
  <div class="user-list-view">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Users</h1>
      
      <div class="flex space-x-4">
        <div class="relative">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search users..." 
            class="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            @keyup.enter="handleSearch"
          />
          <div class="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <select 
          v-model="roleFilter" 
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          @change="handleSearch"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
        </select>
      </div>
    </div>
    
    <div v-if="loading && !users.length" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>
    
    <div v-else-if="!users.length" class="text-center py-8 text-gray-500">
      No users found. Try adjusting your search criteria.
    </div>
    
    <template v-else>
      <div class="space-y-4">
        <div 
          v-for="user in users" 
          :key="user.id" 
          class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
          @click="navigateToUserDetail(user.id)"
        >
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm mr-4">
              {{ user.firstName?.charAt(0) }}{{ user.lastName?.charAt(0) }}
            </div>
            
            <div class="flex-grow">
              <h3 class="font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</h3>
              <p class="text-sm text-gray-500">{{ user.email }}</p>
            </div>
            
            <div class="flex items-center">
              <span class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="{
                      'bg-blue-100 text-blue-800': user.role === 'admin',
                      'bg-green-100 text-green-800': user.role === 'user',
                      'bg-yellow-100 text-yellow-800': user.role === 'manager'
                    }">
                {{ user.role }}
              </span>
              
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="hasMore && !loading" class="mt-6 text-center">
        <button 
          @click="loadMoreUsers" 
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Load More
        </button>
      </div>
      
      <div v-if="loading && users.length" class="mt-6 text-center py-4">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserSearch } from '../composables/useUserSearch';
import { useUser } from '../composables/useUser';
import type { UserRole } from '../types/userTypes';

const router = useRouter();
const { isAdmin } = useUser();
const { 
  loading, 
  error, 
  users, 
  hasMore,
  searchUsers, 
  loadMore, 
  resetSearch 
} = useUserSearch();

const searchQuery = ref('');
const roleFilter = ref<UserRole | ''>('');

onMounted(async () => {
  // Check if user is admin
  if (!isAdmin.value) {
    router.push('/profile');
    return;
  }
  
  await handleSearch();
});

async function handleSearch() {
  resetSearch();
  
  const params = {
    query: searchQuery.value || undefined,
    role: roleFilter.value || undefined,
    sortBy: 'name' as const,
    sortOrder: 'asc' as const
  };
  
  await searchUsers(params);
}

async function loadMoreUsers() {
  const params = {
    query: searchQuery.value || undefined,
    role: roleFilter.value || undefined,
    sortBy: 'name' as const,
    sortOrder: 'asc' as const
  };
  
  await loadMore(params);
}

function navigateToUserDetail(userId: string) {
  router.push(`/users/${userId}`);
}
</script>