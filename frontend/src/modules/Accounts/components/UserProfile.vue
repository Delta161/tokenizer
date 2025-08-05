<template>
  <div class="user-profile">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Loading user profile...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <p class="text-red-700">{{ error }}</p>
      <button 
        @click="loadUser" 
        class="mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-3 rounded text-sm"
      >
        Try Again
      </button>
    </div>

    <!-- User Profile -->
    <div v-else-if="user" class="bg-white shadow rounded-lg p-6">
      <div class="flex items-center space-x-4">
        <!-- Avatar -->
        <div class="flex-shrink-0">
          <div 
            v-if="user.avatarUrl"
            class="h-16 w-16 rounded-full overflow-hidden"
          >
            <img :src="user.avatarUrl" :alt="user.fullName" class="h-full w-full object-cover" />
          </div>
          <div 
            v-else
            class="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xl font-semibold"
          >
            {{ userInitials }}
          </div>
        </div>
        
        <!-- User Info -->
        <div class="flex-grow">
          <h3 class="text-lg font-medium text-gray-900">{{ user.fullName }}</h3>
          <p class="text-sm text-gray-500">{{ user.email }}</p>
          <div class="mt-1">
            <UserRoleBadge :role="user.role" />
          </div>
          <div v-if="user.authProvider" class="mt-1">
            <span class="text-xs text-gray-400">Signed in via {{ user.authProvider }}</span>
          </div>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div v-if="user.phone">
          <dt class="text-sm font-medium text-gray-500">Phone</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ user.phone }}</dd>
        </div>
        <div v-if="user.preferredLanguage">
          <dt class="text-sm font-medium text-gray-500">Preferred Language</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ user.preferredLanguage }}</dd>
        </div>
        <div v-if="user.timezone">
          <dt class="text-sm font-medium text-gray-500">Timezone</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ user.timezone }}</dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Member Since</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ formatDate(user.createdAt) }}</dd>
        </div>
        <div v-if="user.lastLoginAt">
          <dt class="text-sm font-medium text-gray-500">Last Login</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ formatDate(user.lastLoginAt) }}</dd>
        </div>
      </div>

      <!-- Edit Profile Section -->
      <div v-if="editable" class="mt-6 pt-4 border-t border-gray-200">
        <div class="flex justify-between items-center">
          <h4 class="text-sm font-medium text-gray-900">Profile Settings</h4>
          <button
            @click="isEditing = !isEditing"
            class="text-sm text-blue-600 hover:text-blue-800"
          >
            {{ isEditing ? 'Cancel' : 'Edit Profile' }}
          </button>
        </div>

        <!-- Edit Form -->
        <form v-if="isEditing" @submit.prevent="saveProfile" class="mt-4 space-y-4">
          <div>
            <label for="fullName" class="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              id="fullName"
              v-model="editForm.fullName"
              type="text"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
            <input
              id="phone"
              v-model="editForm.phone"
              type="tel"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label for="preferredLanguage" class="block text-sm font-medium text-gray-700">Preferred Language</label>
            <input
              id="preferredLanguage"
              v-model="editForm.preferredLanguage"
              type="text"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label for="timezone" class="block text-sm font-medium text-gray-700">Timezone</label>
            <input
              id="timezone"
              v-model="editForm.timezone"
              type="text"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="isEditing = false"
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {{ loading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { userService } from '../services/user.service';
import UserRoleBadge from './UserRoleBadge.vue';
import type { User, UserProfile } from '../types/user.types';

// Props
interface Props {
  editable?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  editable: true
});

// State
const user = ref<User | null>(null);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const isEditing = ref<boolean>(false);

// Profile edit form state
const editForm = reactive<Partial<UserProfile>>({
  fullName: '',
  phone: '',
  preferredLanguage: '',
  timezone: ''
});

// Computed properties
const userInitials = computed(() => {
  if (!user.value?.fullName) return '?';
  const names = user.value.fullName.split(' ');
  const first = names[0]?.charAt(0)?.toUpperCase() || '';
  const last = names[names.length - 1]?.charAt(0)?.toUpperCase() || '';
  return first + (names.length > 1 ? last : '');
});

// Methods
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

// Load user data (current user)
async function loadUser() {
  loading.value = true;
  error.value = null;
  
  try {
    user.value = await userService.getCurrentUser();
    
    // Populate edit form with current user data
    if (user.value) {
      editForm.fullName = user.value.fullName;
      editForm.phone = user.value.phone || '';
      editForm.preferredLanguage = user.value.preferredLanguage || '';
      editForm.timezone = user.value.timezone || '';
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load user profile';
    console.error('Error loading user:', err);
  } finally {
    loading.value = false;
  }
}

// Save profile changes
async function saveProfile() {
  if (!user.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const updated = await userService.updateCurrentUser(editForm);
    user.value = updated;
    isEditing.value = false;
  } catch (err: any) {
    error.value = err.message || 'Failed to update profile';
    console.error('Error updating profile:', err);
  } finally {
    loading.value = false;
  }
}

// Initialize component
onMounted(() => {
  loadUser();
});
</script>

<style scoped>
.user-profile {
  max-width: 800px;
}
</style>
