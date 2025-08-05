---
applyTo: "frontend/src/modules/Accounts/components/*.vue"
---

# Frontend Accounts Components Instructions

## Overview

The components folder contains **reusable UI components** for the Accounts module. These components are designed following Vue.js 3 Composition API best practices, with clear separation of concerns, type safety, and consistent patterns across the entire application.

## Component Architecture

### 🏗️ Layer 2: Section/Component (UI Elements)
Components are **Layer 2** in the mandatory application frontend flow:

```
📍 LAYER 2: Section/Component (UI Elements)
👉 UI elements, forms, cards, etc.
👉 May access global state from a store or call a composable/hook
👉 Handle user interactions and display logic
```

### Design Principles

1. **Single Responsibility**: Each component handles one specific UI concern
2. **Reusability**: Components are designed to be reused across different views  
3. **Composition Over Inheritance**: Uses Vue 3 Composition API patterns
4. **Type Safety**: Full TypeScript coverage with proper type definitions
5. **Props Interface**: Clear, well-defined props with defaults and validation
6. **Event Emission**: Consistent event naming and payload structure
7. **⚠️ NO DIRECT BACKEND COMMUNICATION**: Components must NEVER directly call apiClient, axios, fetch, or any HTTP methods. All backend communication MUST go through services layer only.

### Mandatory Flow Integration
Components must follow the application flow:
- **Layer 2 (Components)** → **Layer 3 (Stores/Composables)** → **Layer 4 (Services)** → **Layer 5 (apiClient)**
- Components can access stores directly or use composables for business logic
- Components receive data through props from Layer 1 (Views) or access Layer 3 (Stores/Composables)

### Component Structure Pattern

```typescript
// ✅ Standard component structure
<template>
  <!-- Clean, semantic HTML with proper accessibility -->
</template>

<script setup lang="ts">
// Imports
import { ref, computed, onMounted } from 'vue';
import type { ComponentProps } from '../types';

// Props definition with defaults
interface Props {
  // Required props
  userId: string;
  // Optional props with defaults
  editable?: boolean;
  autoLoad?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  editable: true,
  autoLoad: true
});

// Events definition
const emit = defineEmits<{
  (e: 'update', data: UpdateData): void;
  (e: 'error', error: string): void;
}>();

// Component state
const loading = ref(false);
const error = ref<string | null>(null);

// Computed properties
const computedValue = computed(() => {
  // Logic here
});

// Methods
const handleAction = async () => {
  // Implementation
};

// Lifecycle
onMounted(async () => {
  // Initialization
});
</script>
```

## Component Specifications

### 1. auth.component.vue

**Purpose**: OAuth authentication interface for login and registration

#### Key Features:
- **OAuth Integration**: Google and Azure OAuth flows only
- **Dynamic Mode**: Switches between login/register based on route
- **Loading States**: Proper loading indicators during OAuth flow  
- **Error Handling**: User-friendly error messages for auth failures
- **Route Integration**: Seamless integration with Vue Router

#### Props Interface:
```typescript
// No props - component is self-contained for OAuth flows
```

#### Events:
```typescript
// No events - component handles auth internally and updates store
```

#### Usage Pattern:
```vue
<template>
  <AuthComponent />
</template>
```

#### Implementation Notes:
- Uses `useAuthStore` for state management
- Handles OAuth provider redirects automatically
- Manages loading and error states internally  
- No password authentication - OAuth only
- Integrates with backend `/api/auth/:provider` endpoints

## 🔐 Session Management Restrictions

### CRITICAL: Components and Session Management

Components are **UI PRESENTATION LAYER ONLY** and must never handle session management directly. All session-related operations must be properly delegated to stores and services.

### Session Management Component Rules

**❌ COMPONENTS MUST NEVER:**
- Make direct API calls for session validation or authentication
- Handle session cookies, tokens, or session storage manually
- Implement session timeout logic or session expiration handling
- Call authentication endpoints directly (login, logout, profile)
- Parse or validate session data client-side
- Implement OAuth callback handling logic
- Store authentication tokens in component state

**✅ COMPONENTS MUST:**
- Display authentication status from stores (`isAuthenticated` computed)
- Show user data received from authenticated sessions via stores
- Trigger authentication actions through store methods
- Handle loading and error states for authentication operations
- Redirect users through router based on authentication state

### Session-Based Component Implementation Patterns

