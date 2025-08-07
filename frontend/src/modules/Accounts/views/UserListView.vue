<template>
  <div class="user-list-view">
    <!-- Header Section -->
    <div class="header">
      <div class="title-section">
        <h1 class="title">User Management</h1>
        <p class="subtitle">Manage all users in the system</p>
      </div>
      
      <div class="actions">
        <button 
          @click="showCreateModal = true"
          class="btn btn-primary"
          :disabled="adminLoading"
        >
          <i class="icon-plus"></i>
          Create User
        </button>
        <button 
          @click="refreshUsers"
          class="btn btn-secondary"
          :disabled="adminLoading"
        >
          <i class="icon-refresh" :class="{ 'spinning': adminLoading }"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters">
      <div class="filter-row">
        <div class="filter-group">
          <label for="role-filter">Role:</label>
          <select 
            id="role-filter" 
            v-model="filters.role" 
            @change="applyFilters"
            class="select"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="CLIENT">Client</option>
            <option value="INVESTOR">Investor</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="search">Search:</label>
          <input 
            id="search"
            v-model="filters.search" 
            @input="debounceSearch"
            type="text" 
            placeholder="Search by name or email..."
            class="input"
          />
        </div>
        
        <div class="filter-group">
          <label for="limit">Per Page:</label>
          <select 
            id="limit" 
            v-model="filters.limit" 
            @change="applyFilters"
            class="select"
          >
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="adminLoading && !users.length" class="loading">
      <div class="spinner"></div>
      <p>Loading users...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !users.length" class="error">
      <div class="error-icon">⚠️</div>
      <h3>Error Loading Users</h3>
      <p>{{ error }}</p>
      <button @click="refreshUsers" class="btn btn-primary">
        Try Again
      </button>
    </div>

    <!-- Users Table -->
    <div v-else-if="users.length" class="table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Created</th>
            <th>Last Login</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="user-row">
            <td class="user-info">
              <div class="user-avatar">
                <img 
                  v-if="user.avatarUrl" 
                  :src="user.avatarUrl" 
                  :alt="user.fullName"
                  class="avatar"
                />
                <div v-else class="avatar-placeholder">
                  {{ getInitials(user.fullName) }}
                </div>
              </div>
              <div class="user-details">
                <div class="user-name">{{ user.fullName }}</div>
                <div class="user-email">{{ user.email }}</div>
              </div>
            </td>
            
            <td>
              <UserRoleBadge :role="user.role" />
            </td>
            
            <td class="date">
              {{ formatDate(user.createdAt) }}
            </td>
            
            <td class="date">
              {{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never' }}
            </td>
            
            <td>
              <span class="status-badge active">Active</span>
            </td>
            
            <td class="actions">
              <button 
                @click="viewUser(user)"
                class="btn btn-sm btn-secondary"
                title="View Details"
              >
                <i class="icon-eye"></i>
              </button>
              <button 
                @click="editUser(user)"
                class="btn btn-sm btn-warning"
                title="Edit User"
              >
                <i class="icon-edit"></i>
              </button>
              <button 
                @click="confirmDeleteUser(user)"
                class="btn btn-sm btn-danger"
                title="Delete User"
                :disabled="user.id === currentUser?.id"
              >
                <i class="icon-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="usersList" class="pagination">
        <div class="pagination-info">
          Showing {{ ((usersList.page - 1) * usersList.limit) + 1 }} - 
          {{ Math.min(usersList.page * usersList.limit, usersList.total) }} 
          of {{ usersList.total }} users
        </div>
        
        <div class="pagination-controls">
          <button 
            @click="changePage(usersList.page - 1)"
            :disabled="usersList.page <= 1"
            class="btn btn-sm btn-secondary"
          >
            Previous
          </button>
          
          <span class="page-info">
            Page {{ usersList.page }} of {{ Math.ceil(usersList.total / usersList.limit) }}
          </span>
          
          <button 
            @click="changePage(usersList.page + 1)"
            :disabled="!usersList.hasMore"
            class="btn btn-sm btn-secondary"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">👥</div>
      <h3>No Users Found</h3>
      <p>No users match your current filters.</p>
      <button @click="clearFilters" class="btn btn-primary">
        Clear Filters
      </button>
    </div>

    <!-- Modals -->
    <CreateUserModal 
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @user-created="onUserCreated"
    />
    
    <EditUserModal 
      v-if="showEditModal && selectedUser"
      :user="selectedUser"
      @close="showEditModal = false"
      @user-updated="onUserUpdated"
    />
    
    <UserDetailModal 
      v-if="showDetailModal && selectedUser"
      :user="selectedUser"
      @close="showDetailModal = false"
    />
    
    <ConfirmDialog
      v-if="showDeleteConfirm && selectedUser"
      :title="`Delete User: ${selectedUser.fullName}`"
      :message="`Are you sure you want to delete ${selectedUser.fullName}? This action cannot be undone.`"
      danger
      @confirm="deleteUser"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useUser } from '../composables/useUser';
import type { User } from '../types/user.types';
import UserRoleBadge from '../components/UserRoleBadge.vue';
// Note: These modal components would need to be created
// import CreateUserModal from '../components/CreateUserModal.vue';
// import EditUserModal from '../components/EditUserModal.vue';
// import UserDetailModal from '../components/UserDetailModal.vue';
// import ConfirmDialog from '../../../shared/components/ConfirmDialog.vue';

const {
  users,
  usersList,
  currentUser,
  adminLoading,
  error,
  fetchUsers,
  createUser,
  updateUserById,
  deleteUser: deleteUserService
} = useUser();

// Component state
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDetailModal = ref(false);
const showDeleteConfirm = ref(false);
const selectedUser = ref<User | null>(null);

// Filters
const filters = ref({
  role: '',
  search: '',
  limit: 25,
  page: 1
});

let searchTimeout: number;

// Computed
const isLoading = computed(() => adminLoading.value);

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
    month: 'short',
    day: 'numeric'
  });
}

function debounceSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
}

async function applyFilters() {
  filters.value.page = 1;
  await loadUsers();
}

async function loadUsers() {
  const params = {
    page: filters.value.page,
    limit: filters.value.limit,
    ...(filters.value.role && { role: filters.value.role }),
    ...(filters.value.search && { search: filters.value.search })
  };
  
  await fetchUsers(params);
}

async function refreshUsers() {
  await loadUsers();
}

function clearFilters() {
  filters.value = {
    role: '',
    search: '',
    limit: 25,
    page: 1
  };
  loadUsers();
}

async function changePage(page: number) {
  filters.value.page = page;
  await loadUsers();
}

function viewUser(user: User) {
  selectedUser.value = user;
  showDetailModal.value = true;
}

function editUser(user: User) {
  selectedUser.value = user;
  showEditModal.value = true;
}

function confirmDeleteUser(user: User) {
  selectedUser.value = user;
  showDeleteConfirm.value = true;
}

async function deleteUser() {
  if (!selectedUser.value) return;
  
  try {
    await deleteUserService(selectedUser.value.id);
    showDeleteConfirm.value = false;
    selectedUser.value = null;
    await refreshUsers();
  } catch (error) {
    console.error('Failed to delete user:', error);
  }
}

function onUserCreated() {
  showCreateModal.value = false;
  refreshUsers();
}

function onUserUpdated() {
  showEditModal.value = false;
  selectedUser.value = null;
  refreshUsers();
}

// Lifecycle
onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.user-list-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.title-section .title {
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.title-section .subtitle {
  color: #6b7280;
  margin: 0;
}

.actions {
  display: flex;
  gap: 1rem;
}

.filters {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.filter-row {
  display: flex;
  gap: 2rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: #f9fafb;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.user-row {
  border-bottom: 1px solid #e5e7eb;
}

.user-row:hover {
  background: #f9fafb;
}

.users-table td {
  padding: 1rem;
  vertical-align: middle;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #6b7280;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-details .user-name {
  font-weight: 500;
  color: #1f2937;
}

.user-details .user-email {
  color: #6b7280;
  font-size: 0.875rem;
}

.date {
  color: #6b7280;
  font-size: 0.875rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-info {
  color: #374151;
  font-size: 0.875rem;
}

.loading, .error, .empty-state {
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

.spinning {
  animation: spin 1s linear infinite;
}

.error-icon, .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
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

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #d97706;
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
</style>
