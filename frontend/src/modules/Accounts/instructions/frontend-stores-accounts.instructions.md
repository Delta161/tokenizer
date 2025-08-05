---
applyTo: "frontend/src/modules/accounts/stores/*.ts"
---

# Frontend Accounts Module - Stores Instructions

## Overview
This document provides comprehensive instructions for developing, maintaining, and extending Pinia stores within the Frontend Accounts Module. Stores serve as the centralized state management layer, handling authentication state, user profiles, and KYC verification data while providing reactive interfaces for components and composables.

## Store Architecture

### 🏗️ Layer 3: Store (State Management)
Stores are **Layer 3** in the mandatory application frontend flow:

```
📍 LAYER 3: Store (State Management)
👉 Manages state (e.g. userStore, authStore, kycStore)
👉 Fetches or updates data by calling a service (Layer 4)
👉 Provides reactive state to Layer 2 (Components/Sections) and Layer 1 (Views)
```

### Store Definition
Stores are Pinia-based state management modules that:
- Provide centralized, reactive state management for the application
- Handle complex business logic and data transformation
- Integrate with services for API communication
- Maintain consistency across all application layers
- Support both Options API and Composition API patterns
- Implement proper error handling and loading states

### Mandatory Flow Integration
Stores must follow the application flow:
- **Layer 3 (Stores)** → **Layer 4 (Services)** → **Layer 5 (apiClient)**
- Stores are consumed by Layer 1 (Views) and Layer 2 (Components/Sections)
- Stores NEVER directly access apiClient - they must use Layer 4 (Services)

### Store Layer Responsibilities
- **State Management**: Centralized reactive state for user data, authentication, and KYC status
- **Business Logic**: Complex operations that span multiple components
- **Service Integration**: Coordination with API services for data persistence (Layer 4 only)
- **Error Handling**: Centralized error state management and propagation
- **Authentication**: Token management, session handling, and OAuth integration
- **Data Consistency**: Ensuring data integrity across the application
- **⚠️ NO DIRECT BACKEND COMMUNICATION**: Stores must NEVER directly call apiClient, axios, fetch, or any HTTP methods. All backend communication MUST go through services layer only.

## Current Store Implementation

### 1. AuthStore (Composition API Pattern)
```typescript
// Location: frontend/src/modules/Accounts/stores/auth.store.ts
// Purpose: Complete authentication state management with OAuth-only support
// Architecture: Composition API with reactive state and computed getters
```

**Key Features:**
- **OAuth-Only Authentication**: Deprecated password-based auth with clear error messages
- **Token Management**: JWT parsing, refresh token handling, and expiration monitoring
- **Session Management**: Automatic token refresh and session timeout handling
- **LocalStorage Integration**: Persistent authentication state across browser sessions
- **Mock User Support**: Temporary testing user creation for development
- **Role-Based Access**: Admin, client, and investor role computed properties

**State Structure:**
```typescript
// Reactive state
const user = ref<User | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const isAuthenticated = ref(false);
const accessToken = ref<string | null>(null);
const refreshToken = ref<string | null>(null);
const tokenExpiresAt = ref<number | null>(null);
const sessionTimeoutTimer = ref<number | null>(null);

// Computed getters
const fullName = computed(() => `${user.value?.firstName} ${user.value?.lastName}`.trim());
const isAdmin = computed(() => user.value?.role === 'admin');
const isClient = computed(() => user.value?.role === 'client');
const isInvestor = computed(() => user.value?.role === 'investor');
```

## 🔐 Session Management in Stores (Layer 3)

### CRITICAL: Session-Based State Management Implementation

Stores are **THE COORDINATION LAYER** for session management state. They coordinate with services (Layer 4) but never handle sessions directly. All session state management must follow these mandatory patterns:

### Session State Management Responsibilities

**✅ STORES MUST:**
- Coordinate authentication state with session-based services
- Maintain reactive authentication status based on session validity
- Handle service errors related to session expiration
- Clear authentication state when sessions expire
- Coordinate logout operations through services

**❌ STORES MUST NOT:**
- Make direct API calls for session validation (use services only)
- Manage session cookies directly (browser + services handle this)
- Implement session timers or client-side session logic
- Store session tokens or sensitive session data
- Parse or validate session data client-side

### Session-Based Store Implementation Patterns

#### 1. Authentication State Management
```typescript
// AuthStore with session-based authentication
export const useAuthStore = defineStore('auth', () => {
  // Simplified state for session-based auth
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isAuthenticated = computed(() => !!user.value);

  // Session authentication check
  const checkAuthentication = async (): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    
    try {
      // Delegate to service layer for session validation
      const result = await AuthService.checkAuth();
      if (result.isAuthenticated && result.user) {
        user.value = result.user;
        // Store user data for UI purposes only (not authentication)
        localStorage.setItem('user', JSON.stringify(result.user));
        return true;
      } else {
        clearAuthState();
        return false;
      }
    } catch (err: any) {
      console.error('Authentication check failed:', err);
      error.value = err.message || 'Failed to verify authentication status.';
      clearAuthState();
      return false;
    } finally {
      loading.value = false;
    }
  };

  return { user, loading, error, isAuthenticated, checkAuthentication };
});
```