#### 1. Authentication Status Display
```typescript
<script setup lang="ts">
import { useAuthStore } from '../stores/auth.store';

const authStore = useAuthStore();

// ✅ CORRECT: Use store computed values
const isLoggedIn = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.user);
const isLoading = computed(() => authStore.loading);

// ❌ WRONG: Never implement session logic in components
// const checkSession = () => { /* session validation logic */ };
</script>

<template>
  <div v-if="isLoggedIn" class="user-info">
    <h2>Welcome, {{ currentUser?.fullName }}</h2>
    <button @click="authStore.logout">Logout</button>
  </div>
  <div v-else>
    <button @click="authStore.loginWithGoogle">Login with Google</button>
  </div>
</template>
```

#### 2. OAuth Login Trigger (Correct Pattern)
```typescript
<script setup lang="ts">
import { useAuthStore } from '../stores/auth.store';

const authStore = useAuthStore();

// ✅ CORRECT: Delegate to store methods
const handleGoogleLogin = () => {
  authStore.loginWithGoogle(); // Store coordinates with service
};

const handleLogout = async () => {
  try {
    await authStore.logout(); // Store handles service coordination
    // Optionally show success message
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

// ❌ WRONG: Never implement OAuth logic in components
// const redirectToGoogle = () => {
//   window.location.href = 'http://localhost:3000/api/v1/auth/google';
// };
</script>
```

#### 3. Session Error Handling
```typescript
<script setup lang="ts">
import { useAuthStore } from '../stores/auth.store';
import { watch } from 'vue';

const authStore = useAuthStore();

// ✅ CORRECT: React to store error state
const errorMessage = computed(() => authStore.error);

// ✅ CORRECT: Watch for authentication changes
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (!isAuth && route.meta.requiresAuth) {
    router.push('/login');
  }
});

// ❌ WRONG: Never handle session errors directly
// const handleSessionError = (error) => {
//   if (error.status === 401) { /* session handling */ }
// };
</script>
```

#### 4. Protected Component Access
```typescript
<script setup lang="ts">
import { useAuthStore } from '../stores/auth.store';

const authStore = useAuthStore();

// ✅ CORRECT: Check authentication state from store
const canAccess = computed(() => {
  return authStore.isAuthenticated && authStore.user?.role === 'admin';
});

onMounted(async () => {
  // ✅ CORRECT: Trigger store method to check authentication
  if (!authStore.isAuthenticated) {
    await authStore.checkAuthentication();
  }
});

// ❌ WRONG: Never check sessions directly
// const validateSession = async () => {
//   const response = await apiClient.get('/auth/profile');
// };
</script>
```

### Session Management Component Architecture

```
Component User Interaction
    ↓
Trigger Store Action (Layer 3)
    ↓
Store Coordinates with Service (Layer 4)
    ↓
Service Makes Session API Call (Layer 5)
    ↓
Backend Validates Session (Passport)
    ↓
Response Flows Back Through Layers
    ↓
Component Reacts to Store State Changes
```

### Critical Session Component Guidelines

1. **No Direct Session Access**: Components never interact with session APIs directly
2. **Store Delegation**: All authentication actions must go through stores
3. **Reactive State**: Use computed properties for authentication status
4. **Error Boundaries**: Handle authentication errors from store state
5. **Router Integration**: Coordinate authentication redirects through stores
6. **Loading States**: Display loading indicators from store loading state

---

### 2. user.component.vue

**Purpose**: Unified user profile and settings management component

#### Key Features:
- **Mode-Based Rendering**: Supports both 'profile' and 'settings' modes
- **Profile Management**: User profile display and editing
- **Settings Management**: Account settings, notifications, preferences
- **Form Validation**: Client-side validation with proper error handling
- **Data Mapping**: Consistent data transformation using mappers
- **Responsive Design**: Mobile-first responsive layout

#### Props Interface:
```typescript
interface Props {
  userId?: string;           // User ID to load (optional for current user)
  editable?: boolean;        // Whether profile can be edited
  mode?: 'profile' | 'settings'; // Component mode
}

const props = withDefaults(defineProps<Props>(), {
  editable: true,
  mode: 'profile'
});
```

#### Events:
```typescript
const emit = defineEmits<{
  (e: 'update', settings: Partial<UserSettings>): void;
}>();
```

#### Usage Patterns:
```vue
<!-- Profile mode -->
<UserComponent 
  :user-id="currentUserId" 
  mode="profile" 
  :editable="true" 
  @update="handleProfileUpdate" 
/>

<!-- Settings mode -->
<UserComponent 
  mode="settings" 
  @update="handleSettingsUpdate" 
/>
```

