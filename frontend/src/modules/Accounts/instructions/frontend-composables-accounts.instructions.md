---
applyTo: "frontend/src/modules/Accounts/composables/*.ts"
---

# Frontend Accounts Composables Instructions

## Overview

The composables folder contains **Vue 3 Composition API functions** that encapsulate reusable business logic for the Accounts module. These composables provide reactive state management, API integration, and business logic abstraction, following Vue.js best practices and clean architecture principles.

## Composable Architecture

### 🏗️ Layer 3: Composable/Hook (State Management)
Composables are **Layer 3** in the mandatory application frontend flow:

```
📍 LAYER 3: Composable/Hook (State Management)
👉 Manages state (e.g. useUser(), useAuth(), useKyc())
👉 Fetches or updates data by calling a service (Layer 4)
👉 Provides reactive state and business logic to Layer 2 (Components/Sections) and Layer 1 (Views)
```

### Design Principles

1. **Single Responsibility**: Each composable handles one specific business concern
2. **Reactive State Management**: Uses Vue's reactivity system for state management
3. **Service Integration**: Abstracts service layer complexity from components
4. **Error Handling**: Comprehensive error handling with user-friendly messages
5. **Type Safety**: Full TypeScript coverage with proper type definitions
6. **Reusability**: Designed for use across multiple components and views
7. **⚠️ NO DIRECT BACKEND COMMUNICATION**: Composables must NEVER directly call apiClient, axios, fetch, or any HTTP methods. All backend communication MUST go through services layer only.

### Mandatory Flow Integration
Composables must follow the application flow:
- **Layer 3 (Composables)** → **Layer 4 (Services)** → **Layer 5 (apiClient)**
- Composables are consumed by Layer 1 (Views) and Layer 2 (Components/Sections)
- Composables NEVER directly access apiClient - they must use Layer 4 (Services)
- Composables provide business logic abstraction and reactive state management

### Composable Structure Pattern

```typescript
// ✅ Standard composable structure
import { ref, computed, onMounted } from 'vue';
import { ServiceClass } from '../services';
import type { DataType, ParamsType } from '../types';

export function useFeature() {
  // Service instance
  const service = new ServiceClass();
  
  // Reactive state
  const data = ref<DataType | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Computed properties
  const computedValue = computed(() => {
    // Derived state logic
  });
  
  // Methods
  const fetchData = async (params?: ParamsType) => {
    loading.value = true;
    error.value = null;
    
    try {
      data.value = await service.fetchData(params);
    } catch (err: any) {
      error.value = err.message || 'Operation failed';
      console.error('Composable error:', err);
    } finally {
      loading.value = false;
    }
  };
  
  // Return interface
  return {
    // State (readonly where appropriate)
    data: readonly(data),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    computedValue,
    
    // Methods
    fetchData
  };
}
```

## Composable Specifications

### 1. useAuth.ts

**Purpose**: Authentication state management and operations

#### Key Features:
- **OAuth Integration**: Manages OAuth-only authentication flows
- **Token Management**: Handles JWT tokens and refresh logic
- **Role-Based Access**: Provides role checking utilities
- **Session Management**: Manages authentication session state
- **Store Integration**: Integrates with Pinia auth store

#### State Management:
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userRole: string;
}
```

#### Key Methods:
```typescript
const {
  // State
  user,
  isAuthenticated,
  isLoading,
  error,
  userRole,
  
  // Methods
  login,      // OAuth redirect initiation
  register,   // OAuth registration flow
  logout,     // Clear auth state and tokens
  checkAuth,  // Validate current authentication
  refreshToken, // Refresh JWT token
  hasRole,    // Check user role
  hasAnyRole  // Check multiple roles
} = useAuth();
```

#### Usage Patterns:
```typescript
// Component usage
<script setup lang="ts">
import { useAuth } from '../composables/useAuth';

const { 
  isAuthenticated, 
  user, 
  logout, 
  hasRole 
} = useAuth();