#### 2. OAuth Login Coordination
```typescript
// OAuth provider login methods - redirect through services
const loginWithGoogle = (): void => {
  // Clear any existing error state
  error.value = null;
  // Delegate to service for OAuth redirect
  AuthService.loginWithGoogle(); // Service handles window.location.href
};

const loginWithAzure = (): void => {
  error.value = null;
  AuthService.loginWithAzure();
};

const loginWithApple = (): void => {
  error.value = null;
  AuthService.loginWithApple();
};
```

#### 3. OAuth Callback Handling
```typescript
// Handle OAuth callback after provider redirect
const handleOAuthCallback = async (): Promise<User | null> => {
  loading.value = true;
  error.value = null;
  
  try {
    // After OAuth redirect, backend has set session cookies
    // Service will fetch user profile using session
    const userData = await AuthService.getCurrentUser();
    user.value = userData;
    
    // Store user data for UI purposes only
    localStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
  } catch (err: any) {
    console.error('OAuth callback handling failed:', err);
    error.value = err.message || 'Failed to complete authentication.';
    clearAuthState();
    throw err;
  } finally {
    loading.value = false;
  }
};
```

#### 4. Session-Based Logout
```typescript
// Logout operation - coordinate with service
const logout = async (): Promise<void> => {
  loading.value = true;
  error.value = null;
  
  try {
    // Service destroys session on backend
    await AuthService.logout();
    clearAuthState();
  } catch (err: any) {
    console.error('Logout failed:', err);
    error.value = err.message || 'Failed to logout properly.';
    // Even if logout fails, clear local state
    clearAuthState();
    throw err;
  } finally {
    loading.value = false;
  }
};

// Clear authentication state (no session data to clear)
const clearAuthState = (): void => {
  user.value = null;
  error.value = null;
  // Only clear UI-related user data (not session data)
  localStorage.removeItem('user');
};
```

#### 5. Session Error Handling
```typescript
// Handle session-related errors from services
const handleSessionError = (error: any): void => {
  if (error.message?.includes('session expired') || 
      error.message?.includes('Session expired')) {
    console.warn('Session expired, clearing authentication state');
    clearAuthState();
    // Optionally redirect to login
    router.push('/login');
  } else if (error.response?.status === 401) {
    console.warn('Unauthorized access, session invalid');
    clearAuthState();
  } else {
    // Handle other errors normally
    console.error('Service error:', error);
    error.value = error.message || 'An error occurred';
  }
};
```

### Session State Initialization Pattern
```typescript
// Initialize authentication state on app start
const initializeAuth = async (): Promise<void> => {
  // Check if user data exists in localStorage (UI purposes only)
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      // Validate session with backend through service
      const isValid = await checkAuthentication();
      if (!isValid) {
        // Session invalid, clear stored user data
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      localStorage.removeItem('user');
    }
  }
};
```

### Session Management Store Architecture Flow

```
Store Action Called
    ↓
Coordinate with Service (Layer 4)
    ↓
Service Makes API Call with Session Cookie
    ↓
Backend Validates Session (Passport)
    ↓
Service Returns Result/Error to Store
    ↓
Store Updates Reactive State
    ↓
Components/Views React to State Changes
```

### Mandatory Session State Methods

All authentication stores must implement these methods:

```typescript
interface ISessionAwareStore {
  checkAuthentication(): Promise<boolean>;
  handleOAuthCallback(): Promise<User | null>;
  logout(): Promise<void>;
  clearAuthState(): void;
  initializeAuth(): Promise<void>;
}
```

### Session State Best Practices

1. **No Session Logic**: Stores coordinate state only, never implement session logic
2. **Service Delegation**: All session operations must be delegated to services
3. **Error Boundaries**: Proper error handling for session expiration scenarios
4. **State Clarity**: Clear separation between UI state and authentication state
5. **Reactive Updates**: Ensure state updates trigger component re-renders
6. **Storage Usage**: localStorage only for UI data, never for authentication tokens

### 2. UserStore (Options API Pattern)
```typescript
// Location: frontend/src/modules/Accounts/stores/user.store.ts
// Purpose: User profile management and admin user operations
// Architecture: Options API with state, getters, and actions
```

**Key Features:**
- **User Profile Management**: Current user fetching and updating
- **Admin Operations**: User listing and management for admin users
- **Service Integration**: Direct integration with UserService
- **Error Handling**: Consistent error state management
- **Loading States**: Proper loading indicators for async operations

