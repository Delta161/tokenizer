/**
 * User Search Composable
 * 
 * This composable provides functionality for searching users.
 */

import { ref, computed } from 'vue';
import { UserService } from '../services/user.service';
import type { User, UserSearchParams, UserSearchResult } from '../types/user.types';

export function useUserSearch() {
  const userService = new UserService();
  
  const loading = ref(false);
  const error = ref<string | null>(null);
  const users = ref<User[]>([]);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(10);
  const hasMore = ref(false);
  
  const defaultParams = computed<UserSearchParams>(() => ({
    page: page.value,
    limit: limit.value,
    sortBy: 'name',
    sortOrder: 'asc'
  }));
  
  /**
   * Search users
   */
  async function searchUsers(params: UserSearchParams = {}): Promise<UserSearchResult> {
    loading.value = true;
    error.value = null;
    
    try {
      const searchParams = { ...defaultParams.value, ...params };
      const result = await userService.searchUsers(searchParams);
      
      users.value = result.users;
      total.value = result.total;
      page.value = result.page;
      limit.value = result.limit;
      hasMore.value = result.hasMore;
      
      return result;
    } catch (err: any) {
      error.value = err.message || 'Failed to search users';
      console.error('Error searching users:', err);
      return {
        users: [],
        total: 0,
        page: page.value,
        limit: limit.value,
        hasMore: false
      };
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Load more users
   */
  async function loadMore(params: UserSearchParams = {}): Promise<UserSearchResult> {
    if (!hasMore.value || loading.value) {
      return {
        users: users.value,
        total: total.value,
        page: page.value,
        limit: limit.value,
        hasMore: hasMore.value
      };
    }
    
    const nextPage = page.value + 1;
    const searchParams = { ...defaultParams.value, ...params, page: nextPage };
    
    loading.value = true;
    error.value = null;
    
    try {
      const result = await userService.searchUsers(searchParams);
      
      users.value = [...users.value, ...result.users];
      total.value = result.total;
      page.value = result.page;
      limit.value = result.limit;
      hasMore.value = result.hasMore;
      
      return result;
    } catch (err: any) {
      error.value = err.message || 'Failed to load more users';
      console.error('Error loading more users:', err);
      return {
        users: users.value,
        total: total.value,
        page: page.value,
        limit: limit.value,
        hasMore: hasMore.value
      };
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Reset search
   */
  function resetSearch(): void {
    users.value = [];
    total.value = 0;
    page.value = 1;
    hasMore.value = false;
    error.value = null;
  }
  
  return {
    // State
    loading,
    error,
    users,
    total,
    page,
    limit,
    hasMore,
    
    // Methods
    searchUsers,
    loadMore,
    resetSearch
  };
}