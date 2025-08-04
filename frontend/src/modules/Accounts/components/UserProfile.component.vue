<template>
  <section class="bg-white shadow rounded-lg overflow-hidden">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600">Loading profile...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-6 m-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error Loading Profile</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          <div class="mt-4">
            <button 
              @click="refreshProfile" 
              class="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded-md text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Form -->
    <form v-else-if="isEditing" @submit.prevent="saveProfile" class="p-6 space-y-6">
      <div class="border-b border-gray-200 pb-4">
        <h3 class="text-lg font-medium text-gray-900">Edit Profile</h3>
        <p class="mt-1 text-sm text-gray-600">Update your personal information and preferences.</p>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
          <input 
            id="firstName" 
            v-model="editForm.firstName" 
            required 
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
          <input 
            id="lastName" 
            v-model="editForm.lastName" 
            required 
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input 
          id="email" 
          v-model="editForm.email" 
          type="email" 
          required 
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label for="bio" class="block text-sm font-medium text-gray-700">Bio</label>
        <textarea 
          id="bio" 
          v-model="editForm.bio" 
          rows="3"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
          <input 
            id="location" 
            v-model="editForm.location" 
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="City, Country"
          />
        </div>
        <div>
          <label for="website" class="block text-sm font-medium text-gray-700">Website</label>
          <input 
            id="website" 
            v-model="editForm.website" 
            type="url" 
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="https://example.com"
          />
        </div>
      </div>

      <!-- Social Links -->
      <div class="space-y-4">
        <h4 class="text-lg font-medium text-gray-900">Social Links</h4>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label for="twitter" class="block text-sm font-medium text-gray-700">Twitter</label>
            <input 
              id="twitter" 
              v-model="editForm.socialLinks.twitter" 
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="@username"
            />
          </div>
          <div>
            <label for="linkedin" class="block text-sm font-medium text-gray-700">LinkedIn</label>
            <input 
              id="linkedin" 
              v-model="editForm.socialLinks.linkedin" 
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="username"
            />
          </div>
          <div>
            <label for="github" class="block text-sm font-medium text-gray-700">GitHub</label>
            <input 
              id="github" 
              v-model="editForm.socialLinks.github" 
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="username"
            />
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button 
          type="button" 
          @click="cancelEdit"
          class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          :disabled="loading"
          class="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="loading">Saving...</span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </form>

    <!-- Profile Display -->
    <div v-else class="p-6">
      <!-- Profile Header -->
      <div class="sm:flex sm:items-center sm:justify-between mb-6">
        <div class="sm:flex sm:items-center">
          <div class="flex-shrink-0">
            <div class="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span class="text-xl font-medium text-white">
                {{ getInitials(user?.firstName, user?.lastName) }}
              </span>
            </div>
          </div>
          <div class="mt-4 sm:mt-0 sm:ml-6">
            <h1 class="text-2xl font-bold text-gray-900">
              {{ user?.firstName }} {{ user?.lastName }}
            </h1>
            <p class="text-sm text-gray-500">{{ user?.email }}</p>
            <div v-if="user?.role" class="mt-1">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getRoleBadgeClasses(user.role)">
                {{ formatRole(user.role) }}
              </span>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-0 flex space-x-3">
          <button 
            v-if="editable" 
            @click="startEdit"
            class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Edit Profile
          </button>
          <button 
            @click="refreshProfile"
            class="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <!-- Profile Details -->
      <div class="border-t border-gray-200 pt-6">
        <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div v-if="user?.bio">
            <dt class="text-sm font-medium text-gray-500">Bio</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ user.bio }}</dd>
          </div>
          <div v-if="user?.location">
            <dt class="text-sm font-medium text-gray-500">Location</dt>
            <dd class="mt-1 text-sm text-gray-900 flex items-center">
              <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {{ user.location }}
            </dd>
          </div>
          <div v-if="user?.website">
            <dt class="text-sm font-medium text-gray-500">Website</dt>
            <dd class="mt-1 text-sm text-gray-900">
              <a :href="user.website" target="_blank" class="text-blue-600 hover:text-blue-500 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                {{ user.website }}
              </a>
            </dd>
          </div>
        </dl>

        <!-- Social Links -->
        <div v-if="hasSocialLinks" class="mt-6">
          <h3 class="text-sm font-medium text-gray-500 mb-3">Social Links</h3>
          <div class="flex space-x-4">
            <a 
              v-if="user?.socialLinks?.twitter" 
              :href="'https://twitter.com/' + user.socialLinks.twitter.replace('@', '')" 
              target="_blank"
              class="text-blue-400 hover:text-blue-500 flex items-center space-x-1 transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <span>Twitter</span>
            </a>
            <a 
              v-if="user?.socialLinks?.linkedin" 
              :href="'https://linkedin.com/in/' + user.socialLinks.linkedin" 
              target="_blank"
              class="text-blue-600 hover:text-blue-700 flex items-center space-x-1 transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>LinkedIn</span>
            </a>
            <a 
              v-if="user?.socialLinks?.github" 
              :href="'https://github.com/' + user.socialLinks.github" 
              target="_blank"
              class="text-gray-900 hover:text-gray-700 flex items-center space-x-1 transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <!-- Account Information -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <h3 class="text-sm font-medium text-gray-500 mb-4">Account Information</h3>
          <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            <div v-if="user?.createdAt">
              <dt class="text-xs font-medium text-gray-500">Member Since</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDate(user.createdAt) }}</dd>
            </div>
            <div v-if="user?.updatedAt">
              <dt class="text-xs font-medium text-gray-500">Last Updated</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDate(user.updatedAt) }}</dd>
            </div>
          </dl>
        </div>

        <!-- Raw Data Section (for development/debugging) -->
        <div v-if="showRawData" class="mt-8 pt-6 border-t border-gray-200">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-medium text-gray-500">Raw Profile Data</h3>
            <button 
              @click="showRawData = false"
              class="text-xs text-gray-400 hover:text-gray-600"
            >
              Hide
            </button>
          </div>
          <pre class="bg-gray-50 p-4 rounded-md text-xs text-gray-800 overflow-auto max-h-64">{{ JSON.stringify(user, null, 2) }}</pre>
        </div>

        <!-- Toggle Raw Data Button -->
        <div class="mt-6 pt-4 border-t border-gray-200">
          <button 
            @click="showRawData = !showRawData"
            class="text-xs text-gray-400 hover:text-gray-600"
          >
            {{ showRawData ? 'Hide' : 'Show' }} Raw Data
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { UserService } from '../services/userService';
import type { User, UserProfile } from '../types/userTypes';