**Store Structure:**
```typescript
state: () => ({
  currentUser: null as User | null,
  users: [] as User[],
  loading: false,
  error: null as string | null
}),

getters: {
  isAdmin: (state) => state.currentUser?.role === 'admin',
  isAuthenticated: (state) => !!state.currentUser,
  getUserById: (state) => (id: string) => state.users.find(user => user.id === id)
},

actions: {
  async fetchCurrentUser() { },
  async updateUser(userId: string, userData: UserUpdate) { },
  async fetchUsers() { }
}
```

### 3. KycStore (Options API Pattern)
```typescript
// Location: frontend/src/modules/Accounts/stores/kyc.store.ts
// Purpose: KYC verification state and document management
// Architecture: Options API with KYC status computed properties
```

**Key Features:**
- **KYC Status Management**: Verification status tracking and updates
- **Document Handling**: KYC submission and provider verification
- **Status Computed Properties**: Reactive KYC status indicators
- **Provider Integration**: Third-party KYC provider session management
- **Error Recovery**: Graceful error handling for KYC operations

**State and Getters:**
```typescript
state: () => ({
  kycRecord: null as KycRecord | null,
  isLoading: false,
  error: null as string | null,
}),

getters: {
  isVerified: (state) => state.kycRecord?.status === KycStatus.VERIFIED,
  isPending: (state) => state.kycRecord?.status === KycStatus.PENDING,
  isRejected: (state) => state.kycRecord?.status === KycStatus.REJECTED,
  isNotSubmitted: (state) => !state.kycRecord || state.kycRecord.status === KycStatus.NOT_SUBMITTED,
}
```

## Store Development Guidelines

### 1. Composition API Store Template
```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { DomainType, DomainUpdate, DomainCreateRequest } from '../types/domain.types';
import { DomainService } from '../services/domain.service';

export const useDomainStore = defineStore('domain', () => {
  // State - Use refs for reactive state
  const items = ref<DomainType[]>([]);
  const currentItem = ref<DomainType | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);

  // Getters - Use computed for derived state
  const itemCount = computed(() => items.value.length);
  const hasError = computed(() => !!error.value);
  const getItemById = computed(() => 
    (id: string) => items.value.find(item => item.id === id)
  );
  const filteredItems = computed(() => 
    (filter: string) => items.value.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    )
  );

  // Actions - Use async functions for state mutations
  async function fetchItems() {
    loading.value = true;
    error.value = null;
    
    try {
      const domainService = new DomainService();
      const result = await domainService.getAllItems();
      items.value = result;
      isInitialized.value = true;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch items';
      console.error('Error in fetchItems:', err);
    } finally {
      loading.value = false;
    }
  }

  async function createItem(itemData: DomainCreateRequest) {
    loading.value = true;
    error.value = null;
    
    try {
      const domainService = new DomainService();
      const newItem = await domainService.createItem(itemData);
      items.value.unshift(newItem);
      return newItem;
    } catch (err: any) {
      error.value = err.message || 'Failed to create item';
      console.error('Error in createItem:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateItem(id: string, itemData: DomainUpdate) {
    loading.value = true;
    error.value = null;
    
    try {
      const domainService = new DomainService();
      const updatedItem = await domainService.updateItem(id, itemData);
      
      // Update current item if it matches
      if (currentItem.value && currentItem.value.id === id) {
        currentItem.value = updatedItem;
      }
      
      // Update in items array
      const index = items.value.findIndex(item => item.id === id);
      if (index !== -1) {
        items.value[index] = updatedItem;
      }
      
      return updatedItem;
    } catch (err: any) {
      error.value = err.message || 'Failed to update item';
      console.error('Error in updateItem:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteItem(id: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const domainService = new DomainService();
      await domainService.deleteItem(id);
      
      // Remove from items array
      items.value = items.value.filter(item => item.id !== id);
      
      // Clear current item if it matches
      if (currentItem.value && currentItem.value.id === id) {
        currentItem.value = null;
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete item';
      console.error('Error in deleteItem:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function setCurrentItem(item: DomainType | null) {
    currentItem.value = item;
  }

  function clearError() {
    error.value = null;
  }

  function resetState() {
    items.value = [];
    currentItem.value = null;
    loading.value = false;
    error.value = null;
    isInitialized.value = false;
  }

  // Return store interface
  return {
    // State (readonly for external access)
    items: readonly(items),
    currentItem: readonly(currentItem),
    loading: readonly(loading),
    error: readonly(error),
    isInitialized: readonly(isInitialized),
    
    // Getters
    itemCount,
    hasError,
    getItemById,
    filteredItems,
    
    // Actions
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    setCurrentItem,
    clearError,
    resetState
  };
});
```

