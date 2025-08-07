<template>
  <div class="user-detail-view">
    <!-- Header -->
    <div class="header">
      <button @click="goBack" class="btn btn-secondary">
        <i class="icon-arrow-left"></i>
        Back to Users
      </button>
      
      <div class="header-actions">
        <button 
          @click="toggleEdit"
          class="btn btn-primary"
          :disabled="loading"
        >
          <i :class="isEditing ? 'icon-x' : 'icon-edit'"></i>
          {{ isEditing ? 'Cancel' : 'Edit User' }}
        </button>
        
        <button 
          v-if="!isCurrentUser"
          @click="confirmDelete"
          class="btn btn-danger"
          :disabled="loading"
        >
          <i class="icon-trash"></i>
          Delete User
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !user" class="loading">
      <div class="spinner"></div>
      <p>Loading user details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !user" class="error">
      <div class="error-icon">⚠️</div>
      <h3>Error Loading User</h3>
      <p>{{ error }}</p>
      <button @click="loadUser" class="btn btn-primary">
        Try Again
      </button>
    </div>

    <!-- User Details -->
    <div v-else-if="user" class="user-details">
      
      <!-- Profile Section -->
      <div class="section profile-section">
        <div class="section-header">
          <h2>Profile Information</h2>
        </div>
        
        <div class="profile-content">
          <!-- Avatar -->
          <div class="avatar-section">
            <div class="avatar-container">
              <img 
                v-if="user.avatarUrl" 
                :src="user.avatarUrl" 
                :alt="user.fullName"
                class="avatar large"
              />
              <div v-else class="avatar-placeholder large">
                {{ getInitials(user.fullName) }}
              </div>
            </div>
            
            <div v-if="isEditing" class="avatar-actions">
              <button class="btn btn-sm btn-secondary">
                <i class="icon-upload"></i>
                Change Avatar
              </button>
            </div>
          </div>

          <!-- Basic Information -->
          <div class="info-grid">
            <div class="info-item">
              <label>Full Name</label>
              <input 
                v-if="isEditing"
                v-model="editForm.fullName"
                type="text"
                class="input"
                :class="{ 'error': editErrors.fullName }"
              />
              <p v-else class="value">{{ user.fullName }}</p>
              <span v-if="editErrors.fullName" class="error-text">{{ editErrors.fullName }}</span>
            </div>

            <div class="info-item">
              <label>Email</label>
              <input 
                v-if="isEditing"
                v-model="editForm.email"
                type="email"
                class="input"
                :class="{ 'error': editErrors.email }"
              />
              <p v-else class="value">{{ user.email }}</p>
              <span v-if="editErrors.email" class="error-text">{{ editErrors.email }}</span>
            </div>

            <div class="info-item">
              <label>Role</label>
              <select 
                v-if="isEditing && !isCurrentUser"
                v-model="editForm.role"
                class="select"
              >
                <option value="INVESTOR">Investor</option>
                <option value="CLIENT">Client</option>
                <option value="ADMIN">Admin</option>
              </select>
              <div v-else class="value">
                <UserRoleBadge :role="user.role" />
              </div>
            </div>

            <div class="info-item">
              <label>Phone</label>
              <input 
                v-if="isEditing"
                v-model="editForm.phone"
                type="tel"
                class="input"
                placeholder="Enter phone number"
              />
              <p v-else class="value">{{ user.phone || 'Not provided' }}</p>
            </div>

            <div class="info-item">
              <label>Preferred Language</label>
              <select 
                v-if="isEditing"
                v-model="editForm.preferredLanguage"
                class="select"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
              <p v-else class="value">{{ getLanguageName(user.preferredLanguage) }}</p>
            </div>

            <div class="info-item">
              <label>Timezone</label>
              <select 
                v-if="isEditing"
                v-model="editForm.timezone"
                class="select"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">GMT</option>
                <option value="Europe/Paris">CET</option>
              </select>
              <p v-else class="value">{{ user.timezone || 'UTC' }}</p>
            </div>
          </div>
        </div>

        <!-- Save/Cancel Actions for Editing -->
        <div v-if="isEditing" class="section-footer">
          <button 
            @click="saveChanges"
            class="btn btn-primary"
            :disabled="loading || !hasChanges"
          >
            <i class="icon-check"></i>
            Save Changes
          </button>
          <button 
            @click="cancelEdit"
            class="btn btn-secondary"
            :disabled="loading"
          >
            Cancel
          </button>
        </div>
      </div>

      <!-- Account Information -->
      <div class="section">
        <div class="section-header">
          <h2>Account Information</h2>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <label>User ID</label>
            <p class="value monospace">{{ user.id }}</p>
          </div>

          <div class="info-item">
            <label>Auth Provider</label>
            <p class="value">{{ user.authProvider || 'Email' }}</p>
          </div>

          <div class="info-item">
            <label>Provider ID</label>
            <p class="value monospace">{{ user.providerId || 'N/A' }}</p>
          </div>

          <div class="info-item">
            <label>Created</label>
            <p class="value">{{ formatDate(user.createdAt) }}</p>
          </div>

          <div class="info-item">
            <label>Last Updated</label>
            <p class="value">{{ formatDate(user.updatedAt) }}</p>
          </div>

          <div class="info-item">
            <label>Last Login</label>
            <p class="value">{{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never' }}</p>
          </div>
        </div>
      </div>

      <!-- KYC Information (if available) -->
      <div v-if="kycRecord" class="section">
        <div class="section-header">
          <h2>KYC Status</h2>
        </div>
        
        <div class="kyc-status">
          <div class="status-badge" :class="kycStatusClass">
            {{ kycStatusText }}
          </div>
          
          <div class="kyc-details">
            <p><strong>Submitted:</strong> {{ kycRecord.submittedAt ? formatDate(kycRecord.submittedAt) : 'Not submitted' }}</p>
            <p v-if="kycRecord.reviewedAt"><strong>Reviewed:</strong> {{ formatDate(kycRecord.reviewedAt) }}</p>
            <p v-if="kycRecord.verifiedAt"><strong>Verified:</strong> {{ formatDate(kycRecord.verifiedAt) }}</p>
            <p v-if="kycRecord.rejectionReason"><strong>Rejection Reason:</strong> {{ kycRecord.rejectionReason }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmDialog
      v-if="showDeleteConfirm"
      :title="`Delete User: ${user?.fullName}`"
      :message="`Are you sure you want to delete ${user?.fullName}? This action cannot be undone.`"
      danger
      @confirm="deleteUser"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUser } from '../composables/useUser';
import { useKyc } from '../composables/useKyc';
import type { User, UpdateUserRequest } from '../types/user.types';
import type { KycRecord } from '../types/kyc.types';
import { KycStatus } from '../types/kyc.types';
import UserRoleBadge from '../components/UserRoleBadge.vue';
// import ConfirmDialog from '../../../shared/components/ConfirmDialog.vue';

const route = useRoute();
const router = useRouter();

const {
  currentUser,
  loading,
  error,
  getUserById,
  updateUserById,
  deleteUser: deleteUserService
} = useUser();

const { kycRecord, fetchKycRecord } = useKyc();

// Component state
const user = ref<User | null>(null);
const isEditing = ref(false);
const showDeleteConfirm = ref(false);

// Edit form
const editForm = ref<UpdateUserRequest>({
  fullName: '',
  email: '',
  role: 'INVESTOR',
  phone: '',
  preferredLanguage: 'en',
  timezone: 'UTC',
  avatarUrl: ''
});

const editErrors = ref<Record<string, string>>({});

// Computed
const userId = computed(() => route.params.id as string);
const isCurrentUser = computed(() => user.value?.id === currentUser.value?.id);

const hasChanges = computed(() => {
  if (!user.value) return false;
  
  return Object.keys(editForm.value).some(key => {
    const formValue = editForm.value[key as keyof UpdateUserRequest];
    const userValue = user.value![key as keyof User] || '';
    return formValue !== userValue;
  });
});

const kycStatusClass = computed(() => {
  if (!kycRecord.value) return 'pending';
  
  switch (kycRecord.value.status) {
    case KycStatus.VERIFIED: return 'verified';
    case KycStatus.REJECTED: return 'rejected';
    case KycStatus.PENDING: return 'pending';
    default: return 'not-submitted';
  }
});

const kycStatusText = computed(() => {
  if (!kycRecord.value) return 'Not Submitted';
  
  switch (kycRecord.value.status) {
    case KycStatus.VERIFIED: return 'Verified';
    case KycStatus.REJECTED: return 'Rejected';
    case KycStatus.PENDING: return 'Pending Review';
    default: return 'Not Submitted';
  }
});

// Methods
function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getLanguageName(code?: string): string {
  const languages: Record<string, string> = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German'
  };
  return languages[code || 'en'] || 'English';
}

async function loadUser() {
  if (!userId.value) return;
  
  try {
    user.value = await getUserById(userId.value);
    if (user.value) {
      // Load KYC record for this user
      await fetchKycRecord();
    }
  } catch (err) {
    console.error('Failed to load user:', err);
  }
}

function initEditForm() {
  if (!user.value) return;
  
  editForm.value = {
    fullName: user.value.fullName,
    email: user.value.email,
    role: user.value.role,
    phone: user.value.phone || '',
    preferredLanguage: user.value.preferredLanguage || 'en',
    timezone: user.value.timezone || 'UTC',
    avatarUrl: user.value.avatarUrl || ''
  };
  editErrors.value = {};
}

function toggleEdit() {
  if (isEditing.value) {
    cancelEdit();
  } else {
    initEditForm();
    isEditing.value = true;
  }
}

function cancelEdit() {
  isEditing.value = false;
  editErrors.value = {};
  initEditForm();
}

function validateForm(): boolean {
  editErrors.value = {};
  
  if (!editForm.value.fullName?.trim()) {
    editErrors.value.fullName = 'Full name is required';
  }
  
  if (!editForm.value.email?.trim()) {
    editErrors.value.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.value.email)) {
    editErrors.value.email = 'Please enter a valid email address';
  }
  
  return Object.keys(editErrors.value).length === 0;
}