#### Implementation Notes:
- **NEVER** use apiClient, axios, fetch, or any direct HTTP calls in components
- **ALWAYS** use composables (e.g., useUser, useAuth, useKyc) for data operations
- Uses `UserService` for API communication (accessed through composables only)
- Implements proper form validation with user feedback
- Handles profile images and file uploads
- Manages complex form state with nested objects
- Provides both read-only and editable modes
- Uses mappers for data transformation

---

### 3. kyc.component.vue  

**Purpose**: KYC verification status and initiation interface

#### Key Features:
- **Status-Based UI**: Different UI states based on KYC status
- **Provider Integration**: Integrates with KYC providers (SumSub, etc.)
- **Progress Tracking**: Shows verification progress and status
- **Error Recovery**: Handles verification failures with retry options
- **Responsive States**: Adapts UI based on verification status

#### Props Interface:
```typescript
interface Props {
  autoLoad?: boolean;        // Whether to auto-load KYC status
}

const props = withDefaults(defineProps<Props>(), {
  autoLoad: true
});
```

#### Events:
```typescript
// No events - component handles KYC state internally
```

#### KYC Status States:
1. **Not Submitted**: Initial state, shows verification CTA
2. **Pending**: Verification in progress, shows waiting state
3. **Verified**: Successful verification, shows success state  
4. **Rejected**: Failed verification, shows retry options

#### Usage Pattern:
```vue
<template>
  <KycComponent :auto-load="true" />
</template>
```

#### Implementation Notes:
- Uses `useKyc` composable for state management
- Integrates with KYC service providers
- Handles callback URLs from verification providers
- Manages complex verification flow states
- Provides clear user feedback for each status

---

### 4. UserRoleBadge.vue

**Purpose**: Reusable role display component with consistent styling

#### Key Features:
- **Role-Based Styling**: Different colors/styles per role
- **Consistent Design**: Unified role display across app
- **Accessibility**: Proper semantic markup and ARIA labels
- **Type Safety**: Strict role type validation

#### Props Interface:
```typescript
interface Props {
  role: UserRole;           // Required user role
}
```

#### Role Types:
```typescript
type UserRole = 'admin' | 'manager' | 'user';
```

#### Usage Pattern:
```vue
<template>
  <UserRoleBadge :role="user.role" />
</template>
```

#### Style Mapping:
- **Admin**: Red badge (`bg-red-100 text-red-800`)
- **Manager**: Blue badge (`bg-blue-100 text-blue-800`)  
- **User**: Green badge (`bg-green-100 text-green-800`)

#### Implementation Notes:
- Pure presentational component
- No external dependencies beyond type definitions
- Optimized for reuse (18+ usage locations in codebase)
- Consistent with design system color palette

---

## Component Integration Patterns

### Service Integration

```typescript
// ✅ Proper service integration in components
<script setup lang="ts">
import { UserService } from '../services/user.service';

// Service instance - following clean architecture
const userService = new UserService();

// Use service in component methods
const handleUpdate = async (data: UserUpdate) => {
  try {
    loading.value = true;
    const result = await userService.updateUser(userId, data);
    emit('update', result);
  } catch (error) {
    console.error('Update failed:', error);
    // Handle error appropriately
  } finally {
    loading.value = false;
  }
};
</script>
```

### Store Integration

```typescript
// ✅ Reactive store integration
<script setup lang="ts">
import { useAuthStore } from '../store/auth.store';

const authStore = useAuthStore();

// Reactive computed properties from store
const currentUser = computed(() => authStore.user);
const isAuthenticated = computed(() => authStore.isAuthenticated);
</script>
```

### Composable Integration

```typescript
// ✅ Clean composable usage
<script setup lang="ts">
import { useUser } from '../composables/useUser';
import { useKyc } from '../composables/useKyc';

// Destructure composable returns
const { 
  user, 
  loading, 
  error, 
  updateUser, 
  refreshUser 
} = useUser();

const { 
  kycRecord, 
  isVerified, 
  initiateVerification 
} = useKyc();
</script>
```

## Styling & Design System

### CSS Class Patterns

```typescript
// ✅ Consistent CSS class usage
const buttonClasses = computed(() => {
  const base = 'inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variant = props.variant === 'primary' 
    ? 'border-transparent text-white bg-primary hover:bg-primary-dark focus:ring-primary'
    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary';
  
  return `${base} ${variant}`;
});
```

### Responsive Design

```vue
<!-- ✅ Mobile-first responsive design -->
<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Content -->
      </div>
    </div>
  </div>
</template>
```

## Error Handling Patterns

### Component Error Boundaries

```typescript
// ✅ Proper error handling in components
<script setup lang="ts">
const error = ref<string | null>(null);
const loading = ref(false);

const handleAsyncAction = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Async operation
    const result = await someAsyncOperation();
    
    // Handle success
    emit('success', result);
  } catch (err) {
    // Handle error with user-friendly message
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred';
    console.error('Component error:', err);
  } finally {
    loading.value = false;
  }
};
</script>
```