### 2. Options API Store Template
```typescript
import { defineStore } from 'pinia';
import type { DomainType, DomainUpdate, DomainCreateRequest } from '../types/domain.types';
import { DomainService } from '../services/domain.service';

export const useDomainStore = defineStore('domain', {
  state: () => ({
    items: [] as DomainType[],
    currentItem: null as DomainType | null,
    loading: false,
    error: null as string | null,
    isInitialized: false
  }),

  getters: {
    itemCount: (state) => state.items.length,
    hasError: (state) => !!state.error,
    getItemById: (state) => (id: string) => 
      state.items.find(item => item.id === id),
    filteredItems: (state) => (filter: string) =>
      state.items.filter(item => 
        item.name.toLowerCase().includes(filter.toLowerCase())
      )
  },

  actions: {
    async fetchItems() {
      this.loading = true;
      this.error = null;
      
      try {
        const domainService = new DomainService();
        const result = await domainService.getAllItems();
        this.items = result;
        this.isInitialized = true;
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch items';
        console.error('Error in fetchItems:', err);
      } finally {
        this.loading = false;
      }
    },

    async createItem(itemData: DomainCreateRequest) {
      this.loading = true;
      this.error = null;
      
      try {
        const domainService = new DomainService();
        const newItem = await domainService.createItem(itemData);
        this.items.unshift(newItem);
        return newItem;
      } catch (err: any) {
        this.error = err.message || 'Failed to create item';
        console.error('Error in createItem:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateItem(id: string, itemData: DomainUpdate) {
      this.loading = true;
      this.error = null;
      
      try {
        const domainService = new DomainService();
        const updatedItem = await domainService.updateItem(id, itemData);
        
        // Update current item if it matches
        if (this.currentItem && this.currentItem.id === id) {
          this.currentItem = updatedItem;
        }
        
        // Update in items array
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
          this.items[index] = updatedItem;
        }
        
        return updatedItem;
      } catch (err: any) {
        this.error = err.message || 'Failed to update item';
        console.error('Error in updateItem:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteItem(id: string) {
      this.loading = true;
      this.error = null;
      
      try {
        const domainService = new DomainService();
        await domainService.deleteItem(id);
        
        // Remove from items array
        this.items = this.items.filter(item => item.id !== id);
        
        // Clear current item if it matches
        if (this.currentItem && this.currentItem.id === id) {
          this.currentItem = null;
        }
      } catch (err: any) {
        this.error = err.message || 'Failed to delete item';
        console.error('Error in deleteItem:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    setCurrentItem(item: DomainType | null) {
      this.currentItem = item;
    },

    clearError() {
      this.error = null;
    },

    resetState() {
      this.items = [];
      this.currentItem = null;
      this.loading = false;
      this.error = null;
      this.isInitialized = false;
    }
  }
});
```

## Authentication Store Patterns

### 1. OAuth-Only Authentication
```typescript
// Deprecated methods with clear error messages
async function login() {
  error.value = 'Direct login is not supported. Please use OAuth authentication.';
  throw new Error('Direct login is not supported. Please use OAuth authentication.');
}

async function register() {
  error.value = 'Direct registration is not supported. Please use OAuth authentication.';
  throw new Error('Direct registration is not supported. Please use OAuth authentication.');
}
```

### 2. Token Management
```typescript
// JWT token parsing
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

// Token refresh handling
async function refreshAccessToken() {
  if (!refreshToken.value) {
    clearAuthData();
    return false;
  }
  
  try {
    const response = await AuthService.refreshToken(refreshToken.value);
    
    // Update tokens
    accessToken.value = response.accessToken;
    if (response.refreshToken) {
      refreshToken.value = response.refreshToken;
    }
    
    // Update expiration times
    if (accessToken.value) {
      const tokenData = parseJwt(accessToken.value);
      if (tokenData && tokenData.exp) {
        tokenExpiresAt.value = tokenData.exp * 1000;
      }
    }
    
    // Update localStorage
    localStorage.setItem('accessToken', accessToken.value);
    if (response.refreshToken) localStorage.setItem('refreshToken', refreshToken.value);
    if (tokenExpiresAt.value) localStorage.setItem('tokenExpiresAt', tokenExpiresAt.value.toString());
    
    isAuthenticated.value = true;
    return true;
  } catch (err) {
    console.error('Error refreshing token:', err);
    clearAuthData();
    return false;
  }
}
```

### 3. Session Management
```typescript
// Session timeout monitoring
function setupSessionTimeoutMonitoring() {
  // Clear any existing timers
  if (sessionTimeoutTimer.value) {
    window.clearTimeout(sessionTimeoutTimer.value);
    sessionTimeoutTimer.value = null;
  }
  
  // If we have a token expiration time, set up a timer to refresh before it expires
  if (tokenExpiresAt.value) {
    const currentTime = Date.now();
    const timeUntilExpiry = tokenExpiresAt.value - currentTime;
    
    // If token is already expired, try to refresh immediately
    if (timeUntilExpiry <= 0) {
      refreshAccessToken();
      return;
    }
    
    // Set timer to refresh 1 minute before expiry
    const refreshTime = Math.max(timeUntilExpiry - 60000, 0); // 1 minute before expiry, minimum 0
    sessionTimeoutTimer.value = window.setTimeout(() => {
      refreshAccessToken();
    }, refreshTime);
  }
}

// Auth data cleanup
function clearAuthData() {
  user.value = null;
  accessToken.value = null;
  refreshToken.value = null;
  tokenExpiresAt.value = null;
  refreshTokenExpiresAt.value = null;
  isAuthenticated.value = false;
  
  // Clear localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiresAt');
  localStorage.removeItem('refreshTokenExpiresAt');
  
  // Clear any session timeout timers
  if (sessionTimeoutTimer.value) {
    window.clearTimeout(sessionTimeoutTimer.value);
    sessionTimeoutTimer.value = null;
  }
}
```

