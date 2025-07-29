<template>
  <div class="profile-page">
    <div class="profile-container">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading profile data...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <h2>Error Loading Profile</h2>
        <p>{{ error }}</p>
        <button @click="goToLogin" class="button">Back to Login</button>
      </div>
      
      <div v-else class="profile-content">
        <h1>User Profile</h1>
        
        <div class="profile-header">
          <div class="avatar" v-if="user.profileImage">
            <img :src="user.profileImage" alt="Profile Image" />
          </div>
          <div class="avatar avatar-placeholder" v-else>
            {{ getInitials(user.fullName || user.email) }}
          </div>
          
          <div class="user-info">
            <h2>{{ user.fullName || 'No Name' }}</h2>
            <p>{{ user.email }}</p>
          </div>
        </div>
        
        <div class="profile-details">
          <h3>Profile Details</h3>
          <pre class="json-data">{{ JSON.stringify(user, null, 2) }}</pre>
        </div>
        
        <div class="actions">
          <button @click="logout" class="button button-danger">Logout</button>
          <button @click="refreshProfile" class="button">Refresh Data</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../services/apiClient';
import { useAuthStore } from '../modules/Accounts';

interface User {
  id?: string;
  email?: string;
  fullName?: string;
  profileImage?: string;
  [key: string]: any;
}

const router = useRouter();
const loading = ref(true);
const error = ref<string | null>(null);
const user = ref<User>({});

// Function to get initials from name
function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

// Function to go back to login page
function goToLogin(): void {
  router.push('/login');
}

// Function to logout
async function logout(): Promise<void> {
  try {
    const authStore = useAuthStore();
    await authStore.logout();
    localStorage.removeItem('user');
    router.push('/login');
  } catch (err) {
    console.error('Logout error:', err);
    // Even if there's an error, redirect to login
    router.push('/login');
  }
}

// Function to refresh profile data
async function refreshProfile(): Promise<void> {
  loading.value = true;
  error.value = null;
  
  try {
    await fetchProfileData();
  } catch (err: any) {
    console.error('Error refreshing profile:', err);
    error.value = err.response?.data?.message || 'Failed to refresh profile data';
  } finally {
    loading.value = false;
  }
}

// Function to fetch profile data
async function fetchProfileData(): Promise<void> {
  try {
    const response = await apiClient.get('/auth/profile');
    
    if (response.data && response.data.user) {
      user.value = response.data.user;
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } else {
      throw new Error('Invalid response format');
    }
  } catch (err: any) {
    console.error('Error fetching profile:', err);
    
    // If 401 Unauthorized, the interceptor will handle the redirect
    if (err.response && err.response.status !== 401) {
      error.value = err.response?.data?.message || 'Failed to load profile data';
    }
    
    throw err;
  }
}

// Fetch profile data on mount
onMounted(async () => {
  try {
    await fetchProfileData();
  } catch (err) {
    // Error is already handled in fetchProfileData
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.profile-page {
  display: flex;
  justify-content: center;
  padding: 2rem;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.profile-container {
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.profile-content h1 {
  margin-bottom: 2rem;
  color: #333;
  text-align: center;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1.5rem;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #3498db;
  color: white;
  font-size: 2rem;
  font-weight: bold;
}

.user-info h2 {
  margin: 0;
  color: #333;
}

.user-info p {
  margin: 0.5rem 0 0;
  color: #666;
}

.profile-details {
  margin-bottom: 2rem;
}

.profile-details h3 {
  margin-bottom: 1rem;
  color: #333;
}

.json-data {
  background-color: #f8f8f8;
  padding: 1rem;
  border-radius: 4px;
  overflow: auto;
  font-family: monospace;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  justify-content: space-between;
}

.button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  background-color: #3498db;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #2980b9;
}

.button-danger {
  background-color: #e74c3c;
}

.button-danger:hover {
  background-color: #c0392b;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error h2 {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.error p {
  margin-bottom: 1.5rem;
  color: #666;
}
</style>