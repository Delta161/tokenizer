<template>
  <div class="user-profile-section bg-white rounded-lg shadow-md overflow-hidden">
    <div class="p-6">
      <div class="flex items-center mb-6">
        <div class="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl mr-4">
          {{ user.firstName?.charAt(0) }}{{ user.lastName?.charAt(0) }}
        </div>
        
        <div>
          <h2 class="text-xl font-semibold">{{ user.firstName }} {{ user.lastName }}</h2>
          <div class="flex items-center mt-1">
            <UserRoleBadge :role="user.role" />
            <span class="ml-4 text-gray-500">{{ user.email }}</span>
          </div>
        </div>
        
        <button 
          v-if="editable" 
          @click="toggleEditMode" 
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
          
          <div v-if="user.socialLinks && Object.values(user.socialLinks).some(Boolean)">
            <h3 class="text-sm font-medium text-gray-500">Social Links</h3>
            <div class="flex space-x-3 mt-1">
              <a 
                v-if="user.socialLinks?.twitter" 
                :href="`https://twitter.com/${user.socialLinks.twitter}`" 
                target="_blank"
                class="text-blue-400 hover:text-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              
              <a 
                v-if="user.socialLinks?.linkedin" 
                :href="`https://linkedin.com/in/${user.socialLinks.linkedin}`" 
                target="_blank"
                class="text-blue-600 hover:text-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              
              <a 
                v-if="user.socialLinks?.github" 
                :href="`https://github.com/${user.socialLinks.github}`" 
                target="_blank"
                class="text-gray-800 hover:text-gray-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <form v-else @submit.prevent="saveProfile" class="space-y-4">
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
          
          <div v-if="isAdmin">
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
          
          <div>
            <label for="twitter" class="block text-sm font-medium text-gray-700">Twitter Username</label>
            <div class="mt-1 flex rounded-md shadow-sm">
              <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">@</span>
              <input 
                id="twitter" 
                v-model="form.socialLinks.twitter" 
                type="text" 
                class="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              />
            </div>
          </div>
          
          <div>
            <label for="linkedin" class="block text-sm font-medium text-gray-700">LinkedIn Username</label>
            <input 
              id="linkedin" 
              v-model="form.socialLinks.linkedin" 
              type="text" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label for="github" class="block text-sm font-medium text-gray-700">GitHub Username</label>
            <input 
              id="github" 
              v-model="form.socialLinks.github" 
              type="text" 
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
import { ref, computed, reactive } from 'vue';
import { useUser } from '@/modules/Accounts/composables/useUser';
import UserRoleBadge from '@/modules/Accounts/components/UserRoleBadge.vue';
import type { User, UserProfile, UserRole } from '@/modules/Accounts/types/userTypes';

const props = defineProps<{
  user: User;
  editable?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update', profile: Partial<UserProfile>): void;
}>();

const { loading, isAdmin } = useUser();
const isEditing = ref(false);

const form = reactive({
  firstName: props.user.firstName,
  lastName: props.user.lastName,
  email: props.user.email,
  role: props.user.role,
  bio: props.user.bio || '',
  location: props.user.location || '',
  website: props.user.website || '',
  socialLinks: {
    twitter: props.user.socialLinks?.twitter || '',
    linkedin: props.user.socialLinks?.linkedin || '',
    github: props.user.socialLinks?.github || ''
  }
});

function toggleEditMode() {
  isEditing.value = !isEditing.value;
  
  if (isEditing.value) {
    // Reset form to current user data
    form.firstName = props.user.firstName;
    form.lastName = props.user.lastName;
    form.email = props.user.email;
    form.role = props.user.role;
    form.bio = props.user.bio || '';
    form.location = props.user.location || '';
    form.website = props.user.website || '';
    form.socialLinks.twitter = props.user.socialLinks?.twitter || '';
    form.socialLinks.linkedin = props.user.socialLinks?.linkedin || '';
    form.socialLinks.github = props.user.socialLinks?.github || '';
  }
}

function cancelEdit() {
  isEditing.value = false;
}

function saveProfile() {
  const profileData: Partial<UserProfile> = {
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    role: form.role,
    bio: form.bio || undefined,
    location: form.location || undefined,
    website: form.website || undefined,
    socialLinks: {
      twitter: form.socialLinks.twitter || undefined,
      linkedin: form.socialLinks.linkedin || undefined,
      github: form.socialLinks.github || undefined
    }
  };
  
  // Remove socialLinks if all are empty
  if (!Object.values(profileData.socialLinks as any).some(Boolean)) {
    delete profileData.socialLinks;
  }
  
  emit('update', profileData);
  isEditing.value = false;
}

function formatRole(role: UserRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
</script>