## Service Integration Patterns

### 1. Service Instance Creation
```typescript
// Option 1: Create service instance in action
async function fetchCurrentUser() {
  this.loading = true;
  this.error = null;
  
  try {
    const userService = new UserService();
    const user = await userService.getCurrentUser();
    this.currentUser = user;
  } catch (error: any) {
    this.error = error.message || 'Failed to fetch current user';
    console.error('Error fetching current user:', error);
  } finally {
    this.loading = false;
  }
}

// Option 2: Static service methods
async function submitKyc(data: KycSubmissionData) {
  this.isLoading = true;
  this.error = null;
  
  try {
    this.kycRecord = await KycService.submitKyc(data);
    return this.kycRecord;
  } catch (error) {
    this.error = error.message || 'Failed to submit KYC';
    console.error('Error submitting KYC:', error);
    throw error;
  } finally {
    this.isLoading = false;
  }
}
```

### 2. Error Handling Patterns
```typescript
// Consistent error handling across all actions
async function actionWithErrorHandling() {
  this.loading = true;
  this.error = null;
  
  try {
    const result = await serviceMethod();
    // Update state with result
    return result;
  } catch (err: any) {
    // Set user-friendly error message
    this.error = err.message || 'Operation failed. Please try again.';
    
    // Log detailed error for debugging
    console.error('Error in actionWithErrorHandling:', err);
    
    // Re-throw for component-level handling if needed
    throw err;
  } finally {
    // Always reset loading state
    this.loading = false;
  }
}

// Special error handling for authentication
async function logout() {
  loading.value = true;
  error.value = null;
  
  try {
    await AuthService.logout();
    clearAuthData();
  } catch (err: any) {
    console.error('Error in logout:', err);
    error.value = err.message || 'Failed to logout. Please try again.';
    // Even if the API call fails, clear local auth data
    clearAuthData();
    throw err;
  } finally {
    loading.value = false;
  }
}
```

### 3. State Synchronization
```typescript
// Update multiple state locations when data changes
async function updateUser(userId: string, userData: UserUpdate) {
  this.loading = true;
  this.error = null;
  
  try {
    const userService = new UserService();
    const updatedUser = await userService.updateUser(userId, userData);
    
    // Update current user if it matches
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = updatedUser;
    }
    
    // Update user in users array if it exists
    const index = this.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      this.users[index] = updatedUser;
    }
    
    return updatedUser;
  } catch (error: any) {
    this.error = error.message || 'Failed to update user';
    console.error('Error updating user:', error);
    throw error;
  } finally {
    this.loading = false;
  }
}
```

## Store State Management

### 1. Reactive State Design
```typescript
// Composition API - Use refs for reactive primitives
const items = ref<Item[]>([]);
const currentItem = ref<Item | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const filters = ref({
  search: '',
  status: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc' as 'asc' | 'desc'
});

// Options API - Use object properties
state: () => ({
  items: [] as Item[],
  currentItem: null as Item | null,
  loading: false,
  error: null as string | null,
  filters: {
    search: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  }
})
```

### 2. Computed Properties and Getters
```typescript
// Composition API - Use computed
const itemCount = computed(() => items.value.length);
const hasError = computed(() => !!error.value);
const isLoading = computed(() => loading.value);
const filteredItems = computed(() => {
  let result = items.value;
  
  if (filters.value.search) {
    result = result.filter(item => 
      item.name.toLowerCase().includes(filters.value.search.toLowerCase())
    );
  }
  
  if (filters.value.status !== 'all') {
    result = result.filter(item => item.status === filters.value.status);
  }
  
  // Apply sorting
  result.sort((a, b) => {
    const aVal = a[filters.value.sortBy];
    const bVal = b[filters.value.sortBy];
    const modifier = filters.value.sortOrder === 'asc' ? 1 : -1;
    
    if (aVal < bVal) return -1 * modifier;
    if (aVal > bVal) return 1 * modifier;
    return 0;
  });
  
  return result;
});

// Options API - Use getters
getters: {
  itemCount: (state) => state.items.length,
  hasError: (state) => !!state.error,
  isLoading: (state) => state.loading,
  filteredItems: (state) => {
    let result = state.items;
    
    if (state.filters.search) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(state.filters.search.toLowerCase())
      );
    }
    
    if (state.filters.status !== 'all') {
      result = result.filter(item => item.status === state.filters.status);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aVal = a[state.filters.sortBy];
      const bVal = b[state.filters.sortBy];
      const modifier = state.filters.sortOrder === 'asc' ? 1 : -1;
      
      if (aVal < bVal) return -1 * modifier;
      if (aVal > bVal) return 1 * modifier;
      return 0;
    });
    
    return result;
  }
}
```

