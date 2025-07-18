<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUser } from '../composables/useUser';
import UserProfileCard from '../components/UserProfileCard.vue';
import UserRoleBadge from '../components/UserRoleBadge.vue';
import UserAvatar from '../components/UserAvatar.vue';

const route = useRoute();
const router = useRouter();
const { getUserById, updateUser, deleteUser } = useUser();

const userId = computed(() => route.params.id as string);
const user = ref(null);
const isLoading = ref(true);
const error = ref('');
const isEditing = ref(false);
const showDeleteConfirm = ref(false);

// Activity data for the user
const recentActivity = ref([
  { id: 1, type: 'login', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'User logged in from 192.168.1.1' },
  { id: 2, type: 'profile_update', timestamp: new Date(Date.now() - 86400000).toISOString(), details: 'Updated profile information' },
  { id: 3, type: 'settings_change', timestamp: new Date(Date.now() - 172800000).toISOString(), details: 'Changed notification settings' },
]);

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Get activity icon based on type
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'login': return 'login';
    case 'profile_update': return 'user-edit';
    case 'settings_change': return 'cog';
    default: return 'info-circle';
  }
};

// Load user data
const loadUser = async () => {
  isLoading.value = true;
  error.value = '';
  
  try {
    user.value = await getUserById(userId.value);
  } catch (err) {
    error.value = err.message || 'Failed to load user';
  } finally {
    isLoading.value = false;
  }
};

// Handle user update
const handleUpdate = async (updatedData) => {
  try {
    await updateUser(userId.value, updatedData);
    user.value = { ...user.value, ...updatedData };
    isEditing.value = false;
  } catch (err) {
    error.value = err.message || 'Failed to update user';
  }
};

// Handle user deletion
const handleDelete = async () => {
  try {
    await deleteUser(userId.value);
    router.push({ name: 'UserList' });
  } catch (err) {
    error.value = err.message || 'Failed to delete user';
    showDeleteConfirm.value = false;
  }
};

// Toggle edit mode
const toggleEdit = () => {
  isEditing.value = !isEditing.value;
};

// Go back to user list
const goBack = () => {
  router.push({ name: 'UserList' });
};

onMounted(() => {
  loadUser();
});
</script>

<template>
  <div class="user-detail-view">
    <!-- Header with back button and actions -->
    <div class="user-detail-header">
      <button @click="goBack" class="btn btn-outline-secondary">
        <i class="fas fa-arrow-left"></i> Back to Users
      </button>
      
      <div class="user-actions" v-if="user && !isLoading">
        <button @click="toggleEdit" class="btn btn-primary">
          <i class="fas" :class="isEditing ? 'fa-times' : 'fa-edit'"></i>
          {{ isEditing ? 'Cancel' : 'Edit User' }}
        </button>
        <button @click="showDeleteConfirm = true" class="btn btn-danger ml-2">
          <i class="fas fa-trash"></i> Delete User
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Loading user details...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container alert alert-danger">
      <i class="fas fa-exclamation-circle"></i>
      <span>{{ error }}</span>
      <button @click="loadUser" class="btn btn-outline-danger btn-sm ml-3">
        <i class="fas fa-sync"></i> Retry
      </button>
    </div>

    <!-- User not found -->
    <div v-else-if="!user" class="not-found-container">
      <i class="fas fa-user-slash fa-3x"></i>
      <h3>User Not Found</h3>
      <p>The requested user could not be found or you don't have permission to view it.</p>
      <button @click="goBack" class="btn btn-primary">Return to User List</button>
    </div>

    <!-- User details -->
    <div v-else class="user-detail-content">
      <!-- User profile section -->
      <div class="user-profile-section">
        <UserProfileCard 
          :user="user" 
          :editable="isEditing"
          @update="handleUpdate"
        />
      </div>

      <!-- User information section -->
      <div class="user-info-section">
        <div class="card">
          <div class="card-header">
            <h5>Account Information</h5>
          </div>
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-md-4 fw-bold">User ID:</div>
              <div class="col-md-8">{{ user.id }}</div>
            </div>
            <div class="row mb-3">
              <div class="col-md-4 fw-bold">Role:</div>
              <div class="col-md-8">
                <UserRoleBadge :role="user.role" />
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-4 fw-bold">Created:</div>
              <div class="col-md-8">{{ formatDate(user.createdAt) }}</div>
            </div>
            <div class="row mb-3">
              <div class="col-md-4 fw-bold">Last Updated:</div>
              <div class="col-md-8">{{ formatDate(user.updatedAt) }}</div>
            </div>
            <div class="row mb-3">
              <div class="col-md-4 fw-bold">Last Login:</div>
              <div class="col-md-8">{{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never' }}</div>
            </div>
          </div>
        </div>

        <!-- Recent activity section -->
        <div class="card mt-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5>Recent Activity</h5>
            <button class="btn btn-sm btn-outline-primary">View All</button>
          </div>
          <div class="card-body p-0">
            <ul class="list-group list-group-flush">
              <li v-for="activity in recentActivity" :key="activity.id" class="list-group-item">
                <div class="d-flex">
                  <div class="activity-icon">
                    <i class="fas" :class="`fa-${getActivityIcon(activity.type)}`"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-details">{{ activity.details }}</div>
                    <div class="activity-time text-muted">{{ formatDate(activity.timestamp) }}</div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="showDeleteConfirm" class="modal-backdrop">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Deletion</h5>
            <button @click="showDeleteConfirm = false" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div class="user-preview d-flex align-items-center">
              <UserAvatar :user="user" size="sm" />
              <div class="ms-3">
                <div class="fw-bold">{{ user.firstName }} {{ user.lastName }}</div>
                <div class="text-muted">{{ user.email }}</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showDeleteConfirm = false" class="btn btn-secondary">Cancel</button>
            <button @click="handleDelete" class="btn btn-danger">Delete User</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-detail-view {
  padding: 1.5rem;
}

.user-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.loading-container,
.error-container,
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.user-detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 992px) {
  .user-detail-content {
    grid-template-columns: 1fr;
  }
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: var(--bs-primary);
}

.activity-content {
  flex: 1;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-dialog {
  width: 100%;
  max-width: 500px;
  margin: 1.75rem auto;
  z-index: 1051;
}

.user-preview {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 0.25rem;
}
</style>