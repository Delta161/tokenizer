<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useLoading, usePagination, useFormatter } from '@/composables'

// Sample data type
interface Item {
  id: string
  title: string
  price: number
  createdAt: string
  status: 'active' | 'inactive'
}

// Use composables
const { isLoading, error, withLoading } = useLoading()
const { formatCurrency, formatDate } = useFormatter()

const {
  currentPage,
  itemsPerPage,
  totalItems,
  offset,
  hasNextPage,
  hasPreviousPage,
  pageItems,
  nextPage,
  previousPage,
  goToPage,
  setTotalItems
} = usePagination({
  initialPage: 1,
  initialLimit: 10
})

// State
const items = ref<Item[]>([])
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

// Computed properties
const filteredItems = computed(() => {
  return items.value.filter(item => {
    // Apply search filter
    const matchesSearch = searchQuery.value
      ? item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      : true
    
    // Apply status filter
    const matchesStatus = statusFilter.value === 'all' 
      ? true 
      : item.status === statusFilter.value
    
    return matchesSearch && matchesStatus
  })
})

const paginatedItems = computed(() => {
  const start = offset.value
  const end = start + itemsPerPage.value
  return filteredItems.value.slice(start, end)
})

// Update total items when filtered items change
const updateTotalItems = () => {
  setTotalItems(filteredItems.value.length)
}

// Watch for filter changes
watch([searchQuery, statusFilter], () => {
  updateTotalItems()
  // Reset to first page when filters change
  if (currentPage.value !== 1) {
    goToPage(1)
  }
})

// Fetch data
async function fetchItems() {
  await withLoading(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Sample data
      items.value = Array.from({ length: 50 }, (_, i) => ({
        id: `item-${i + 1}`,
        title: `Item ${i + 1}`,
        price: Math.random() * 1000,
        createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        status: Math.random() > 0.3 ? 'active' : 'inactive'
      }))
      
      updateTotalItems()
    } catch (err) {
      console.error('Failed to fetch items:', err)
    }
  })
}

// Load data on component mount
onMounted(() => {
  fetchItems()
})
</script>

<template>
  <div class="list-container">
    <div class="filters">
      <div class="search">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search items..."
        />
      </div>
      
      <div class="status-filter">
        <select v-model="statusFilter">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading">
      Loading items...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="paginatedItems.length === 0" class="empty">
      No items found.
    </div>
    
    <table v-else class="items-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Price</th>
          <th>Created</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paginatedItems" :key="item.id">
          <td>{{ item.title }}</td>
          <td>{{ formatCurrency(item.price) }}</td>
          <td>{{ formatDate(item.createdAt) }}</td>
          <td>
            <span :class="['status-badge', item.status]">
              {{ item.status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div class="pagination" v-if="totalItems > 0">
      <button 
        @click="previousPage" 
        :disabled="!hasPreviousPage"
        class="pagination-button"
      >
        Previous
      </button>
      
      <div class="page-numbers">
        <button 
          v-for="page in pageItems" 
          :key="page"
          @click="typeof page === 'number' ? goToPage(page) : null"
          :class="['page-number', { active: page === currentPage, ellipsis: page === '...' }]"
          :disabled="page === '...'"
        >
          {{ page }}
        </button>
      </div>
      
      <button 
        @click="nextPage" 
        :disabled="!hasNextPage"
        class="pagination-button"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
.list-container {
  max-width: 1000px;
  margin: 0 auto;
}

.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.search input,
.status-filter select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
}

.loading,
.error,
.empty {
  padding: 2rem;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 0.25rem;
}

.error {
  color: #dc3545;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.items-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.status-badge.active {
  background-color: #28a745;
  color: white;
}

.status-badge.inactive {
  background-color: #dc3545;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
}

.pagination-button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  margin: 0 0.5rem;
}

.page-number {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0.25rem;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
}

.page-number.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.page-number.ellipsis {
  border: none;
  cursor: default;
}
</style>