<script setup lang="ts">
import { computed } from 'vue'
import { UserRole } from '../types'

// Props
const props = defineProps<{
  role: UserRole
  size?: 'xs' | 'sm' | 'md' | 'lg'
}>()

// Computed properties
const badgeLabel = computed(() => {
  switch (props.role) {
    case UserRole.ADMIN:
      return 'Admin'
    case UserRole.CLIENT:
      return 'Client'
    case UserRole.INVESTOR:
      return 'Investor'
    default:
      return props.role
  }
})

const badgeClass = computed(() => {
  switch (props.role) {
    case UserRole.ADMIN:
      return 'badge-admin'
    case UserRole.CLIENT:
      return 'badge-client'
    case UserRole.INVESTOR:
      return 'badge-investor'
    default:
      return 'badge-default'
  }
})

const badgeSize = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'badge-xs'
    case 'sm':
      return 'badge-sm'
    case 'lg':
      return 'badge-lg'
    default:
      return 'badge-md'
  }
})
</script>

<template>
  <span class="role-badge" :class="[badgeClass, badgeSize]">
    {{ badgeLabel }}
  </span>
</template>

<style scoped>
.role-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  font-weight: 500;
  white-space: nowrap;
}

/* Badge sizes */
.badge-xs {
  padding: 0.125rem 0.375rem;
  font-size: 0.625rem;
}

.badge-sm {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
}

.badge-md {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.badge-lg {
  padding: 0.375rem 1rem;
  font-size: 1rem;
}

/* Badge colors */
.badge-admin {
  background-color: rgba(244, 67, 54, 0.15);
  color: #f44336;
}

.badge-manager {
  background-color: rgba(33, 150, 243, 0.15);
  color: #2196f3;
}

.badge-user {
  background-color: rgba(76, 175, 80, 0.15);
  color: #4caf50;
}

.badge-guest {
  background-color: rgba(158, 158, 158, 0.15);
  color: #9e9e9e;
}

.badge-default {
  background-color: rgba(158, 158, 158, 0.15);
  color: #9e9e9e;
}
</style>