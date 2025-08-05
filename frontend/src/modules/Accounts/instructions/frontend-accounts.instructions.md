---
applyTo: "frontend/src/modules/Accounts/**/*.vue"
--- 
# Frontend Accounts Module Instructions

## Overview

The Accounts module is the **core authentication and user management system** for the frontend application. It provides a complete, enterprise-grade solution for user authentication, profile management, and KYC (Know Your Customer) verification processes. This module follows clean architecture principles and serves as the primary interface between the frontend application and the backend accounts API.

## Architecture & Design Principles

### Application Frontend Flow (MANDATORY)

This application follows a strict 5-layer architecture pattern that MUST be followed in all code:

```
🏗️ APPLICATION FRONTEND FLOW (MANDATORY)

1. View/Page (Route Components)
   📍 High-level route components (e.g. /accounts/profile)
   👉 Assemble sections, pass props to components
   
2. Section/Component (UI Elements)
   📍 UI elements, forms, cards, etc.
   👉 May access global state from a store or call a composable/hook
   
3. Store or Composable/Hook (State Management)
   📍 Manages state (e.g. userStore, useUser())
   👉 Fetches or updates data by calling a service
   
4. Service (Backend Communication)
   📍 Handles backend interaction via apiClient.ts
   👉 Makes actual HTTP requests (GET, POST, etc.)
   
5. apiClient.ts (HTTP Configuration)
   📍 Configured Axios instance with base URL, interceptors, etc.
   👉 Handles low-level HTTP details (tokens, errors, etc.)
```

### Clean Architecture Implementation

```
frontend/src/modules/Accounts/
├── views/             # Layer 1: Page-level route components
├── sections/          # Layer 2: High-level UI blocks  
├── components/        # Layer 2: Reusable UI components
├── stores/            # Layer 3: Pinia state management
├── composables/       # Layer 3: Vue composition functions
├── services/          # Layer 4: API communication layer
├── types/             # Type definitions (no layer)
├── utils/             # Utility functions and mappers (no layer)
├── routes.ts          # Module routing configuration
└── index.ts           # Module exports and initialization
```

### Core Design Principles

1. **Mandatory Flow Adherence**: All code MUST follow the 5-layer application flow
2. **Layer Isolation**: Each layer can only communicate with adjacent layers
3. **Single Responsibility**: Components, services, and stores focus on one task
4. **Dependency Direction**: Higher layers depend on lower layers, never reverse
5. **Backend Communication Boundary**: ONLY Layer 4 (Services) can access apiClient

### 🔄 Complete Application Flow Example

Here's how a typical user profile update flows through all layers:

```typescript
// LAYER 1: View/Page (auth.view.vue)
<template>
  <UserComponent :user-id="userId" @profile-updated="handleUpdate" />
</template>

<script setup lang="ts">
// Views assemble components and handle routing
const route = useRoute();
const userId = route.params.id as string;

const handleUpdate = () => {
  // Coordinate page-level actions
  router.push('/profile/success');
};
</script>

// LAYER 2: Component (UserComponent.vue)
<script setup lang="ts">
// Components access stores/composables for data
const { updateProfile, loading } = useUser();

const submitForm = async (formData) => {
  await updateProfile(formData);
};
</script>

// LAYER 3: Composable (useUser.ts)
export function useUser() {
  const userService = new UserService(); // Access Layer 4
  
  const updateProfile = async (data) => {
    return await userService.updateCurrentUser(data);
  };
}

// LAYER 4: Service (user.service.ts)
export class UserService {
  async updateCurrentUser(data: UserUpdateRequest) {
    // Only services can access apiClient (Layer 5)
    const response = await apiClient.put('/users/me', data);
    return mapBackendUserToFrontend(response.data);
  }
}

// LAYER 5: apiClient.ts
// Configured Axios instance with interceptors, base URL, etc.
```

### Backend Integration

The frontend module integrates seamlessly with the backend accounts module through:

- **RESTful API**: Standardized HTTP endpoints for all operations
- **OAuth Authentication**: Google and Azure OAuth flows only (no password auth)
- **JWT Token Management**: Automatic token refresh and validation
- **Data Mapping**: Consistent transformation between backend/frontend formats
- **Error Handling**: Unified error response processing
- **Type Safety**: Shared TypeScript interfaces and validation

## Module Structure & Components

### 1. Components (`/components/`)

**Purpose**: Reusable UI components for account-related functionality

#### Key Components:
- **`auth.component.vue`**: OAuth authentication interface
- **`user.component.vue`**: Unified user profile and settings management
- **`kyc.component.vue`**: KYC verification interface  
- **`UserRoleBadge.vue`**: Role display component (widely reused)

#### Best Practices:
```typescript
// ✅ Good: Component with clear props and events
<script setup lang="ts">
interface Props {
  userId?: string;
  editable?: boolean;
  mode?: 'profile' | 'settings';
}

const props = withDefaults(defineProps<Props>(), {
  editable: true,
  mode: 'profile'
});

const emit = defineEmits<{
  (e: 'update', data: UserUpdate): void;
  (e: 'error', error: string): void;
}>();
</script>
```

### 2. Composables (`/composables/`)

**Purpose**: Reactive business logic and state management

#### Key Composables:
- **`useAuth.ts`**: Authentication state and operations
- **`useUser.ts`**: User profile management
- **`useKyc.ts`**: KYC verification processes
- **`useUserSearch.ts`**: User search and filtering

#### Best Practices:
```typescript
// ✅ Good: Composable with clear return interface
export function useUser() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const user = ref<User | null>(null);

  const fetchUser = async (id: string) => {
    // Implementation with proper error handling
  };

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),
    user: readonly(user),
    
    // Actions
    fetchUser,
    updateUser,
    deleteUser
  };
}
```

### 3. Services (`/services/`)

**Purpose**: API communication and data fetching

#### Key Services:
- **`auth.service.ts`**: Authentication API calls
- **`user.service.ts`**: User management API calls
- **`kyc.service.ts`**: KYC verification API calls

#### Service Architecture:
```typescript
// ✅ Good: Service with standardized API client usage
export class UserService {
  private apiClient = useApiClient();

  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.apiClient.get('/api/users/profile');
      return mapBackendUserToFrontend(response.data);
    } catch (error) {
      throw handleServiceError(error, 'Failed to fetch user profile');
    }
  }
}
```

#### Integration with Backend:
- **Base URL**: `/api/auth`, `/api/users`, `/api/kyc`
- **Authentication**: Bearer token in Authorization header
- **Data Mapping**: Use mappers for all backend communication
- **Error Handling**: Consistent error response processing

### 4. Store (`/store/`)

**Purpose**: Global state management using Pinia

#### Key Stores:
- **`authStore.ts`**: Authentication state and token management
- **`userStore.ts`**: Current user profile state
- **`kycStore.ts`**: KYC verification state

#### Store Best Practices:
```typescript
// ✅ Good: Pinia store with actions and getters
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const accessToken = ref<string | null>(null);

  // Getters
  const fullName = computed(() => 
    user.value ? `${user.value.firstName} ${user.value.lastName}` : ''
  );

  // Actions
  async function login() {
    // OAuth login implementation
  }

  return {
    // State
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    
    // Getters
    fullName,
    
    // Actions
    login,
    logout
  };
});
```

### 5. Types (`/types/`)

**Purpose**: TypeScript type definitions for type safety

#### Key Type Files:
- **`user.types.ts`**: User-related interfaces
- **`auth.types.ts`**: Authentication interfaces
- **`kyc.types.ts`**: KYC verification interfaces

#### Type Safety Best Practices:
```typescript
// ✅ Good: Well-defined interfaces with proper documentation
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: UserSocialLinks;
  createdAt: string;
  updatedAt: string;
}

export interface UserUpdate {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: Partial<UserSocialLinks>;
}
```

### 6. Utils (`/utils/`)

**Purpose**: Utility functions and data mappers

