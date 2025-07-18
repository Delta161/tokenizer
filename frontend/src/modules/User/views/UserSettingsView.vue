<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUser } from '../composables/useUser'
import UserSettingsForm from '../components/UserSettingsForm.vue'

// User composable
const { currentUser, fetchCurrentUser, updateCurrentUser } = useUser()

// State
const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')

// Fetch current user on mount
onMounted(async () => {
  try {
    isLoading.value = true
    await fetchCurrentUser()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load user settings'
  } finally {
    isLoading.value = false
  }
})

// Handle settings update
async function handleSaveSettings(settings) {
  try {
    isLoading.value = true
    error.value = ''
    successMessage.value = ''
    
    await updateCurrentUser({ settings })
    
    successMessage.value = 'Settings saved successfully!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save settings'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="user-settings-view">
    <div class="page-header">
      <h1>Settings</h1>
      <p class="page-description">Manage your account settings and preferences</p>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    
    <div class="loading-state" v-if="isLoading && !currentUser">
      <div class="loading-spinner"></div>
      <p>Loading settings...</p>
    </div>
    
    <div v-else-if="currentUser" class="settings-container">
      <div class="settings-sidebar">
        <nav class="settings-nav">
          <ul class="nav-list">
            <li class="nav-item active">
              <a href="#general">General</a>
            </li>
            <li class="nav-item">
              <a href="#notifications">Notifications</a>
            </li>
            <li class="nav-item">
              <a href="#appearance">Appearance</a>
            </li>
            <li class="nav-item">
              <a href="#security">Security</a>
            </li>
            <li class="nav-item">
              <a href="#privacy">Privacy</a>
            </li>
          </ul>
        </nav>
      </div>
      
      <div class="settings-content">
        <UserSettingsForm 
          :initial-settings="currentUser.settings" 
          :loading="isLoading"
          @save="handleSaveSettings"
        />
      </div>
    </div>
    
    <div v-else class="empty-state">
      <p>Unable to load settings information.</p>
      <button class="primary-button" @click="fetchCurrentUser">Retry</button>
    </div>
  </div>
</template>

<style scoped>
.user-settings-view {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin-bottom: 0.5rem;
  font-size: 1.75rem;
  color: var(--color-heading);
}

.page-description {
  color: var(--color-text-light);
}

.error-message {
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border-radius: 4px;
  font-weight: 500;
}

.success-message {
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  background-color: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border-radius: 4px;
  font-weight: 500;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(var(--color-primary-rgb), 0.3);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.settings-container {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
}

.settings-sidebar {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.settings-nav {
  background-color: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  border-bottom: 1px solid var(--color-border);
}

.nav-item:last-child {
  border-bottom: none;
}

.nav-item a {
  display: block;
  padding: 1rem 1.5rem;
  color: var(--color-text);
  text-decoration: none;
  transition: background-color 0.2s;
}

.nav-item a:hover {
  background-color: var(--color-background-soft);
}

.nav-item.active a {
  background-color: var(--color-background-soft);
  color: var(--color-primary);
  font-weight: 600;
  border-left: 3px solid var(--color-primary);
}

.settings-content {
  background-color: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 2rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  text-align: center;
}

.primary-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

.primary-button:hover {
  background-color: var(--color-primary-dark);
}

/* Responsive styles */
@media (max-width: 768px) {
  .settings-container {
    grid-template-columns: 1fr;
  }
  
  .settings-sidebar {
    position: static;
    margin-bottom: 1.5rem;
  }
  
  .nav-list {
    display: flex;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
  }
  
  .nav-list::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge */
  }
  
  .nav-item {
    border-bottom: none;
    border-right: 1px solid var(--color-border);
  }
  
  .nav-item:last-child {
    border-right: none;
  }
  
  .nav-item.active a {
    border-left: none;
    border-bottom: 3px solid var(--color-primary);
  }
}

@media (max-width: 576px) {
  .settings-content {
    padding: 1.5rem 1rem;
  }
}
</style>