### User Feedback

```vue
<!-- ✅ User-friendly error display -->
<template>
  <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
    <div class="flex">
      <div class="flex-shrink-0">
        <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-red-800">Error</h3>
        <p class="mt-1 text-sm text-red-700">{{ error }}</p>
        <div class="mt-4">
          <button @click="retryAction" class="text-sm font-medium text-red-600 hover:text-red-500">
            Try Again
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
```

## Testing Considerations

### Component Testing Setup

```typescript
// ✅ Component test structure
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import UserComponent from '../user.component.vue';

describe('UserComponent', () => {
  it('renders user profile correctly', async () => {
    const wrapper = mount(UserComponent, {
      props: {
        userId: 'test-user-id',
        mode: 'profile'
      }
    });
    
    expect(wrapper.find('[data-testid="user-profile"]').exists()).toBe(true);
  });
  
  it('emits update event when profile is saved', async () => {
    // Test implementation
  });
});
```

## Performance Optimization

### Component Lazy Loading

```typescript
// ✅ Lazy component loading in index.ts
import { defineAsyncComponent } from 'vue';

export const UserComponent = defineAsyncComponent(() => import('./user.component.vue'));
export const AuthComponent = defineAsyncComponent(() => import('./auth.component.vue'));
```

### Computed Property Optimization

```typescript
// ✅ Efficient computed properties
const expensiveComputation = computed(() => {
  // Only recalculates when dependencies change
  return complexCalculation(props.data);
});
```

## Security Considerations

### Input Sanitization

```typescript
// ✅ Proper input handling
const sanitizedInput = computed(() => {
  return props.userInput?.trim().substring(0, 500) || '';
});
```

### XSS Prevention

```vue
<!-- ✅ Safe content rendering -->
<template>
  <!-- Use v-text for user content -->
  <p v-text="userGeneratedContent"></p>
  
  <!-- Only use v-html for trusted content -->
  <div v-html="trustedHtmlContent"></div>
</template>
```

## Component Lifecycle Best Practices

### Cleanup

```typescript
// ✅ Proper resource cleanup
<script setup lang="ts">
import { onBeforeUnmount } from 'vue';

let intervalId: number;

onMounted(() => {
  intervalId = setInterval(() => {
    // Periodic task
  }, 1000);
});

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>
```

## Summary

The components in the Accounts module provide a comprehensive, reusable set of UI components for authentication, user management, and KYC verification. They follow Vue.js 3 best practices with:

**Key Benefits:**
- ✅ **Type Safety**: Full TypeScript coverage with proper interfaces
- ✅ **Reusability**: Components designed for reuse across views
- ✅ **Maintainability**: Clear structure and consistent patterns
- ✅ **Accessibility**: Semantic HTML and ARIA compliance
- ✅ **Performance**: Optimized rendering and lazy loading
- ✅ **Testing**: Testable architecture with clear interfaces

**Component Responsibilities:**
- **auth.component.vue**: OAuth authentication flows
- **user.component.vue**: Profile and settings management
- **kyc.component.vue**: KYC verification interface
- **UserRoleBadge.vue**: Consistent role display across app

**⚠️ CRITICAL ARCHITECTURE RULE:**
Components must NEVER directly communicate with the backend. All data operations must go through:
1. **Layer 3 (Composables/Stores)** for business logic and state management
2. **Layer 4 (Services)** for API calls (accessed through Layer 3 only)

**❌ FORBIDDEN in Components:**
```typescript
// ❌ NEVER do this in components - violates Layer 2 boundaries
import apiClient from '../../../services/apiClient';
import axios from 'axios';

// ❌ NEVER make direct HTTP calls
const response = await apiClient.get('/users');
const data = await fetch('/api/users');
```

**✅ CORRECT Layer 2 Architecture:**
```typescript
// ✅ Use composables (Layer 3) for data operations
import { useUser } from '../composables/useUser';

const { currentUser, fetchCurrentUser, loading, error } = useUser();

// Component handles UI logic, composables handle business logic
onMounted(async () => {
  await fetchCurrentUser(); // Layer 3 → Layer 4 → Layer 5
});

// ✅ Or access stores directly (Layer 3)
import { useUserStore } from '../stores/user.store';

const userStore = useUserStore();
const user = computed(() => userStore.currentUser);
```

Each component integrates seamlessly with the broader Accounts module architecture while maintaining clear boundaries and responsibilities.
