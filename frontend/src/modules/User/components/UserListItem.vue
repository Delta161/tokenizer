<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import UserAvatar from './UserAvatar.vue'
import UserRoleBadge from './UserRoleBadge.vue'
import { User, UserRole } from '../types'

// Props
const props = defineProps<{
  user: User
  selectable?: boolean
  selected?: boolean
  clickable?: boolean
  showActions?: boolean
}>()

// Emits
const emit = defineEmits<{
  'select': [userId: string]
  'view': [userId: string]
  'edit': [userId: string]
  'delete': [userId: string]
}>()

// Router
const router = useRouter()

// Computed properties
const userFullName = computed(() => {
  return `${props.user.firstName} ${props.user.lastName}`
})

const userEmail = computed(() => {
  return props.user.email
})

const userRoles = computed(() => {
  return props.user.roles || []
})

const primaryRole = computed(() => {
  if (!userRoles.value.length) return null
  
  // Priority order: Admin > Client > Investor
  if (userRoles.value.includes(UserRole.ADMIN)) return UserRole.ADMIN
  if (userRoles.value.includes(UserRole.CLIENT)) return UserRole.CLIENT
  return userRoles.value[0]
})

const lastActive = computed(() => {
  if (!props.user.lastActiveAt) return 'Never'
  
  const lastActive = new Date(props.user.lastActiveAt)
  const now = new Date()
  const diffMs = now.getTime() - lastActive.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      if (diffMinutes === 0) return 'Just now'
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
    }
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  }
  
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  
  return lastActive.toLocaleDateString()
})

// Methods
function handleSelect() {
  if (props.selectable) {
    emit('select', props.user.id)
  }
}

function handleClick() {
  if (props.clickable) {
    emit('view', props.user.id)
    router.push({ name: 'user-detail', params: { id: props.user.id } })
  }
}

function handleView() {
  emit('view', props.user.id)
  router.push({ name: 'user-detail', params: { id: props.user.id } })
}

function handleEdit() {
  emit('edit', props.user.id)
}

function handleDelete() {
  if (confirm(`Are you sure you want to delete user ${userFullName.value}?`)) {
    emit('delete', props.user.id)
  }
}
</script>

<template>
  <div 
    class="user-list-item" 
    :class="{
      'selectable': selectable,
      'selected': selected,
      'clickable': clickable
    }"
    @click="handleClick"
  >
    <div class="user-select" v-if="selectable">
      <input 
        type="checkbox" 
        :checked="selected" 
        @click.stop="handleSelect"
      />
    </div>
    
    <div class="user-avatar">
      <UserAvatar :user="user" size="md" />
    </div>
    
    <div class="user-info">
      <div class="user-name-row">
        <h3 class="user-name">{{ userFullName }}</h3>
        <UserRoleBadge 
          v-if="primaryRole" 
          :role="primaryRole" 
          size="sm" 
        />
      </div>
      
      <div class="user-details">
        <span class="user-email">{{ userEmail }}</span>
        <span class="user-active">Last active: {{ lastActive }}</span>
      </div>
    </div>
    
    <div class="user-actions" v-if="showActions">
      <button 
        class="action-button view-button" 
        @click.stop="handleView"
        title="View user"
      >
        <span class="icon">👁️</span>
      </button>
      
      <button 
        class="action-button edit-button" 
        @click.stop="handleEdit"
        title="Edit user"
      >
        <span class="icon">✏️</span>
      </button>
      
      <button 
        class="action-button delete-button" 
        @click.stop="handleDelete"
        title="Delete user"
      >
        <span class="icon">🗑️</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.user-list-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.2s;
}

.user-list-item:last-child {
  border-bottom: none;
}

.user-list-item.selectable {
  cursor: pointer;
}

.user-list-item.clickable {
  cursor: pointer;
}

.user-list-item.clickable:hover {
  background-color: var(--color-background-soft);
}

.user-list-item.selected {
  background-color: rgba(var(--color-primary-rgb), 0.1);
}

.user-select {
  margin-right: 1rem;
}

.user-avatar {
  margin-right: 1rem;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
}

.user-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  margin-right: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-details {
  display: flex;
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.user-email {
  margin-right: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-active {
  white-space: nowrap;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: var(--color-background-mute);
}

.icon {
  font-size: 1rem;
}

/* Responsive styles */
@media (max-width: 768px) {
  .user-details {
    flex-direction: column;
  }
  
  .user-email {
    margin-right: 0;
    margin-bottom: 0.25rem;
  }
}

@media (max-width: 576px) {
  .user-list-item {
    padding: 0.75rem;
  }
  
  .user-actions {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .action-button {
    width: 28px;
    height: 28px;
  }
}
</style>