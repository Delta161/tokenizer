<template>
  <div class="p-8 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">User Profile Test - Refactored Components</h1>
    
    <!-- Test with mock user data -->
    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-lg font-semibold mb-4">Testing UserProfile Component</h2>
      
      <UserProfile 
        :user="mockUser"
        :editable="true"
        :loading="false"
        @update="handleUpdate"
        @edit-toggle="handleEditToggle"
      />
    </div>

    <!-- Test UserRoleBadge separately -->
    <div class="bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 class="text-lg font-semibold mb-4">Testing UserRoleBadge Component</h2>
      
      <div class="space-y-2">
        <div>
          <span class="mr-2">INVESTOR:</span>
          <UserRoleBadge role="INVESTOR" />
        </div>
        <div>
          <span class="mr-2">CLIENT:</span>
          <UserRoleBadge role="CLIENT" />
        </div>
        <div>
          <span class="mr-2">ADMIN:</span>
          <UserRoleBadge role="ADMIN" />
        </div>
      </div>
    </div>

    <!-- Display update events -->
    <div v-if="updateEvents.length > 0" class="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
      <h3 class="text-lg font-semibold text-green-800 mb-2">Update Events</h3>
      <ul class="space-y-1">
        <li v-for="(event, index) in updateEvents" :key="index" class="text-sm text-green-700">
          {{ event }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UserProfile from '../modules/Accounts/components/UserProfile.vue';
import UserRoleBadge from '../modules/Accounts/components/UserRoleBadge.vue';
import type { User } from '../modules/Accounts/types/user.types';

// Mock user data matching the refactored User interface
const mockUser = ref<User>({
  id: 'test-user-123',
  email: 'test@example.com',
  fullName: 'John Doe',
  role: 'INVESTOR',
  authProvider: 'GOOGLE',
  providerId: 'google-123',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  phone: '+1-555-0123',
  preferredLanguage: 'en',
  timezone: 'America/New_York',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString()
});

const updateEvents = ref<string[]>([]);

const handleUpdate = (profileData: any) => {
  updateEvents.value.push(`Profile updated: ${JSON.stringify(profileData)}`);
  console.log('Profile update:', profileData);
  
  // Update mock user data
  Object.assign(mockUser.value, profileData);
};

const handleEditToggle = (editing: boolean) => {
  updateEvents.value.push(`Edit mode toggled: ${editing ? 'ON' : 'OFF'}`);
  console.log('Edit toggle:', editing);
};
</script>