#### Key Utilities:
- **`mappers.ts`**: Data transformation between backend/frontend
- **`errorHandling.ts`**: Error processing utilities

#### Mapper Best Practices:
```typescript
// ✅ Good: Pure mapper functions with null safety
export function mapBackendUserToFrontend(backendUser: any): User {
  return {
    id: backendUser.id,
    firstName: backendUser.firstName || backendUser.first_name,
    lastName: backendUser.lastName || backendUser.last_name,
    email: backendUser.email,
    role: backendUser.role,
    bio: backendUser.bio,
    location: backendUser.location,
    website: backendUser.website,
    socialLinks: backendUser.socialLinks || backendUser.social_links,
    createdAt: backendUser.createdAt || backendUser.created_at,
    updatedAt: backendUser.updatedAt || backendUser.updated_at,
  };
}
```

### 7. Views (`/views/`)

**Purpose**: Page-level components for routing

#### Consolidated Views:
- **`auth.view.vue`**: Authentication page (OAuth only)
- **`user.view.vue`**: User profile and settings page
- **`kyc.view.vue`**: KYC verification page

#### View Architecture:
```vue
<!-- ✅ Good: View as thin wrapper around components -->
<template>
  <div class="user-view">
    <UserComponent 
      :user-id="route.params.id" 
      :mode="currentMode"
      @update="handleUserUpdate" 
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import UserComponent from '../components/user.component.vue';

const route = useRoute();
const currentMode = computed(() => route.query.mode || 'profile');
</script>
```

## Authentication Flow

### OAuth Integration

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant OAuth Provider

    User->>Frontend: Click "Login with Google"
    Frontend->>Backend: GET /api/auth/google
    Backend->>OAuth Provider: Redirect to OAuth
    OAuth Provider->>User: Show consent screen
    User->>OAuth Provider: Grant permission
    OAuth Provider->>Backend: Callback with auth code
    Backend->>OAuth Provider: Exchange code for tokens
    OAuth Provider->>Backend: Return user profile
    Backend->>Frontend: Set JWT cookies & redirect
    Frontend->>Frontend: Update auth state
```

### Token Management

```typescript
// ✅ Automatic token refresh implementation
export const useAuthStore = defineStore('auth', () => {
  const setupSessionTimeoutMonitoring = () => {
    if (tokenExpiresAt.value) {
      const timeUntilExpiry = tokenExpiresAt.value - Date.now() - 60000; // 1 min buffer
      
      if (timeUntilExpiry > 0) {
        sessionTimeoutTimer.value = window.setTimeout(() => {
          refreshAccessToken();
        }, timeUntilExpiry);
      }
    }
  };
});
```

## Data Flow & State Management

### Unidirectional Data Flow

```
User Action → Component → Composable → Service → API → Backend
                ↓           ↓          ↓       ↓       ↓
            UI Update ← Store ← Response ← HTTP ← Database
```

### State Management Strategy

1. **Local State**: Component-specific reactive data
2. **Composable State**: Shared business logic state
3. **Global State**: Application-wide state (auth, current user)
4. **Server State**: API responses cached appropriately

## API Integration Patterns

### Service Layer Pattern

```typescript
// ✅ Standardized service method structure
export class UserService {
  async updateUser(id: string, data: UserUpdate): Promise<User> {
    try {
      // 1. Transform frontend data to backend format
      const backendData = mapFrontendUserToBackend(data);
      
      // 2. Make API call
      const response = await this.apiClient.patch(`/api/users/${id}`, backendData);
      
      // 3. Transform backend response to frontend format  
      return mapBackendUserToFrontend(response.data);
    } catch (error) {
      // 4. Handle and transform errors
      throw handleServiceError(error, 'Failed to update user');
    }
  }
}
```

### Error Handling Strategy

```typescript
// ✅ Centralized error handling
export function handleServiceError(error: any, defaultMessage: string): AppError {
  if (error.response?.status === 401) {
    // Handle authentication errors
    return new AppError('Authentication required', 401);
  }
  
  if (error.response?.status === 403) {
    // Handle authorization errors
    return new AppError('Access denied', 403);
  }
  
  if (error.response?.data?.message) {
    // Use backend error message
    return new AppError(error.response.data.message, error.response.status);
  }
  
  // Fallback to default message
  return new AppError(defaultMessage, 500);
}
```

## Security Best Practices

### Authentication Security

1. **OAuth Only**: No password authentication - reduces attack surface
2. **HTTP-Only Cookies**: Tokens stored in secure HTTP-only cookies
3. **Token Refresh**: Automatic token refresh for seamless UX
4. **Session Timeout**: Configurable session timeout monitoring

### Authorization Patterns

```typescript
// ✅ Role-based access control
export function useRoleGuard() {
  const authStore = useAuthStore();
  
  const hasRole = (requiredRole: UserRole): boolean => {
    return authStore.user?.role === requiredRole;
  };
  
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.includes(authStore.user?.role);
  };
  
  return { hasRole, hasAnyRole };
}
```

### Input Validation

```typescript
// ✅ Client-side validation with Zod
import { z } from 'zod';

const userUpdateSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional()
});

export function validateUserUpdate(data: unknown): UserUpdate {
  return userUpdateSchema.parse(data);
}
```

## Performance Optimization

### Code Splitting

```typescript
// ✅ Lazy loading for better performance
export const AuthComponent = defineAsyncComponent(() => 
  import('./auth.component.vue')
);

export const UserComponent = defineAsyncComponent(() => 
  import('./user.component.vue')  
);
```

### Caching Strategy

```typescript
// ✅ Smart caching in composables
export function useUser() {
  const cache = new Map<string, { data: User; timestamp: number }>();
  
  const fetchUser = async (id: string, forceRefresh = false) => {
    const cached = cache.get(id);
    const cacheAge = cached ? Date.now() - cached.timestamp : Infinity;
    
    if (!forceRefresh && cached && cacheAge < 300000) { // 5 min cache
      return cached.data;
    }
    
    // Fetch from API and update cache
    const user = await userService.getUserById(id);
    cache.set(id, { data: user, timestamp: Date.now() });
    return user;
  };
}
```

## Testing Strategy

### Component Testing

```typescript
// ✅ Component test example
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import UserComponent from '@/modules/Accounts/components/user.component.vue';

describe('UserComponent', () => {
  it('displays user information correctly', async () => {
    const wrapper = mount(UserComponent, {
      global: {
        plugins: [createPinia()]
      },
      props: {
        userId: 'test-user-id',
        mode: 'profile'
      }
    });
    
    // Test implementation
    expect(wrapper.find('[data-testid="user-name"]').text()).toBe('John Doe');
  });
});
```

### Service Testing

```typescript
// ✅ Service test with mocking
import { vi } from 'vitest';
import { UserService } from '@/modules/Accounts/services/user.service';

describe('UserService', () => {
  it('fetches user profile successfully', async () => {
    const mockResponse = { data: { id: '1', name: 'John' } };
    vi.mocked(apiClient.get).mockResolvedValue(mockResponse);
    
    const userService = new UserService();
    const result = await userService.getCurrentUser();
    
    expect(result.id).toBe('1');
  });
});
```

## Development Guidelines

### File Naming Conventions

- **Components**: `PascalCase.vue` (e.g., `UserProfile.vue`)
- **Composables**: `camelCase.ts` starting with `use` (e.g., `useAuth.ts`)
- **Services**: `camelCase.service.ts` (e.g., `user.service.ts`)
- **Types**: `camelCase.types.ts` (e.g., `user.types.ts`)
- **Stores**: `camelCase.store.ts` (e.g., `auth.store.ts`)

### Import Organization

```typescript
// ✅ Organized imports
// Vue imports
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// External library imports
import { z } from 'zod';

// Internal imports - services
import { UserService } from '../services/user.service';

// Internal imports - types
import type { User, UserUpdate } from '../types/user.types';

