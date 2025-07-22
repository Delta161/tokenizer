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

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';

const router = useRouter();
const loading = ref(true);
const error = ref(null);
const user = ref({});

// Function to get initials from name
function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

// Function to go back to login page
function goToLogin() {
  router.push('/login');
}

// Function to logout
async function logout() {
  try {
    await api.post('/accounts/auth/logout');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  } catch (err) {
    console.error('Logout error:', err);
    // Even if there's an error, redirect to login
    router.push('/login');
  }
}

// Function to refresh profile data
async function refreshProfile() {
  loading.value = true;
  error.value = null;
  
  try {
    await fetchProfileData();
  } catch (err) {
    console.error('Error refreshing profile:', err);
    error.value = err.response?.data?.message || 'Failed to refresh profile data';
  } finally {
    loading.value = false;
  }
}

// Function to fetch profile data
async function fetchProfileData() {
  try {
    const response = await api.get('/accounts/auth/profile');
    
    if (response.data && response.data.user) {
      user.value = response.data.user;
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } else {
      throw new Error('Invalid response format');
    }
  } catch (err) {
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

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  color: #e74c3c;
  text-align: center;
  padding: 2rem;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.avatar {
  width: 80px;
  height: 80px;
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
  font-size: 1.5rem;
  font-weight: bold;
}

.user-info {
  flex: 1;
}

.user-info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.user-info p {
  margin: 0;
  color: #666;
}

.profile-details {
  margin-bottom: 2rem;
}

.json-data {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow: auto;
  max-height: 300px;
  font-family: monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.button {
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
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
</style>