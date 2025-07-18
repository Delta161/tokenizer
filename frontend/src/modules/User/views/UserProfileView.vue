<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUser } from '../composables/useUser'
import UserProfileCard from '../components/UserProfileCard.vue'

// User composable
const { currentUser, fetchCurrentUser, updateCurrentUser } = useUser()

// State
const isLoading = ref(false)
const isEditing = ref(false)
const error = ref('')

// Fetch current user on mount
onMounted(async () => {
  try {
    isLoading.value = true
    await fetchCurrentUser()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load user profile'
  } finally {
    isLoading.value = false
  }
})

// Handle edit mode toggle
function toggleEditMode() {
  isEditing.value = !isEditing.value
}

// Handle profile update
async function handleUpdateProfile(profileData) {
  try {
    isLoading.value = true
    error.value = ''
    
    await updateCurrentUser({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      profile: profileData.profile
    })
    
    isEditing.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update profile'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="user-profile-view">
    <div class="page-header">
      <h1>My Profile</h1>
      <p class="page-description">View and manage your personal information</p>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div class="loading-state" v-if="isLoading && !currentUser">
      <div class="loading-spinner"></div>
      <p>Loading profile...</p>
    </div>
    
    <div v-else-if="currentUser" class="profile-container">
      <UserProfileCard 
        :user="currentUser" 
        :editable="true"
        :editing="isEditing"
        :loading="isLoading"
        @edit="toggleEditMode"
        @update="handleUpdateProfile"
        @cancel="isEditing = false"
      />
      
      <div class="profile-sections">
        <section class="profile-section">
          <h2>Account Information</h2>
          <div class="section-content">
            <div class="info-group">
              <h3>Email Address</h3>
              <p>{{ currentUser.email }}</p>
              <p class="info-note" v-if="currentUser.emailVerified">
                <span class="verified-badge">✓ Verified</span>
              </p>
              <p class="info-note" v-else>
                <span class="unverified-badge">Not verified</span>
                <button class="text-button">Resend verification email</button>
              </p>
            </div>
            
            <div class="info-group">
              <h3>Account Created</h3>
              <p>{{ new Date(currentUser.createdAt).toLocaleDateString() }}</p>
            </div>
            
            <div class="info-group">
              <h3>Last Login</h3>
              <p>{{ currentUser.lastLoginAt ? new Date(currentUser.lastLoginAt).toLocaleString() : 'N/A' }}</p>
            </div>
          </div>
        </section>
        
        <section class="profile-section">
          <h2>Security</h2>
          <div class="section-content">
            <div class="info-group">
              <h3>Password</h3>
              <p>••••••••</p>
              <button class="text-button">Change password</button>
            </div>
            
            <div class="info-group">
              <h3>Two-Factor Authentication</h3>
              <p v-if="currentUser.settings?.twoFactorEnabled">
                <span class="enabled-badge">Enabled</span>
              </p>
              <p v-else>
                <span class="disabled-badge">Disabled</span>
              </p>
              <button class="text-button">
                {{ currentUser.settings?.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA' }}
              </button>
            </div>
          </div>
        </section>
        
        <section class="profile-section">
          <h2>Connected Accounts</h2>
          <div class="section-content">
            <div class="connected-accounts">
              <div class="connected-account">
                <div class="account-icon google">G</div>
                <div class="account-info">
                  <h3>Google</h3>
                  <p v-if="currentUser.googleId">Connected</p>
                  <p v-else>Not connected</p>
                </div>
                <button class="text-button">
                  {{ currentUser.googleId ? 'Disconnect' : 'Connect' }}
                </button>
              </div>
              
              <div class="connected-account">
                <div class="account-icon microsoft">M</div>
                <div class="account-info">
                  <h3>Microsoft</h3>
                  <p v-if="currentUser.microsoftId">Connected</p>
                  <p v-else>Not connected</p>
                </div>
                <button class="text-button">
                  {{ currentUser.microsoftId ? 'Disconnect' : 'Connect' }}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <p>Unable to load profile information.</p>
      <button class="primary-button" @click="fetchCurrentUser">Retry</button>
    </div>
  </div>
</template>

<style scoped>
.user-profile-view {
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

.profile-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.profile-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
  background-color: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.profile-section h2 {
  padding: 1rem 1.5rem;
  margin: 0;
  font-size: 1.25rem;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-background-soft);
}

.section-content {
  padding: 1.5rem;
}

.info-group {
  margin-bottom: 1.5rem;
}

.info-group:last-child {
  margin-bottom: 0;
}

.info-group h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: var(--color-text-light);
}

.info-group p {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text);
}

.info-note {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.verified-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background-color: rgba(76, 175, 80, 0.15);
  color: #4caf50;
  border-radius: 4px;
  font-weight: 500;
}

.unverified-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background-color: rgba(255, 152, 0, 0.15);
  color: #ff9800;
  border-radius: 4px;
  font-weight: 500;
  margin-right: 0.5rem;
}

.enabled-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background-color: rgba(76, 175, 80, 0.15);
  color: #4caf50;
  border-radius: 4px;
  font-weight: 500;
}

.disabled-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background-color: rgba(158, 158, 158, 0.15);
  color: #9e9e9e;
  border-radius: 4px;
  font-weight: 500;
}

.text-button {
  background: none;
  border: none;
  padding: 0;
  margin-top: 0.5rem;
  color: var(--color-primary);
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
}

.text-button:hover {
  color: var(--color-primary-dark);
}

.connected-accounts {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.connected-account {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: var(--color-background-soft);
  border-radius: 4px;
}

.account-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  color: white;
  font-weight: 600;
  margin-right: 1rem;
}

.account-icon.google {
  background-color: #DB4437;
}

.account-icon.microsoft {
  background-color: #00A4EF;
}

.account-info {
  flex: 1;
}

.account-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.account-info p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-light);
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
  .profile-container {
    grid-template-columns: 1fr;
  }
}
</style>