// Internal imports - composables
import { useAuth } from '../composables/useAuth';
```

### Error Boundaries

```vue
<!-- ✅ Error handling in components -->
<template>
  <div v-if="error" class="error-state">
    <ErrorMessage :error="error" @retry="handleRetry" />
  </div>
  <div v-else-if="loading" class="loading-state">
    <LoadingSpinner />
  </div>
  <div v-else class="content">
    <!-- Component content -->
  </div>
</template>
```

## Integration Points

### Router Integration

```typescript
// ✅ Module routes configuration
export const accountsRoutes: RouteRecordRaw[] = [
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('./views/auth.view.vue'),
    meta: { layout: 'AuthLayout', requiresGuest: true }
  },
  {
    path: '/profile',
    name: 'Profile', 
    component: () => import('./views/user.view.vue'),
    meta: { layout: 'DefaultLayout', requiresAuth: true }
  }
];
```

### Global State Integration

```typescript
// ✅ Store composition
export function useAccountsIntegration() {
  const authStore = useAuthStore();
  const userStore = useUserStore();
  const kycStore = useKycStore();
  
  return {
    // Authentication
    isAuthenticated: authStore.isAuthenticated,
    currentUser: authStore.user,
    
    // User management
    updateProfile: userStore.updateProfile,
    
    // KYC verification
    kycStatus: kycStore.status,
    initiateKyc: kycStore.initiate
  };
}
```

## Monitoring & Analytics

### Error Tracking

```typescript
// ✅ Error reporting integration
export function reportError(error: Error, context: Record<string, any>) {
  console.error('Accounts Module Error:', error, context);
  
  // Send to monitoring service
  if (import.meta.env.PROD) {
    analytics.track('error', {
      module: 'accounts',
      error: error.message,
      context
    });
  }
}
```

### User Analytics

```typescript
// ✅ User action tracking
export function trackUserAction(action: string, properties?: Record<string, any>) {
  analytics.track('user_action', {
    action,
    module: 'accounts',
    timestamp: new Date().toISOString(),
    ...properties
  });
}
```

## Maintenance & Updates

### Version Compatibility

- **Backend API**: Ensure compatibility with backend accounts module v2.x
- **Vue Version**: Compatible with Vue 3.4+
- **TypeScript**: Requires TypeScript 5.0+
- **Pinia**: Uses Pinia 2.x for state management

### Migration Guidelines

When updating the module:

1. **Review Breaking Changes**: Check backend API changes
2. **Update Types**: Sync TypeScript interfaces with backend
3. **Test Integration**: Run full integration test suite
4. **Update Documentation**: Keep this file current
5. **Version Dependencies**: Update package.json appropriately

## Troubleshooting

### Common Issues

1. **OAuth Redirect Issues**: Check OAuth provider configuration
2. **Token Refresh Failures**: Verify backend token endpoint
3. **Role Permission Errors**: Check role-based access control
4. **KYC Integration**: Verify KYC provider connectivity

### Debug Mode

```typescript
// ✅ Debug utilities
export const DEBUG = {
  AUTH: import.meta.env.VITE_DEBUG_AUTH === 'true',
  API: import.meta.env.VITE_DEBUG_API === 'true',
  KYC: import.meta.env.VITE_DEBUG_KYC === 'true'
};

if (DEBUG.AUTH) {
  console.log('🔐 Auth debug mode enabled');
}
```

---

## Summary

The Frontend Accounts Module provides a comprehensive, secure, and maintainable solution for user authentication and management. It integrates seamlessly with the backend through well-defined APIs, follows Vue.js best practices, and maintains high code quality standards.

**Key Benefits:**
- ✅ **Security First**: OAuth-only authentication with JWT token management
- ✅ **Type Safety**: Full TypeScript coverage with shared interfaces
- ✅ **Clean Architecture**: Separation of concerns and dependency inversion
- ✅ **Performance Optimized**: Code splitting and smart caching
- ✅ **Developer Experience**: Comprehensive tooling and debugging support
- ✅ **Maintainable**: Clear structure and extensive documentation
