<template>
  <div class="user-view">
    <!-- Profile Mode (default) -->
    <div v-if="currentMode === 'profile'" class="profile-section">
      <div class="min-h-screen bg-gray-50 py-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Page Header -->
          <div class="mb-8 flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">
                {{ viewingUserId ? 'User Profile' : 'My Profile' }}
              </h1>
              <p class="mt-2 text-gray-600">
                {{ viewingUserId ? 'View user account information' : 'Manage your account information and preferences' }}
              </p>
            </div>
            
            <!-- Mode switcher for admins -->
            <div v-if="isAdmin" class="flex space-x-2">
              <button 
                @click="switchMode('profile')"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-md',
                  currentMode === 'profile' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                ]"
              >
                Profile
              </button>
              <button 
                @click="switchMode('settings')"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-md',
                  currentMode === 'settings' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                ]"
              >
                Settings
              </button>
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="loading" class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ error }}
          </div>

          <!-- Profile content -->
          <template v-else>
            <UserComponent :userId="viewingUserId" :editable="isEditable" />

            <!-- Actions (only show for current user's profile) -->
            <div v-if="!viewingUserId" class="mt-8 flex justify-between">
              <button 
                @click="logout" 
                class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Settings Mode -->
    <div v-else-if="currentMode === 'settings'" class="settings-section">
      <div class="min-h-screen bg-gray-50 py-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-2xl font-bold mb-6">User Settings</h1>
          
          <div v-if="settingsLoading" class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
          
          <div v-else-if="settingsError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {{ settingsError }}
          </div>
          
          <template v-else>
            <UserComponent 
              v-if="currentUser" 
              :user="currentUser" 
              mode="settings"
              @update="handleSettingsUpdate" 
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUser } from '../composables/useUser';
import { useAuthStore } from '../../../stores/auth';
import UserComponent from '../components/user.component.vue';
import type { UserSettings } from '../types/user.types';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// User composable
const { 
  loading, 
  error, 
  currentUser, 
  isAdmin,
  fetchCurrentUser,
  updateUserSettings
} = useUser();

// Mode management
const currentMode = ref('profile');
type ViewMode = 'profile' | 'settings';

// Individual loading states for each mode
const settingsLoading = ref(false);
const settingsError = ref<string | null>(null);

// Computed properties
const viewingUserId = computed(() => {
  const idParam = route.params.id;
  return typeof idParam === 'string' ? idParam : undefined;
});

const isEditable = computed(() => {
  // Current user can edit their own profile, admins can edit any profile
  return !viewingUserId.value || (isAdmin.value && !!viewingUserId.value);
});

// Initialize component
onMounted(async () => {
  // Determine initial mode based on route
  if (route.path.includes('/settings')) {
    currentMode.value = 'settings';
  } else {
    currentMode.value = 'profile';
  }

  // Load initial data
  await loadDataForMode();
});

const loadDataForMode = async () => {
  try {
    switch (currentMode.value) {
      case 'profile':
        await fetchCurrentUser();
        break;
      case 'settings':
        await loadSettings();
        break;
    }
  } catch (error) {
    console.error('Error loading data for mode:', currentMode.value, error);
  }
};

const loadSettings = async () => {
  try {
    settingsLoading.value = true;
    settingsError.value = null;
    await fetchCurrentUser();
  } catch (err) {
    settingsError.value = err instanceof Error ? err.message : 'Failed to load settings';
  } finally {
    settingsLoading.value = false;
  }
};

const switchMode = (mode: ViewMode) => {
  currentMode.value = mode;
  loadDataForMode();

  // Update route if necessary
  switch (mode) {
    case 'profile':
      router.push('/account/profile');
      break;
    case 'settings':
      router.push('/account/settings');
      break;
  }
};

const handleSettingsUpdate = async (settingsData: Partial<UserSettings>) => {
  if (currentUser.value) {
    try {
      await updateUserSettings(currentUser.value.id, settingsData);
      await fetchCurrentUser();
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }
};

const logout = () => {
  authStore.logout();
  router.push('/auth');
};
</script>

<style scoped>
.user-view {
  min-height: 100vh;
  background-color: var(--color-background);
}

.profile-section,
.settings-section {
  width: 100%;
}

/* Animation classes */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Button and interactive element styles */
button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Hover effects */
.hover\:bg-gray-50:hover {
  background-color: rgb(249 250 251);
}

.hover\:bg-red-700:hover {
  background-color: rgb(185 28 28);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .flex.space-x-2 > * + * {
    margin-left: 0;
    margin-top: 0.5rem;
  }
  
  .sm\:px-6 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 768px) {
  .flex.space-x-2 > * + * {
    margin-left: 0.5rem;
    margin-top: 0;
  }
}

@media (min-width: 1024px) {
  .lg\:px-8 {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}
</style>