async function saveChanges() {
  if (!validateForm() || !user.value) return;
  
  try {
    const updatedUser = await updateUserById(user.value.id, editForm.value);
    if (updatedUser) {
      user.value = updatedUser;
      isEditing.value = false;
    }
  } catch (err) {
    console.error('Failed to update user:', err);
  }
}

function confirmDelete() {
  showDeleteConfirm.value = true;
}

async function deleteUser() {
  if (!user.value) return;
  
  try {
    await deleteUserService(user.value.id);
    showDeleteConfirm.value = false;
    router.push('/admin/users');
  } catch (err) {
    console.error('Failed to delete user:', err);
  }
}

function goBack() {
  router.back();
}

// Lifecycle
onMounted(() => {
  loadUser();
});

// Watch for route changes
watch(() => route.params.id, () => {
  loadUser();
});
</script>

<style scoped>
.user-detail-view {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.section-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.profile-content {
  display: flex;
  gap: 2rem;
}

.avatar-section {
  flex-shrink: 0;
  text-align: center;
}

.avatar-container {
  margin-bottom: 1rem;
}

.avatar.large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder.large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #6b7280;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  flex: 1;
}

.info-item label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.info-item .value {
  color: #1f2937;
  margin: 0;
  font-size: 1rem;
}

.value.monospace {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.section-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
}

.kyc-status {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.kyc-details p {
  margin: 0.25rem 0;
  color: #6b7280;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  flex-shrink: 0;
}

.status-badge.verified {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.not-submitted {
  background: #f3f4f6;
  color: #374151;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-text {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Button styles */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

/* Input styles */
.input, .select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.input:focus, .select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input.error, .select.error {
  border-color: #ef4444;
}

@media (max-width: 768px) {
  .user-detail-view {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .profile-content {
    flex-direction: column;
    align-items: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
