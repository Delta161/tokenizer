import { computed, ref, reactive } from 'vue';
import { useUserStore } from '../store';
import type { UserSearchParams, UserSearchResult, UserRole } from '../types';

/**
 * Composable for user search functionality
 * Provides reactive access to user search state and methods
 */
export function useUserSearch() {
  const userStore = useUserStore();
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // Search params state
  const searchParams = reactive<UserSearchParams>({
    query: '',
    role: undefined,
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  // Computed properties
  const users = computed(() => userStore.users);
  const searchResult = computed(() => userStore.userSearchResult);
  const totalUsers = computed(() => userStore.totalUsers);
  const totalPages = computed(() => {
    if (!searchResult.value) return 0;
    return Math.ceil(searchResult.value.total / searchResult.value.limit);
  });
  
  /**
   * Search users with current params
   */
  const searchUsers = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await userStore.searchUsers(searchParams);
      return result;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Update search params and perform search
   */
  const updateSearchParams = async (params: Partial<UserSearchParams>) => {
    // Update search params
    Object.assign(searchParams, params);
    
    // Reset page to 1 if other search params change
    if (params.query !== undefined || params.role !== undefined || 
        params.sortBy !== undefined || params.sortOrder !== undefined) {
      searchParams.page = 1;
    }
    
    // Perform search with updated params
    return searchUsers();
  };
  
  /**
   * Go to next page
   */
  const nextPage = async () => {
    if (!searchResult.value || searchParams.page >= totalPages.value) {
      return;
    }
    
    searchParams.page += 1;
    return searchUsers();
  };
  
  /**
   * Go to previous page
   */
  const prevPage = async () => {
    if (!searchResult.value || searchParams.page <= 1) {
      return;
    }
    
    searchParams.page -= 1;
    return searchUsers();
  };
  
  /**
   * Go to specific page
   */
  const goToPage = async (page: number) => {
    if (!searchResult.value || page < 1 || page > totalPages.value) {
      return;
    }
    
    searchParams.page = page;
    return searchUsers();
  };
  
  /**
   * Reset search params to default
   */
  const resetSearch = () => {
    Object.assign(searchParams, {
      query: '',
      role: undefined,
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };
  
  return {
    // State
    searchParams,
    users,
    searchResult,
    totalUsers,
    totalPages,
    isLoading,
    error,
    
    // Methods
    searchUsers,
    updateSearchParams,
    nextPage,
    prevPage,
    goToPage,
    resetSearch
  };
}