import { ref, computed } from 'vue'

interface PaginationOptions {
  initialPage?: number
  initialLimit?: number
  totalItems?: number
}

/**
 * Composable for handling pagination
 * Provides reactive pagination state and navigation methods
 */
export function usePagination(options: PaginationOptions = {}) {
  const currentPage = ref(options.initialPage || 1)
  const itemsPerPage = ref(options.initialLimit || 10)
  const totalItems = ref(options.totalItems || 0)

  // Computed properties
  const totalPages = computed(() => {
    return Math.ceil(totalItems.value / itemsPerPage.value) || 1
  })

  const offset = computed(() => {
    return (currentPage.value - 1) * itemsPerPage.value
  })

  const hasNextPage = computed(() => {
    return currentPage.value < totalPages.value
  })

  const hasPreviousPage = computed(() => {
    return currentPage.value > 1
  })

  const pageItems = computed(() => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages.value <= maxVisiblePages) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages.value; i++) {
        pages.push(i)
      }
    } else {
      // Show a subset of pages with ellipsis
      const leftBound = Math.max(1, currentPage.value - 1)
      const rightBound = Math.min(totalPages.value, currentPage.value + 1)
      
      if (leftBound > 1) {
        pages.push(1)
        if (leftBound > 2) pages.push('...')
      }
      
      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i)
      }
      
      if (rightBound < totalPages.value) {
        if (rightBound < totalPages.value - 1) pages.push('...')
        pages.push(totalPages.value)
      }
    }
    
    return pages
  })

  // Methods
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  function nextPage() {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }

  function previousPage() {
    if (hasPreviousPage.value) {
      currentPage.value--
    }
  }

  function setItemsPerPage(limit: number) {
    itemsPerPage.value = limit
    // Reset to first page when changing items per page
    currentPage.value = 1
  }

  function setTotalItems(total: number) {
    totalItems.value = total
    // Adjust current page if it's now out of bounds
    if (currentPage.value > totalPages.value) {
      currentPage.value = Math.max(1, totalPages.value)
    }
  }

  return {
    // State
    currentPage,
    itemsPerPage,
    totalItems,
    
    // Computed
    totalPages,
    offset,
    hasNextPage,
    hasPreviousPage,
    pageItems,
    
    // Methods
    goToPage,
    nextPage,
    previousPage,
    setItemsPerPage,
    setTotalItems
  }
}