### 3. Local Storage Integration
```typescript
// Authentication data persistence
function setAuthData(response: any) {
  user.value = response.user;
  accessToken.value = response.accessToken;
  refreshToken.value = response.refreshToken;
  isAuthenticated.value = true;
  
  // Parse JWT to get expiration times
  if (accessToken.value) {
    const tokenData = parseJwt(accessToken.value);
    if (tokenData && tokenData.exp) {
      tokenExpiresAt.value = tokenData.exp * 1000; // Convert to milliseconds
    }
  }
  
  // Store in localStorage
  localStorage.setItem('user', JSON.stringify(user.value));
  localStorage.setItem('accessToken', accessToken.value);
  localStorage.setItem('refreshToken', refreshToken.value);
  if (tokenExpiresAt.value) localStorage.setItem('tokenExpiresAt', tokenExpiresAt.value.toString());
  
  // Set up session timeout monitoring
  setupSessionTimeoutMonitoring();
}

// Initialize from localStorage
function initializeAuth() {
  const storedUser = localStorage.getItem('user');
  const storedAccessToken = localStorage.getItem('accessToken');
  const storedRefreshToken = localStorage.getItem('refreshToken');
  const storedTokenExpiresAt = localStorage.getItem('tokenExpiresAt');
  
  if (storedUser) user.value = JSON.parse(storedUser);
  if (storedAccessToken) accessToken.value = storedAccessToken;
  if (storedRefreshToken) refreshToken.value = storedRefreshToken;
  if (storedTokenExpiresAt) tokenExpiresAt.value = parseInt(storedTokenExpiresAt);
  
  isAuthenticated.value = !!accessToken.value && !!user.value;
  
  // Check if token is expired and needs refresh
  if (isAuthenticated.value && tokenExpiresAt.value && Date.now() >= tokenExpiresAt.value) {
    refreshAccessToken();
  }
  
  // Set up session timeout monitoring
  setupSessionTimeoutMonitoring();
}
```

## Testing Store Logic

### 1. Store Unit Tests
```typescript
// auth.store.spec.ts
import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../auth.store';
import { AuthService } from '../../services/auth.service';

// Mock AuthService
vi.mock('../../services/auth.service');

describe('AuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const authStore = useAuthStore();
      
      expect(authStore.user).toBe(null);
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.loading).toBe(false);
      expect(authStore.error).toBe(null);
    });

    it('should restore authentication state from localStorage', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user' as const
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('tokenExpiresAt', (Date.now() + 3600000).toString());
      
      const authStore = useAuthStore();
      
      expect(authStore.user).toEqual(mockUser);
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.accessToken).toBe('mock-token');
    });
  });

  describe('computed properties', () => {
    it('should compute fullName correctly', () => {
      const authStore = useAuthStore();
      
      authStore.user = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user'
      };
      
      expect(authStore.fullName).toBe('John Doe');
    });

    it('should compute user roles correctly', () => {
      const authStore = useAuthStore();
      
      authStore.user = {
        id: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      };
      
      expect(authStore.isAdmin).toBe(true);
      expect(authStore.isClient).toBe(false);
      expect(authStore.isInvestor).toBe(false);
    });
  });

  describe('actions', () => {
    it('should handle logout successfully', async () => {
      const authStore = useAuthStore();
      
      // Set up authenticated state
      authStore.user = { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'user' };
      authStore.isAuthenticated = true;
      authStore.accessToken = 'mock-token';
      
      vi.mocked(AuthService.logout).mockResolvedValue({ message: 'Logged out successfully' });
      
      await authStore.logout();
      
      expect(authStore.user).toBe(null);
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.accessToken).toBe(null);
      expect(localStorage.getItem('user')).toBe(null);
      expect(localStorage.getItem('accessToken')).toBe(null);
    });

    it('should handle logout failure gracefully', async () => {
      const authStore = useAuthStore();
      
      // Set up authenticated state
      authStore.user = { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'user' };
      authStore.isAuthenticated = true;
      
      const mockError = new Error('Logout failed');
      vi.mocked(AuthService.logout).mockRejectedValue(mockError);
      
      await expect(authStore.logout()).rejects.toThrow('Logout failed');
      
      // Should still clear local auth data even if API call fails
      expect(authStore.user).toBe(null);
      expect(authStore.isAuthenticated).toBe(false);
    });

    it('should refresh token successfully', async () => {
      const authStore = useAuthStore();
      
      authStore.refreshToken = 'mock-refresh-token';
      
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };
      
      vi.mocked(AuthService.refreshToken).mockResolvedValue(mockResponse);
      
      const result = await authStore.refreshAccessToken();
      
      expect(result).toBe(true);
      expect(authStore.accessToken).toBe('new-access-token');
      expect(authStore.refreshToken).toBe('new-refresh-token');
      expect(authStore.isAuthenticated).toBe(true);
    });
  });
});
```