// Check if user is admin
const isAdmin = computed(() => hasRole('admin'));

// Handle logout
const handleLogout = async () => {
  await logout();
  router.push('/login');
};
</script>
```

#### Implementation Notes:
- Uses `useAuthStore` for underlying state management
- OAuth-only authentication (no password support)
- Automatically handles token refresh
- Provides reactive authentication state
- Integrates with Vue Router for navigation

---

### 2. useUser.ts

**Purpose**: User profile and settings management

#### Key Features:
- **Profile Management**: CRUD operations for user profiles
- **Settings Management**: User preference and settings handling
- **Current User State**: Manages currently authenticated user
- **Admin Operations**: Admin-specific user management functions
- **Data Synchronization**: Keeps user data in sync across components

#### State Management:
```typescript
interface UserState {
  loading: boolean;
  error: string | null;
  currentUser: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
}
```

#### Key Methods:
```typescript
const {
  // State
  loading,
  error,
  currentUser,
  isAdmin,
  isAuthenticated,
  
  // Methods
  fetchCurrentUser,      // Get current user data
  getUserById,           // Get user by ID
  getUserProfile,        // Get user profile data
  getUserSettings,       // Get user settings
  updateUser,           // Update user data
  updateUserProfile,    // Update profile specifically
  updateUserSettings    // Update settings specifically
} = useUser();
```

#### Usage Patterns:
```typescript
// Profile component usage
<script setup lang="ts">
import { useUser } from '../composables/useUser';

const { 
  currentUser, 
  loading, 
  error, 
  updateUserProfile 
} = useUser();

// Update user profile
const handleProfileUpdate = async (profileData: Partial<UserProfile>) => {
  try {
    await updateUserProfile(currentUser.value?.id, profileData);
    // Handle success
  } catch (err) {
    // Handle error
  }
};
</script>
```

#### Integration Points:
- **Store Integration**: Uses `useUserStore` for global state
- **Service Integration**: Communicates with `UserService`
- **Type Safety**: Full TypeScript coverage with user types
- **Error Handling**: Consistent error handling patterns

---

### 3. useKyc.ts

**Purpose**: KYC verification process management

#### Key Features:
- **Status Tracking**: Manages KYC verification status
- **Provider Integration**: Handles KYC provider interactions
- **Verification Flow**: Manages multi-step verification process
- **Status Computed Properties**: Reactive status checking
- **Error Recovery**: Handles verification failures gracefully

#### State Management:
```typescript
interface KycState {
  kycRecord: KycRecord | null;
  isLoading: boolean;
  error: Error | null;
  isVerified: boolean;
  isPending: boolean;
  isRejected: boolean;
  isNotSubmitted: boolean;
}
```

#### KYC Status Flow:
1. **NOT_SUBMITTED**: Initial state, no KYC record
2. **PENDING**: Verification in progress
3. **VERIFIED**: Successfully verified
4. **REJECTED**: Verification failed

#### Key Methods:
```typescript
const {
  // State
  kycRecord,
  isLoading,
  error,
  
  // Status computed properties
  isVerified,
  isPending,
  isRejected,
  isNotSubmitted,
  
  // Methods
  fetchKycRecord,        // Get current KYC status
  submitKyc,            // Submit KYC information
  initiateVerification  // Start provider verification
} = useKyc();
```

#### Usage Patterns:
```typescript
// KYC component usage
<script setup lang="ts">
import { useKyc } from '../composables/useKyc';

const { 
  kycRecord, 
  isVerified, 
  isPending, 
  initiateVerification 
} = useKyc();

