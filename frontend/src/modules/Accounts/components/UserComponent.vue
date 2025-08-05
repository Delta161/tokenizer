<template>
  <div class="user-component bg-white rounded-lg shadow-md overflow-hidden">
    <!-- Layer 2: Pure UI rendering component -->
    <div class="p-6">
      <!-- Profile Header -->
      <div class="flex items-center mb-6">
        <UserAvatar :user="user" size="large" class="mr-4" />
        
        <div class="flex-1">
          <h2 class="text-xl font-semibold">{{ user.firstName }} {{ user.lastName }}</h2>
          <div class="flex items-center mt-1">
            <UserRoleBadge :role="user.role" />
            <span class="ml-4 text-gray-500">{{ user.email }}</span>
          </div>
        </div>
        
        <button 
          v-if="editable" 
          @click="toggleEdit" 
          class="ml-auto p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <svg v-if="!isEditing" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Profile Display Mode -->
      <div v-if="!isEditing" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Email</h3>
            <p>{{ user.email }}</p>
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Role</h3>
            <p>{{ formatRole(user.role) }}</p>
          </div>
          
          <div v-if="user.bio">
            <h3 class="text-sm font-medium text-gray-500">Bio</h3>
            <p>{{ user.bio }}</p>
          </div>
          
          <div v-if="user.location">
            <h3 class="text-sm font-medium text-gray-500">Location</h3>
            <p>{{ user.location }}</p>
          </div>
          
          <div v-if="user.website">
            <h3 class="text-sm font-medium text-gray-500">Website</h3>
            <p>
              <a :href="user.website" target="_blank" class="text-primary hover:underline">{{ user.website }}</a>
            </p>
          </div>
        </div>
      </div>
      
      <!-- Profile Edit Mode -->
      <form v-else @submit.prevent="saveChanges" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
            <input 
              id="firstName" 
              v-model="form.firstName" 
              type="text" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
            <input 
              id="lastName" 
              v-model="form.lastName" 
              type="text" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input 
              id="email" 
              v-model="form.email" 
              type="email" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
            <select 
              id="role" 
              v-model="form.role" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          
          <div class="md:col-span-2">
            <label for="bio" class="block text-sm font-medium text-gray-700">Bio</label>
            <textarea 
              id="bio" 
              v-model="form.bio" 
              rows="3" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            ></textarea>
          </div>
          
          <div>
            <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
            <input 
              id="location" 
              v-model="form.location" 
              type="text" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label for="website" class="block text-sm font-medium text-gray-700">Website</label>
            <input 
              id="website" 
              v-model="form.website" 
              type="url" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            type="button" 
            @click="cancelEdit" 
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
            <span v-else>Save</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import UserAvatar from './UserAvatar.vue';
import UserRoleBadge from './UserRoleBadge.vue';
import type { UserProfile, UserRole } from '../types/user.types';

// Layer 2: Pure UI rendering component - no business logic

interface Props {
  user: UserProfile;
  editable?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
  loading: false
});

const emit = defineEmits<{
  'update': [profile: Partial<UserProfile>];
  'edit-toggle': [isEditing: boolean];
}>();

// UI state only
const isEditing = ref(false);

// Form state for editing
const form = reactive({
  firstName: props.user.firstName,
  lastName: props.user.lastName,
  email: props.user.email,
  role: props.user.role,
  bio: props.user.bio || '',
  location: props.user.location || '',
  website: props.user.website || ''
});

// Update form when user prop changes
watch(() => props.user, (newUser) => {
  form.firstName = newUser.firstName;
  form.lastName = newUser.lastName;
  form.email = newUser.email;
  form.role = newUser.role;
  form.bio = newUser.bio || '';
  form.location = newUser.location || '';
  form.website = newUser.website || '';
}, { deep: true });

// UI interaction methods (Layer 2 responsibility)
const toggleEdit = () => {
  isEditing.value = !isEditing.value;
  emit('edit-toggle', isEditing.value);
  
  if (isEditing.value) {
    // Reset form to current user data
    form.firstName = props.user.firstName;
    form.lastName = props.user.lastName;
    form.email = props.user.email;
    form.role = props.user.role;
    form.bio = props.user.bio || '';
    form.location = props.user.location || '';
    form.website = props.user.website || '';
  }
};

const cancelEdit = () => {
  isEditing.value = false;
  emit('edit-toggle', false);
};

const saveChanges = () => {
  const profileData: Partial<UserProfile> = {
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    role: form.role,
    bio: form.bio || undefined,
    location: form.location || undefined,
    website: form.website || undefined
  };
  
  emit('update', profileData);
  isEditing.value = false;
  emit('edit-toggle', false);
};

// Pure UI utility function
const formatRole = (role: UserRole): string => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};
</script>

<style scoped>
.user-component {
  transition: all 0.3s ease;
}
</style>
