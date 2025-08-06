<template>
  <section class="bg-white shadow rounded-lg overflow-hidden">
    <!-- Debug Information (Remove in production) -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 m-6">
      <h3 class="text-sm font-medium text-blue-800">Debug Information</h3>
      <div class="mt-2 text-xs text-blue-700 space-y-1">
        <p>Loading: {{ loading }}</p>
        <p>Error: {{ error || 'None' }}</p>
        <p>Auth User: {{ authUser ? 'Present' : 'Null' }}</p>
        <p>Auth Email: {{ authUser?.email || 'No email' }}</p>
        <p>Store User: {{ storeUser ? 'Present' : 'Null' }}</p>
        <p>Store Email: {{ storeUser?.email || 'No email' }}</p>
        <p>Current User: {{ user ? 'Present' : 'Null' }}</p>
        <p>User Email: {{ user?.email || 'No email' }}</p>
        <p>Is Authenticated: {{ authStore.isAuthenticated }}</p>
      </div>
      <button 
        @click="loadUserProfile"
        class="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
      >
        Reload Profile
      </button>
    </div>

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
              @click="loadUserProfile" 
              class="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded-md text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Display -->
    <div v-else-if="user && !loading" class="user-profile-display">
      <!-- Profile Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
        <div class="flex items-center">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <img 
              v-if="user.avatarUrl" 
              :src="user.avatarUrl" 
              :alt="user.fullName || 'User Avatar'"
              class="h-16 w-16 rounded-full border-4 border-white shadow-lg"
            >
            <div 
              v-else 
              class="h-16 w-16 rounded-full bg-gray-300 border-4 border-white shadow-lg flex items-center justify-center"
            >
              <span class="text-xl font-semibold text-gray-600">
                {{ getUserInitials() }}
              </span>
            </div>
          </div>
          
          <!-- User Info -->
          <div class="ml-4">
            <h1 class="text-2xl font-bold text-white">
              {{ user.fullName || 'User Profile' }}
            </h1>
            <p class="text-blue-100">{{ user.email }}</p>
            <p class="text-blue-200 text-sm">Role: {{ user.role }}</p>
          </div>
        </div>
      </div>

      <!-- Profile Details -->
      <div class="px-6 py-4">
        <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-medium text-gray-500">Email Address</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ user.email }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Full Name</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ user.fullName || 'Not provided' }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Role</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ user.role }}</dd>
          </div>
          <div v-if="user.authProvider">
            <dt class="text-sm font-medium text-gray-500">Auth Provider</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ user.authProvider }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- No User State -->
    <div v-else-if="!loading" class="text-center py-12 m-6">
      <h3 class="text-lg font-medium text-gray-900">No Profile Data</h3>
      <p class="mt-1 text-sm text-gray-500">Unable to load user profile information.</p>
      <button 
        @click="loadUserProfile"
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Load Profile
      </button>
    </div>

    <!-- Settings Form (when in settings mode) -->
    <div v-else-if="mode === 'settings'" class="user-settings-form">
      <form @submit.prevent="saveSettings" class="p-6 space-y-6">
        <div>
          <h3 class="text-lg font-medium leading-6 text-gray-900">Account Settings</h3>
          <p class="mt-1 text-sm text-gray-500">Manage your account settings and preferences.</p>
        </div>
        
        <div class="space-y-6">
          <div>
            <h4 class="text-sm font-medium text-gray-900">Email Notifications</h4>
            <p class="text-sm text-gray-500">Choose what types of notifications you want to receive.</p>
            
            <div class="mt-4 space-y-4">
              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input 
                    id="email-notifications" 
                    v-model="settingsForm.notifications.email" 
                    type="checkbox" 
                    class="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div class="ml-3 text-sm">
                  <label for="email-notifications" class="font-medium text-gray-700">Email Notifications</label>
                  <p class="text-gray-500">Receive email notifications about account activity.</p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input 
                    id="push-notifications" 
                    v-model="settingsForm.notifications.push" 
                    type="checkbox" 
                    class="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div class="ml-3 text-sm">
                  <label for="push-notifications" class="font-medium text-gray-700">Push Notifications</label>
                  <p class="text-gray-500">Receive push notifications in your browser.</p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input 
                    id="sms-notifications" 
                    v-model="settingsForm.notifications.sms" 
                    type="checkbox" 
                    class="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div class="ml-3 text-sm">
                  <label for="sms-notifications" class="font-medium text-gray-700">SMS Notifications</label>
                  <p class="text-gray-500">Receive text message notifications (requires phone number).</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="pt-6 border-t border-gray-200">
            <h4 class="text-sm font-medium text-gray-900">Appearance</h4>
            <p class="text-sm text-gray-500">Customize how the application looks for you.</p>
            
            <div class="mt-4">
              <label for="theme" class="block text-sm font-medium text-gray-700">Theme</label>
              <select 
                id="theme" 
                v-model="settingsForm.theme" 
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </select>
            </div>
          </div>
          
          <div class="pt-6 border-t border-gray-200">
            <h4 class="text-sm font-medium text-gray-900">Language</h4>
            <p class="text-sm text-gray-500">Choose your preferred language for the application.</p>
            
            <div class="mt-4">
              <label for="language" class="block text-sm font-medium text-gray-700">Language</label>
              <select 
                id="language" 
                v-model="settingsForm.language" 
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
          </div>
          
          <div class="pt-6 border-t border-gray-200">
            <h4 class="text-sm font-medium text-gray-900">Security</h4>
            <p class="text-sm text-gray-500">Manage your account security settings.</p>
            
            <div class="mt-4">
              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input 
                    id="two-factor" 
                    v-model="settingsForm.twoFactorEnabled" 
                    type="checkbox" 
                    class="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div class="ml-3 text-sm">
                  <label for="two-factor" class="font-medium text-gray-700">Two-Factor Authentication</label>
                  <p class="text-gray-500">Add an extra layer of security to your account.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="pt-5">
          <div class="flex justify-end">
            <button 
              type="button" 
              @click="resetSettingsForm" 
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Reset
            </button>
            <button 
              type="submit" 
              class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
        </div>
      </form>
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
import { userService } from '../services/user.service';
import { useAuthStore } from '../stores/auth.store';
import { useUserStore } from '../stores/user.store';
import type { User, UserProfile, UserSettings } from '../types/user.types';

