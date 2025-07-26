<template>
  <div 
    class="user-list-item bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    @click="$emit('click')"
  >
    <div class="flex items-center">
      <UserAvatar :user="user" size="medium" class="mr-4" />
      
      <div class="flex-grow">
        <h3 class="font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</h3>
        <p class="text-sm text-gray-500">{{ user.email }}</p>
      </div>
      
      <div class="flex items-center">
        <UserRoleBadge :role="user.role" class="mr-2" />
        
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserAvatar from './UserAvatar.vue';
import UserRoleBadge from './UserRoleBadge.vue';
import type { User } from '../types/userTypes';

defineProps<{
  user: User;
}>();

defineEmits<{
  (e: 'click'): void;
}>();
</script>