### 2. Integration Tests
```typescript
// user.store.integration.spec.ts
import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '../user.store';
import { setupTestServer, teardownTestServer } from '../../../../tests/setup';

describe('UserStore Integration', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    await setupTestServer();
  });

  afterEach(async () => {
    await teardownTestServer();
  });

  it('should fetch and store current user', async () => {
    const userStore = useUserStore();
    
    await userStore.fetchCurrentUser();
    
    expect(userStore.currentUser).toBeDefined();
    expect(userStore.currentUser?.id).toBeTruthy();
    expect(userStore.loading).toBe(false);
    expect(userStore.error).toBe(null);
  });

  it('should update user successfully', async () => {
    const userStore = useUserStore();
    
    // First fetch current user
    await userStore.fetchCurrentUser();
    const userId = userStore.currentUser!.id;
    
    const updateData = { firstName: 'Updated Name' };
    const updatedUser = await userStore.updateUser(userId, updateData);
    
    expect(updatedUser.firstName).toBe('Updated Name');
    expect(userStore.currentUser?.firstName).toBe('Updated Name');
  });
});
```

## Store Index and Exports

### 1. Store Index File
```typescript
/**
 * Store Index
 * 
 * This file exports all stores from the Accounts module.
 */

export { useUserStore } from './user.store';
export { useAuthStore } from './auth.store';
export { useKycStore } from './kyc.store';

// Export default instances for convenience when needed
import { useUserStore } from './user.store';
import { useAuthStore } from './auth.store';
import { useKycStore } from './kyc.store';

// Note: Pinia stores are already singletons, so these are just convenience exports
// Use the composable functions directly in components and composables
```

### 2. Module Integration
```typescript
// In module barrel file (modules/Accounts/index.ts)
export {
  useUserStore,
  useAuthStore,
  useKycStore
} from './stores';

// Usage in components
import { useAuthStore, useUserStore } from '@/modules/Accounts';

// Or direct imports
import { useAuthStore } from '@/modules/Accounts/stores/auth.store';
```

## Performance Optimization

### 1. State Normalization
```typescript
// Instead of nested objects, use normalized state
interface NormalizedState {
  users: Record<string, User>;
  userIds: string[];
  currentUserId: string | null;
  loading: boolean;
  error: string | null;
}

// Getters for denormalized access
const allUsers = computed(() => 
  userIds.value.map(id => users.value[id])
);

const currentUser = computed(() => 
  currentUserId.value ? users.value[currentUserId.value] : null
);
```

### 2. Lazy Loading and Caching
```typescript
// Cache with expiration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

const cache = ref<Record<string, CacheEntry<any>>>({});
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchUserById(id: string, useCache = true) {
  const cacheKey = `user:${id}`;
  
  if (useCache && cache.value[cacheKey]) {
    const entry = cache.value[cacheKey];
    if (Date.now() < entry.expiry) {
      return entry.data;
    }
  }
  
  loading.value = true;
  try {
    const userService = new UserService();
    const user = await userService.getUserById(id);
    
    // Cache the result
    cache.value[cacheKey] = {
      data: user,
      timestamp: Date.now(),
      expiry: Date.now() + CACHE_DURATION
    };
    
    return user;
  } finally {
    loading.value = false;
  }
}
```

### 3. Selective State Updates
```typescript
// Instead of replacing entire arrays, use selective updates
function updateUserInList(updatedUser: User) {
  const index = users.value.findIndex(user => user.id === updatedUser.id);
  if (index !== -1) {
    // Use splice to trigger reactivity
    users.value.splice(index, 1, updatedUser);
  } else {
    users.value.push(updatedUser);
  }
}

// Batch updates for better performance
function batchUpdateUsers(updates: Partial<Record<string, User>>) {
  Object.entries(updates).forEach(([id, userData]) => {
    const index = users.value.findIndex(user => user.id === id);
    if (index !== -1 && userData) {
      users.value[index] = { ...users.value[index], ...userData };
    }
  });
}
```

## Store Communication Patterns

### 1. Cross-Store Communication
```typescript
// In AuthStore - notify other stores of auth changes
async function logout() {
  try {
    await AuthService.logout();
    clearAuthData();
    
    // Reset related stores
    const userStore = useUserStore();
    const kycStore = useKycStore();
    
    userStore.resetState();
    kycStore.resetState();
  } catch (error) {
    // Handle error
  }
}

// In UserStore - watch for auth changes
import { storeToRefs } from 'pinia';

function setupAuthWatcher() {
  const authStore = useAuthStore();
  const { isAuthenticated } = storeToRefs(authStore);
  
  watch(isAuthenticated, (newValue) => {
    if (!newValue) {
      // User logged out, clear user data
      resetState();
    }
  });
}
```