// Props
interface Props {
  userId?: string;
  editable?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  editable: true
});

// Service instance - following instructions: "All communication between frontend and backend must happen through the Standardized API Client"
const userService = new UserService();

// State
const user = ref<User | null>(null);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const isEditing = ref<boolean>(false);
const showRawData = ref<boolean>(false);

// Form state
interface EditFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

const editForm = reactive<EditFormData>({
  firstName: '',
  lastName: '',
  email: '',
  bio: '',
  location: '',
  website: '',
  socialLinks: {
    twitter: '',
    linkedin: '',
    github: ''
  }
});

// Computed properties
const hasSocialLinks = computed(() => {
  return user.value?.socialLinks?.twitter || 
         user.value?.socialLinks?.linkedin || 
         user.value?.socialLinks?.github;
});

// Methods
function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last || '?';
}

function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

function getRoleBadgeClasses(role: string): string {
  const roleMap: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    investor: 'bg-blue-100 text-blue-800',
    client: 'bg-green-100 text-green-800',
    user: 'bg-gray-100 text-gray-800'
  };
  return roleMap[role.toLowerCase()] || roleMap.user;
}

function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function startEdit(): void {
  if (user.value) {
    editForm.firstName = user.value.firstName;
    editForm.lastName = user.value.lastName;
    editForm.email = user.value.email;
    editForm.bio = user.value.bio ?? '';
    editForm.location = user.value.location ?? '';
    editForm.website = user.value.website ?? '';
    editForm.socialLinks = {
      twitter: user.value.socialLinks?.twitter ?? '',
      linkedin: user.value.socialLinks?.linkedin ?? '',
      github: user.value.socialLinks?.github ?? ''
    };
  }
  isEditing.value = true;
}

function cancelEdit(): void {
  isEditing.value = false;
}

async function saveProfile(): Promise<void> {
  if (!user.value) return;
  
  try {
    loading.value = true;
    error.value = null;
    
    let updated: User;
    if (props.userId) {
      // Admin updating another user
      updated = await userService.updateUser(props.userId, editForm as any);
    } else {
      // User updating their own profile
      updated = await userService.updateCurrentUser(editForm);
    }
    
    user.value = updated;
    isEditing.value = false;
  } catch (err: any) {
    error.value = err?.message || 'Failed to update profile';
  } finally {
    loading.value = false;
  }
}

async function refreshProfile(): Promise<void> {
  try {
    loading.value = true;
    error.value = null;
    
    if (props.userId) {
      user.value = await userService.getUserById(props.userId);
    } else {
      user.value = await userService.getCurrentUser();
    }
  } catch (err: any) {
    error.value = err?.message || 'Failed to refresh profile';
  } finally {
    loading.value = false;
  }
}

// Load user data on component mount
onMounted(async () => {
  try {
    // For development: Set a simple test token if none exists
    if (!localStorage.getItem('accessToken')) {
      console.log('🔐 No auth token found, setting development token...');
      localStorage.setItem('accessToken', 'dev-test-token-12345');
      localStorage.setItem('tokenExpiresAt', (Date.now() + 3600000).toString()); // 1 hour from now
    }
    
    console.log('👤 Loading user profile...');
    if (props.userId) {
      console.log('📍 Loading user by ID:', props.userId);
      user.value = await userService.getUserById(props.userId);
    } else {
      console.log('📍 Loading current user profile...');
      user.value = await userService.getCurrentUser();
    }
    console.log('✅ User profile loaded:', user.value);
  } catch (err: any) {
    console.error('❌ Error loading user profile:', err);
    error.value = err?.message || 'Failed to load user profile';
  } finally {
    loading.value = false;
  }
});
</script>
