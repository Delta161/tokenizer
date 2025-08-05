<template>
  <span 
    class="user-role-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :class="badgeClasses"
  >
    {{ roleLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { UserRole } from '../types/user.types';

const props = defineProps<{
  role: UserRole;
}>();

// Role label with first letter capitalized
const roleLabel = computed(() => {
  return props.role.charAt(0).toUpperCase() + props.role.slice(1);
});

// Badge classes based on role
const badgeClasses = computed(() => {
  switch (props.role) {
    case 'admin':
      return 'bg-red-100 text-red-800';
    case 'manager':
      return 'bg-blue-100 text-blue-800';
    case 'user':
    default:
      return 'bg-green-100 text-green-800';
  }
});
</script>