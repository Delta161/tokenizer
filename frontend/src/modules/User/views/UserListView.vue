<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserSearch } from '../composables/useUserSearch'
import { useUser } from '../composables/useUser'
import UserListItem from '../components/UserListItem.vue'
import { UserRole } from '../types'

// User search composable
const { 
  searchResults, 
  searchParams, 
  totalUsers, 
  currentPage, 
  totalPages, 
  isLoading, 
  searchUsers, 
  updateSearchParams, 
  nextPage, 
  prevPage, 
  goToPage 
} = useUserSearch()

// User composable for delete functionality
const { getUserById } = useUser()

// State
const error = ref('')
const selectedUsers = ref(new Set())
const showDeleteConfirmation = ref(false)
const userToDelete = ref(null)

// Computed properties
const hasSelectedUsers = computed(() => selectedUsers.value.size > 0)
const selectedCount = computed(() => selectedUsers.value.size)

const roleOptions = computed(() => [
  { value: '', label: 'All Roles' },
  { value: UserRole.ADMIN, label: 'Admin' },
  { value: UserRole.CLIENT, label: 'Client' },
  { value: UserRole.INVESTOR, label: 'Investor' }
])

// Fetch users on mount
onMounted(async () => {
  try {
    await searchUsers()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load users'
  }
})

// Handle search form submission
async function handleSearch() {
  try {
    error.value = ''
    await searchUsers()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Search failed'
  }
}

// Handle user selection
function toggleUserSelection(userId) {
  if (selectedUsers.value.has(userId)) {
    selectedUsers.value.delete(userId)
  } else {
    selectedUsers.value.add(userId)
  }
}

// Handle select all users
function toggleSelectAll() {
  if (hasSelectedUsers.value && selectedUsers.value.size === searchResults.value.length) {
    // Deselect all
    selectedUsers.value.clear()
  } else {
    // Select all
    selectedUsers.value = new Set(searchResults.value.map(user => user.id))
  }
}

// Handle user deletion
async function handleDeleteUser(userId) {
  try {
    userToDelete.value = await getUserById(userId)
    showDeleteConfirmation.value = true
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to get user details'
  }
}

async function confirmDelete() {
  // In a real app, this would call a delete method from the user service
  console.log(`Deleting user: ${userToDelete.value.id}`)
  showDeleteConfirmation.value = false
  userToDelete.value = null
  
  // Refresh the search results
  await searchUsers()
}

function cancelDelete() {
  showDeleteConfirmation.value = false
  userToDelete.value = null
}

// Handle bulk actions
async function handleBulkAction(action) {
  if (action === 'delete' && selectedUsers.value.size > 0) {
    // In a real app, this would call a bulk delete method
    console.log(`Bulk deleting ${selectedUsers.value.size} users`)
    selectedUsers.value.clear()
    
    // Refresh the search results
    await searchUsers()
  }
}
</script>

