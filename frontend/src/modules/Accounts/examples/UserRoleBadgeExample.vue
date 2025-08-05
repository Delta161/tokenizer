<template>
  <div class="p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">User Role Badge Examples</h2>
    
    <div class="space-y-4">
      <!-- Admin role example -->
      <div class="flex items-center space-x-2">
        <span class="w-20">Admin:</span>
        <UserRoleBadge role="admin" />
      </div>
      
      <!-- Manager role example -->
      <div class="flex items-center space-x-2">
        <span class="w-20">Manager:</span>
        <UserRoleBadge role="manager" />
      </div>
      
      <!-- Regular user role example -->
      <div class="flex items-center space-x-2">
        <span class="w-20">User:</span>
        <UserRoleBadge role="user" />
      </div>
      
      <!-- Dynamic role example -->
      <div class="mt-8">
        <h3 class="text-lg font-medium mb-2">Dynamic Role Selection</h3>
        <div class="flex items-center space-x-4">
          <select 
            v-model="selectedRole" 
            class="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
          
          <UserRoleBadge :role="selectedRole" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UserRoleBadge } from '../components';
import type { UserRole } from '../types/user.types';

// State for dynamic role selection
const selectedRole = ref<UserRole>('user');
</script>