### 2. Event-Based Communication
```typescript
// Custom event system for stores
import mitt from 'mitt';

type Events = {
  'user:updated': User;
  'user:deleted': string;
  'auth:logout': void;
  'kyc:verified': KycRecord;
};

const eventBus = mitt<Events>();

// In UserStore
async function updateUser(id: string, userData: UserUpdate) {
  try {
    const updatedUser = await userService.updateUser(id, userData);
    
    // Update local state
    // ... state update logic
    
    // Emit event for other stores
    eventBus.emit('user:updated', updatedUser);
    
    return updatedUser;
  } catch (error) {
    // Handle error
  }
}

// In AuthStore - listen for user updates
onMounted(() => {
  eventBus.on('user:updated', (updatedUser) => {
    if (user.value && user.value.id === updatedUser.id) {
      user.value = updatedUser;
    }
  });
});
```

## Best Practices Summary

### ✅ Do's
- Use Pinia's `defineStore` for all store definitions
- Implement proper loading and error states for all async operations
- Use TypeScript interfaces for all state properties
- Handle service errors gracefully with user-friendly messages
- Implement proper cleanup in logout and reset functions
- Use computed properties/getters for derived state
- Persist critical authentication data in localStorage
- Implement token refresh and session management
- Use readonly() for state exports in Composition API stores
- Write comprehensive unit tests for store logic
- Use proper error logging for debugging
- Implement cache invalidation strategies
- Follow consistent naming conventions

### ❌ Don'ts
- Don't mutate state directly outside of actions
- Don't implement password-based authentication (OAuth-only)
- Don't ignore error states in store actions
- Don't forget to reset loading states in finally blocks
- Don't skip localStorage cleanup on logout
- Don't hardcode sensitive data in stores
- Don't forget to handle edge cases in token refresh
- Don't skip testing for error scenarios
- Don't create circular dependencies between stores
- Don't use any types (maintain strict TypeScript)
- Don't ignore session timeout handling
- Don't forget to clear timers and watchers on cleanup

## Migration and Legacy Support

### OAuth Transition
```typescript
// Clear deprecation notices for removed functionality
/**
 * @deprecated Password-based authentication is no longer supported
 * @see OAuth authentication flow
 * @since v2.0.0 OAuth-only architecture
 */
async function login() {
  error.value = 'Direct login is not supported. Please use OAuth authentication.';
  throw new Error('Direct login is not supported. Please use OAuth authentication.');
}
```

### Store Migration Patterns
```typescript
// Version-aware state migration
function migrateStoreState() {
  const version = localStorage.getItem('storeVersion');
  
  if (!version || version < '2.0.0') {
    // Migrate from old auth structure
    const oldAuthData = localStorage.getItem('oldAuthData');
    if (oldAuthData) {
      // Convert and migrate
      localStorage.removeItem('oldAuthData');
      localStorage.setItem('storeVersion', '2.0.0');
    }
  }
}
```

---

---

## Store Architecture Best Practices

**⚠️ CRITICAL ARCHITECTURE RULE:**
Stores must NEVER directly communicate with the backend. All data operations must go through:
1. **Layer 4 (Services)** for API calls - this is the ONLY way to access backend data

**❌ FORBIDDEN in Stores:**
```typescript
// ❌ NEVER do this in stores - violates Layer 3 boundaries
import apiClient from '../../../services/apiClient';

export const useAuthStore = defineStore('auth', () => {
  // ❌ NEVER make direct HTTP calls from stores
  const login = async () => {
    const response = await apiClient.post('/auth/login'); // WRONG!
    user.value = response.data;
  };
});
```

**✅ CORRECT Layer 3 Architecture:**
```typescript
// ✅ Use services (Layer 4) for API communication
import { AuthService } from '../services/auth.service';

export const useAuthStore = defineStore('auth', () => {
  const authService = new AuthService(); // Layer 4 access
  
  const login = async () => {
    // Layer 3 → Layer 4 → Layer 5 flow
    const userData = await authService.login();
    user.value = userData;
  };
  
  return { login, user };
});

// ✅ Stores coordinate state, services handle data
import { UserService } from '../services/user.service';

export const useUserStore = defineStore('user', () => {
  const users = ref([]);
  const userService = new UserService(); // Layer 4 access
  
  const fetchUsers = async () => {
    const userData = await userService.getAllUsers(); // Layer 4
    users.value = userData; // Layer 3 state management
  };
});
```

*This instruction document ensures consistent, high-quality store development within the Frontend Accounts Module while maintaining proper state management, authentication handling, and integration with the service layer.*