<template>
  <div class="user-list-view">
    <div class="page-header">
      <h1>Users</h1>
      <div class="header-actions">
        <button class="primary-button">
          <span class="icon">+</span> Add User
        </button>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div class="search-filters">
      <form @submit.prevent="handleSearch" class="search-form">
        <div class="search-input-group">
          <input 
            type="text" 
            v-model="searchParams.query" 
            placeholder="Search users..." 
            class="search-input"
          />
          <button type="submit" class="search-button">
            Search
          </button>
        </div>
        
        <div class="filters-row">
          <div class="filter-group">
            <label for="roleFilter">Role</label>
            <select 
              id="roleFilter" 
              v-model="searchParams.role" 
              class="filter-select"
            >
              <option 
                v-for="option in roleOptions" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="sortBy">Sort By</label>
            <select 
              id="sortBy" 
              v-model="searchParams.sortBy" 
              class="filter-select"
            >
              <option value="lastName">Last Name</option>
              <option value="firstName">First Name</option>
              <option value="email">Email</option>
              <option value="createdAt">Date Created</option>
              <option value="lastActiveAt">Last Active</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="sortOrder">Order</label>
            <select 
              id="sortOrder" 
              v-model="searchParams.sortOrder" 
              class="filter-select"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          
          <button 
            type="button" 
            class="filter-button" 
            @click="handleSearch"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
    
    <div class="user-list-container">
      <div class="list-header">
        <div class="bulk-actions" :class="{ 'active': hasSelectedUsers }">
          <div class="select-all">
            <input 
              type="checkbox" 
              :checked="hasSelectedUsers && selectedUsers.size === searchResults.length" 
              @change="toggleSelectAll"
              id="selectAll"
            />
            <label for="selectAll">
              {{ hasSelectedUsers ? `Selected ${selectedCount}` : 'Select All' }}
            </label>
          </div>
          
          <div class="actions" v-if="hasSelectedUsers">
            <button 
              class="action-button delete-button" 
              @click="handleBulkAction('delete')"
            >
              Delete Selected
            </button>
          </div>
        </div>
        
        <div class="list-info">
          <span>{{ totalUsers }} users total</span>
        </div>
      </div>
      
      <div class="loading-state" v-if="isLoading && !searchResults.length">
        <div class="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
      
      <div v-else-if="searchResults.length" class="user-list">
        <UserListItem 
          v-for="user in searchResults" 
          :key="user.id" 
          :user="user" 
          :selectable="true" 
          :selected="selectedUsers.has(user.id)" 
          :clickable="true" 
          :showActions="true"
          @select="toggleUserSelection(user.id)"
          @delete="handleDeleteUser(user.id)"
        />
      </div>
      
      <div v-else class="empty-state">
        <p>No users found matching your search criteria.</p>
        <button class="secondary-button" @click="updateSearchParams({ query: '' }); searchUsers()">
          Clear Search
        </button>
      </div>
      
      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="pagination-button" 
          :disabled="currentPage === 1" 
          @click="prevPage"
        >
          Previous
        </button>
        
        <div class="pagination-pages">
          <button 
            v-for="page in totalPages" 
            :key="page" 
            class="page-button" 
            :class="{ 'active': page === currentPage }" 
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          class="pagination-button" 
          :disabled="currentPage === totalPages" 
          @click="nextPage"
        >
          Next
        </button>
      </div>
    </div>
    
    <!-- Delete confirmation modal -->
    <div class="modal-overlay" v-if="showDeleteConfirmation">
      <div class="modal">
        <div class="modal-header">
          <h2>Confirm Deletion</h2>
        </div>
        
        <div class="modal-body">
          <p>Are you sure you want to delete the user <strong>{{ userToDelete?.firstName }} {{ userToDelete?.lastName }}</strong>?</p>
          <p class="warning">This action cannot be undone.</p>
        </div>
        
        <div class="modal-footer">
          <button class="secondary-button" @click="cancelDelete">Cancel</button>
          <button class="danger-button" @click="confirmDelete">Delete User</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-list-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.75rem;
  color: var(--color-heading);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.primary-button {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.primary-button:hover {
  background-color: var(--color-primary-dark);
}

.primary-button .icon {
  margin-right: 0.5rem;
  font-size: 1.25rem;
  line-height: 1;
}

.error-message {
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border-radius: 4px;
  font-weight: 500;
}

.search-filters {
  margin-bottom: 1.5rem;
  background-color: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-input-group {
  display: flex;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-right: none;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
  background-color: var(--color-background);
  color: var(--color-text);
}

.search-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:hover {
  background-color: var(--color-primary-dark);
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-group label {
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: 0.875rem;
  min-width: 120px;
}

.filter-button {
  padding: 0.5rem 1rem;
  background-color: var(--color-background-mute);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.filter-button:hover {
  background-color: var(--color-background-soft);
}

.user-list-container {
  background-color: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: background-color 0.2s;
  padding: 0.5rem;
  margin: -0.5rem;
  border-radius: 4px;
}

.bulk-actions.active {
  background-color: rgba(var(--color-primary-rgb), 0.1);
}

.select-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.select-all label {
  font-size: 0.875rem;
  cursor: pointer;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-button {
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.2);
}

.delete-button:hover {
  background-color: rgba(244, 67, 54, 0.2);
}

.list-info {
  font-size: 0.875rem;
  color: var(--color-text-light);
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

.user-list {
  max-height: 600px;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  text-align: center;
}

.secondary-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-background-mute);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

.secondary-button:hover {
  background-color: var(--color-background-soft);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
}

.pagination-button {
  padding: 0.5rem 1rem;
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background-color: var(--color-background-soft);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

.page-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.page-button:hover:not(.active) {
  background-color: var(--color-background-soft);
}

.page-button.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-heading);
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin: 0 0 1rem 0;
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.warning {
  color: #f44336;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-background-soft);
}

.danger-button {
  padding: 0.75rem 1.5rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.danger-button:hover {
  background-color: #d32f2f;
}

/* Responsive styles */
@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
  
  .pagination-pages {
    order: -1;
  }
}

@media (max-width: 576px) {
  .search-input-group {
    flex-direction: column;
  }
  
  .search-input {
    border-right: 1px solid var(--color-border);
    border-radius: 4px;
  }
  
  .search-button {
    margin-top: 0.5rem;
    border-radius: 4px;
  }
  
  .page-button {
    width: 28px;
    height: 28px;
  }
}
</style>