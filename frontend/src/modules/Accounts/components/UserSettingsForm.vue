<template>
  <div class="user-settings-form bg-white rounded-lg shadow-md overflow-hidden">
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
                  v-model="form.notifications.email" 
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
                  v-model="form.notifications.push" 
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
                  v-model="form.notifications.sms" 
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
              v-model="form.theme" 
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
              v-model="form.language" 
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
                  v-model="form.twoFactorEnabled" 
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
            @click="resetForm" 
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
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useUser } from '../composables/useUser';
import type { User, UserSettings } from '../types/userTypes';

const props = defineProps<{
  user: User;
}>();

const emit = defineEmits<{
  (e: 'update', settings: Partial<UserSettings>): void;
}>();

const { loading } = useUser();

// Initialize form with user settings or defaults
const form = reactive({
  notifications: {
    email: true,
    push: false,
    sms: false,
    ...props.user.notifications
  },
  theme: 'system' as 'light' | 'dark' | 'system',
  language: 'en',
  twoFactorEnabled: false,
  ...props.user
});

function resetForm() {
  // Reset form to initial values
  form.notifications.email = props.user.notifications?.email ?? true;
  form.notifications.push = props.user.notifications?.push ?? false;
  form.notifications.sms = props.user.notifications?.sms ?? false;
  form.theme = props.user.theme || 'system';
  form.language = props.user.language || 'en';
  form.twoFactorEnabled = props.user.twoFactorEnabled || false;
}

function saveSettings() {
  const settingsData: Partial<UserSettings> = {
    notifications: {
      email: form.notifications.email,
      push: form.notifications.push,
      sms: form.notifications.sms
    },
    theme: form.theme,
    language: form.language,
    twoFactorEnabled: form.twoFactorEnabled
  };
  
  emit('update', settingsData);
}
</script>