// Start KYC verification
const startVerification = async () => {
  try {
    const session = await initiateVerification('sumsub', redirectUrl);
    // Redirect to provider
    window.location.href = session.redirectUrl;
  } catch (err) {
    // Handle error
  }
};
</script>
```

#### Implementation Notes:
- Integrates with external KYC providers (SumSub, etc.)
- Handles provider callback URLs
- Manages complex verification state transitions
- Provides clear status indicators for UI
- Handles verification retry logic

---

### 4. useUserSearch.ts

**Purpose**: User search and filtering functionality

#### Key Features:
- **Search Operations**: Text-based user search
- **Advanced Filtering**: Role, date, and custom filters
- **Pagination**: Efficient pagination handling
- **Load More**: Infinite scroll support
- **State Management**: Search results and pagination state
- **Performance Optimization**: Debounced search and caching

#### State Management:
```typescript
interface UserSearchState {
  loading: boolean;
  error: string | null;
  users: User[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
```

#### Search Parameters:
```typescript
interface UserSearchParams {
  query?: string;           // Text search
  role?: UserRole;         // Role filter
  page?: number;           // Pagination
  limit?: number;          // Page size
  sortBy?: 'name' | 'email' | 'role' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
```

#### Key Methods:
```typescript
const {
  // State
  loading,
  error,
  users,
  total,
  page,
  limit,
  hasMore,
  
  // Methods
  searchUsers,    // Perform search with filters
  loadMore,       // Load additional results
  resetSearch     // Clear search results
} = useUserSearch();
```

#### Usage Patterns:
```typescript
// Admin user list component
<script setup lang="ts">
import { useUserSearch } from '../composables/useUserSearch';

const { 
  users, 
  loading, 
  hasMore, 
  searchUsers, 
  loadMore 
} = useUserSearch();

// Search users with filters
const handleSearch = async (searchParams: UserSearchParams) => {
  await searchUsers(searchParams);
};

// Load more results
const handleLoadMore = async () => {
  if (hasMore.value && !loading.value) {
    await loadMore();
  }
};
</script>
```

#### Implementation Features:
- **Debounced Search**: Prevents excessive API calls
- **Infinite Scroll**: Load more functionality
- **Filter Persistence**: Maintains search state
- **Error Recovery**: Graceful error handling
- **Performance Optimized**: Efficient data loading

---

## Integration Patterns

### Service Layer Integration

```typescript
// ✅ Proper service integration
export function useUser() {
  const userService = new UserService(); // Service instance
  
  const fetchUser = async (id: string) => {
    try {
      // Use service for API communication
      const user = await userService.getUserById(id);
      return user;
    } catch (error) {
      // Handle service errors
      throw new Error('Failed to fetch user');
    }
  };
  
  return { fetchUser };
}
```

### Store Integration

```typescript
// ✅ Pinia store integration
export function useAuth() {
  const authStore = useAuthStore(); // Pinia store
  
  // Reactive computed properties from store
  const user = computed(() => authStore.user);
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  
  return { user, isAuthenticated };
}
```

### Component Integration

```typescript
// ✅ Component usage pattern
<script setup lang="ts">
import { useUser, useAuth } from '../composables';

// Multiple composables in single component
const { currentUser, updateUser } = useUser();
const { isAuthenticated, logout } = useAuth();

// Combine reactive state
const canEdit = computed(() => 
  isAuthenticated.value && currentUser.value?.id === props.userId
);
</script>
```

## Error Handling Strategies

### Consistent Error Patterns

```typescript
// ✅ Standardized error handling
export function useFeature() {
  const error = ref<string | null>(null);
  
  const performAction = async () => {
    error.value = null; // Clear previous errors
    
    try {
      // Perform operation
      await service.performAction();
    } catch (err: any) {
      // User-friendly error message
      error.value = err.message || 'Operation failed';
      
      // Log technical details
      console.error('Composable error:', err);
      
      // Re-throw if needed
      throw err;
    }
  };
  
  return { error, performAction };
}
```

### Error Recovery

```typescript
// ✅ Error recovery mechanisms
export function useDataFetching() {
  const retryCount = ref(0);
  const maxRetries = 3;
  
  const fetchWithRetry = async () => {
    try {
      await fetchData();
      retryCount.value = 0; // Reset on success
    } catch (err) {
      if (retryCount.value < maxRetries) {
        retryCount.value++;
        // Exponential backoff
        setTimeout(() => fetchWithRetry(), 1000 * retryCount.value);
      } else {
        // Max retries reached
        error.value = 'Failed after multiple attempts';
      }
    }
  };
  
  return { fetchWithRetry };
}
```

## State Management Best Practices

### Reactive State Design

```typescript
// ✅ Proper reactive state management
export function useReactiveData() {
  // Use ref for primitive values
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Use ref for objects that will be replaced
  const data = ref<DataType | null>(null);
  
  // Use reactive for objects that will be mutated
  const form = reactive({
    name: '',
    email: '',
    settings: {}
  });
  
  // Use computed for derived state
  const isValid = computed(() => 
    form.name.length > 0 && form.email.includes('@')
  );
  
  return {
    // Expose readonly where appropriate
    loading: readonly(loading),
    error: readonly(error),
    data: readonly(data),
    
    // Expose mutable state
    form,
    isValid
  };
}
```

### Memory Management

```typescript
// ✅ Proper cleanup and memory management
export function useResourceManagement() {
  const subscription = ref<() => void>();
  
  const subscribe = () => {
    subscription.value = eventBus.on('event', handler);
  };
  
  // Cleanup function for components
  const cleanup = () => {
    subscription.value?.();
  };
  
  // Auto-cleanup when component unmounts
  onBeforeUnmount(() => {
    cleanup();
  });
  
  return { subscribe, cleanup };
}
```

## Performance Optimization

### Debounced Operations

```typescript
// ✅ Debounced search functionality
export function useDebouncedSearch() {
  const searchTerm = ref('');
  const debouncedSearch = debounce(async (term: string) => {
    if (term.length > 2) {
      await performSearch(term);
    }
  }, 300);
  
  // Watch for search term changes
  watch(searchTerm, (newTerm) => {
    debouncedSearch(newTerm);
  });
  
  return { searchTerm };
}
```

### Caching Strategies

```typescript
// ✅ Smart caching in composables
export function useCachedData() {
  const cache = new Map<string, { data: any; timestamp: number }>();
  const cacheTimeout = 5 * 60 * 1000; // 5 minutes
  
  const getCachedData = (key: string) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheTimeout) {
      return cached.data;
    }
    return null;
  };
  
  const setCachedData = (key: string, data: any) => {
    cache.set(key, { data, timestamp: Date.now() });
  };
  
  return { getCachedData, setCachedData };
}
```

## Testing Considerations

### Composable Testing

```typescript
// ✅ Testing composable functions
import { describe, it, expect, vi } from 'vitest';
import { useUser } from '../useUser';

describe('useUser', () => {
  it('should fetch user data correctly', async () => {
    const { fetchCurrentUser, currentUser, loading } = useUser();
    
    expect(loading.value).toBe(false);
    
    await fetchCurrentUser();
    
    expect(currentUser.value).toBeDefined();
    expect(loading.value).toBe(false);
  });
  
  it('should handle errors gracefully', async () => {
    // Mock service to throw error
    vi.mocked(userService.getCurrentUser).mockRejectedValue(
      new Error('API Error')
    );
    
    const { fetchCurrentUser, error } = useUser();
    
    await fetchCurrentUser();
    
    expect(error.value).toBe('Failed to fetch current user');
  });
});
```

### Mock Integration

```typescript
// ✅ Mocking services in tests
export function createMockUserService() {
  return {
    getCurrentUser: vi.fn(),
    getUserById: vi.fn(),
    updateUser: vi.fn()
  };
}

// Use in tests
const mockService = createMockUserService();
vi.mocked(UserService).mockImplementation(() => mockService);
```

## Security Considerations

### Data Sanitization

```typescript
// ✅ Input sanitization in composables
export function useSecureData() {
  const sanitizeInput = (input: string): string => {
    return input.trim().substring(0, 500); // Limit length
  };
  
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  return { sanitizeInput, validateEmail };
}
```

### Authentication Checks

```typescript
// ✅ Security checks in composables
export function useSecureOperations() {
  const { isAuthenticated, hasRole } = useAuth();
  
  const secureOperation = async (requiredRole?: string) => {
    if (!isAuthenticated.value) {
      throw new Error('Authentication required');
    }
    
    if (requiredRole && !hasRole(requiredRole)) {
      throw new Error('Insufficient permissions');
    }
    
    // Proceed with operation
  };
  
  return { secureOperation };
}
```

## Advanced Patterns

### Composable Composition

```typescript
// ✅ Combining multiple composables
export function useUserManagement() {
  const userComposable = useUser();
  const authComposable = useAuth();
  const searchComposable = useUserSearch();
  
  // Combined computed properties
  const canManageUsers = computed(() => 
    authComposable.isAuthenticated.value && 
    authComposable.hasRole('admin')
  );
  
  // Combined methods
  const refreshUserData = async () => {
    await userComposable.fetchCurrentUser();
    await searchComposable.searchUsers();
  };
  
  return {
    ...userComposable,
    ...authComposable,
    canManageUsers,
    refreshUserData
  };
}
```

### Event-Driven Updates

```typescript
// ✅ Event-driven composable updates
export function useEventDrivenData() {
  const data = ref<DataType[]>([]);
  
  // Listen for data updates
  onMounted(() => {
    eventBus.on('dataUpdated', (newData) => {
      data.value = newData;
    });
  });
  
  // Emit events on data changes
  const updateData = (newData: DataType) => {
    data.value.push(newData);
    eventBus.emit('dataUpdated', data.value);
  };
  
  return { data, updateData };
}
```

## Summary

The composables in the Accounts module provide a robust, reusable foundation for business logic abstraction. They follow Vue.js 3 Composition API best practices and integrate seamlessly with the broader application architecture.

**Key Benefits:**
- ✅ **Reactive State**: Full Vue 3 reactivity integration
- ✅ **Type Safety**: Complete TypeScript coverage
- ✅ **Reusability**: Designed for use across multiple components
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Performance**: Optimized with caching and debouncing
- ✅ **Testing**: Testable architecture with clear interfaces

**Composable Responsibilities:**
- **useAuth.ts**: Authentication state and OAuth flows
- **useUser.ts**: User profile and settings management
- **useKyc.ts**: KYC verification process handling
- **useUserSearch.ts**: User search and filtering functionality

**⚠️ CRITICAL ARCHITECTURE RULE:**
Composables must NEVER directly communicate with the backend. All data operations must go through:
1. **Layer 4 (Services)** for API calls - this is the ONLY way to access backend data

**❌ FORBIDDEN in Composables:**
```typescript
// ❌ NEVER do this in composables - violates Layer 3 boundaries
import apiClient from '../../../services/apiClient';

export function useUser() {
  // ❌ NEVER make direct HTTP calls from composables
  const fetchUser = async () => {
    const response = await apiClient.get('/users/me'); // WRONG!
    return response.data;
  };
}
```

**✅ CORRECT Layer 3 Architecture:**
```typescript
// ✅ Use services (Layer 4) for API communication
import { UserService } from '../services/user.service';

export function useUser() {
  const userService = new UserService(); // Layer 4 access
  
  const fetchUser = async () => {
    // Layer 3 → Layer 4 → Layer 5 flow
    return await userService.getCurrentUser();
  };
  
  return { fetchUser };
}

// ✅ Composables can also coordinate with stores (also Layer 3)
import { useUserStore } from '../stores/user.store';

export function useUser() {
  const userStore = useUserStore(); // Same layer coordination
  const userService = new UserService(); // Layer 4 access
  
  const fetchUser = async () => {
    const user = await userService.getCurrentUser(); // Layer 4
    userStore.setCurrentUser(user); // Layer 3 coordination
    return user;
  };
}
```

Each composable encapsulates specific business logic while maintaining clear interfaces and consistent patterns across the entire Accounts module.
