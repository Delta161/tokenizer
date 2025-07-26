<template>
  <div class="user-avatar" :class="sizeClasses">
    <img 
      v-if="user && user.avatar" 
      :src="user.avatar" 
      :alt="`${user.firstName} ${user.lastName}`" 
      class="rounded-full object-cover w-full h-full"
    />
    <div 
      v-else 
      class="rounded-full flex items-center justify-center bg-primary text-white w-full h-full"
    >
      {{ initials }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { User } from '../types/userTypes';

const props = defineProps<{
  user?: User | null;
  size?: 'small' | 'medium' | 'large';
}>();

// Default to medium size if not specified
const size = computed(() => props.size || 'medium');

// Size classes based on the size prop
const sizeClasses = computed(() => {
  switch (size.value) {
    case 'small':
      return 'w-8 h-8 text-xs';
    case 'large':
      return 'w-16 h-16 text-xl';
    case 'medium':
    default:
      return 'w-10 h-10 text-sm';
  }
});

// Get initials from user's name
const initials = computed(() => {
  if (!props.user) return '?';
  
  const firstName = props.user.firstName || '';
  const lastName = props.user.lastName || '';
  
  if (!firstName && !lastName) return '?';
  
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
});
</script>