// Props
interface Props {
  userId?: string;
  editable?: boolean;
  mode?: 'profile' | 'settings'; // New prop to control component mode
}
const props = withDefaults(defineProps<Props>(), {
  editable: true,
  mode: 'profile'
});

// Emits
const emit = defineEmits<{
  (e: 'update', settings: Partial<UserSettings>): void;
}>();

// Stores
const authStore = useAuthStore();
const userStore = useUserStore();

// State
const user = ref<User | null>(null);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const isEditing = ref<boolean>(false);
const showRawData = ref<boolean>(false);

// Computed properties for debugging
const authUser = computed(() => authStore.user);
const storeUser = computed(() => userStore.currentUser);

// Profile edit form state - extended to match template fields
interface EditFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
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

// Settings form state (merged from UserSettingsForm)
const settingsForm = reactive({
  notifications: {
    email: true,
    push: false,
    sms: false
  },
  theme: 'system' as 'light' | 'dark' | 'system',
  language: 'en',
  twoFactorEnabled: false
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
const loadUserProfile = async (): Promise<void> => {
  try {
    console.log('🔄 Loading user profile...');
    loading.value = true;
    error.value = null;
    
    // Try to get user from auth store first
    console.log('🔍 Checking auth store...');
    const isAuthenticated = await authStore.checkAuth();
    console.log('🔐 Authentication status:', isAuthenticated);
    
    if (isAuthenticated && authStore.user) {
      console.log('✅ User found in auth store:', authStore.user);
      user.value = authStore.user;
      return;
    }
    
    // If not in auth store, try user service
    console.log('🔍 Fetching from user service...');
    user.value = await userService.getCurrentUser();
    console.log('📊 User service result:', user.value);
    
  } catch (err) {
    console.error('❌ Failed to load user profile:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load profile';
  } finally {
    loading.value = false;
  }
};

const getUserInitials = (): string => {
  if (!user.value?.fullName) return 'U';
  return user.value.fullName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last || 'U';
};

const hasSocialLinks = computed(() => {
  return user.value && (
    (user.value as any).socialLinks?.twitter ||
    (user.value as any).socialLinks?.linkedin ||
    (user.value as any).socialLinks?.github
  );
});

function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

function getRoleBadgeClasses(role: string): string {
  const roleMap: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    CLIENT: 'bg-blue-100 text-blue-800',
    INVESTOR: 'bg-green-100 text-green-800'
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

// Profile editing methods
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

// Settings methods (merged from UserSettingsForm)
function resetSettingsForm(): void {
  if (user.value) {
    settingsForm.notifications.email = user.value.notifications?.email ?? true;
    settingsForm.notifications.push = user.value.notifications?.push ?? false;
    settingsForm.notifications.sms = user.value.notifications?.sms ?? false;
    settingsForm.theme = (user.value as any).theme || 'system';
    settingsForm.language = (user.value as any).language || 'en';
    settingsForm.twoFactorEnabled = (user.value as any).twoFactorEnabled || false;
  }
}

function saveSettings(): void {
  const settingsData: Partial<UserSettings> = {
    notifications: {
      email: settingsForm.notifications.email,
      push: settingsForm.notifications.push,
      sms: settingsForm.notifications.sms
    },
    theme: settingsForm.theme,
    language: settingsForm.language,
    twoFactorEnabled: settingsForm.twoFactorEnabled
  };
  
  emit('update', settingsData);
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
    
    // Initialize settings form when user data is loaded
    if (props.mode === 'settings' && user.value) {
      resetSettingsForm();
    }
  } catch (err: any) {
    error.value = err?.message || 'Failed to refresh profile';
  } finally {
    loading.value = false;
  }
}

// Load user data on component mount
onMounted(async () => {
  console.log('🎯 User component mounted');
  await loadUserProfile();
});
</script>
