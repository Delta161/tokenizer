<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from '../composables/useUser'

// Props
const props = defineProps<{
  user?: {
    id?: string
    firstName?: string
    lastName?: string
    profile?: {
      avatarUrl?: string
    }
  }
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showStatus?: boolean
  status?: 'online' | 'away' | 'offline' | 'busy'
}>()

// User composable for getting initials
const { getUserInitials } = useUser()

// Computed properties
const hasAvatar = computed(() => {
  return !!props.user?.profile?.avatarUrl
})

const avatarUrl = computed(() => {
  return props.user?.profile?.avatarUrl || ''
})

const userInitials = computed(() => {
  if (!props.user) return ''
  return getUserInitials(props.user)
})

const avatarSize = computed(() => {
  switch (props.size) {
    case 'xs': return 'avatar-xs'
    case 'sm': return 'avatar-sm'
    case 'lg': return 'avatar-lg'
    case 'xl': return 'avatar-xl'
    default: return 'avatar-md'
  }
})

const statusClass = computed(() => {
  if (!props.showStatus || !props.status) return ''
  return `status-${props.status}`
})
</script>

<template>
  <div class="user-avatar" :class="[avatarSize, statusClass]">
    <img 
      v-if="hasAvatar" 
      :src="avatarUrl" 
      :alt="`${user?.firstName} ${user?.lastName}`" 
      class="avatar-image"
    />
    <div v-else class="avatar-initials">
      {{ userInitials }}
    </div>
    <span v-if="showStatus && status" class="status-indicator"></span>
  </div>
</template>

<style scoped>
.user-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  overflow: hidden;
}

.avatar-xs {
  width: 24px;
  height: 24px;
  font-size: 0.625rem;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  font-size: 0.75rem;
}

.avatar-md {
  width: 40px;
  height: 40px;
  font-size: 0.875rem;
}

.avatar-lg {
  width: 56px;
  height: 56px;
  font-size: 1.25rem;
}

.avatar-xl {
  width: 80px;
  height: 80px;
  font-size: 1.75rem;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: var(--color-primary);
  color: white;
  font-weight: 600;
  text-transform: uppercase;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 25%;
  height: 25%;
  border-radius: 50%;
  border: 2px solid var(--color-background);
  background-color: var(--color-text-light);
}

.status-online .status-indicator {
  background-color: #4caf50;
}

.status-away .status-indicator {
  background-color: #ff9800;
}

.status-busy .status-indicator {
  background-color: #f44336;
}

.status-offline .status-indicator {
  background-color: #9e9e9e;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 576px) {
  .avatar-lg {
    width: 48px;
    height: 48px;
    font-size: 1rem;
  }
  
  .avatar-xl {
    width: 64px;
    height: 64px;
    font-size: 1.5rem;
  }
}
</style>