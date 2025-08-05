<template>
  <div 
    class="user-avatar flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center"
    :class="sizeClasses[size]"
  >
    <img 
      v-if="user.profileImage" 
      :src="user.profileImage" 
      :alt="`${user.firstName} ${user.lastName}`"
      class="w-full h-full rounded-full object-cover"
    />
    <div 
      v-else 
      class="text-gray-600 font-medium"
      :class="textSizeClasses[size]"
    >
      {{ initials }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { UserProfile } from '../types/user.types';

// Layer 2: Pure UI component - just renders user avatar

interface Props {
  user: UserProfile;
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium'
});

// Size mapping for avatar container
const sizeClasses = {
  small: 'w-8 h-8',
  medium: 'w-12 h-12',
  large: 'w-16 h-16'
};

// Size mapping for initials text
const textSizeClasses = {
  small: 'text-xs',
  medium: 'text-sm',
  large: 'text-lg'
};

// Generate initials from user name
const initials = computed(() => {
  const first = props.user.firstName?.charAt(0)?.toUpperCase() || '';
  const last = props.user.lastName?.charAt(0)?.toUpperCase() || '';
  return first + last;
});
</script>

<style scoped>
.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
