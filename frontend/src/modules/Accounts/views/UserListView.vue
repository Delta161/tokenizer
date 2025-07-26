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
        <UserListItem 
          v-for="user in users" 
          :key="user.id" 
          :user="user" 
          @click="navigateToUserDetail(user.id)" 
        />
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
import UserListItem from '../components/UserListItem.vue';
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
    sortBy: 'name',
    sortOrder: 'asc'
  };
  
  await searchUsers(params);
}

async function loadMoreUsers() {
  const params = {
    query: searchQuery.value || undefined,
    role: roleFilter.value || undefined,
    sortBy: 'name',
    sortOrder: 'asc'
  };
  
  await loadMore(params);
}

function navigateToUserDetail(userId: string) {
  router.push(`/users/${userId}`);
}
</script>