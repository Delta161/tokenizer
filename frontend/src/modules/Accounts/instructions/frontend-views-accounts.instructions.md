---
applyTo: "frontend/src/modules/accounts/views/*.vue"
---

# Frontend Accounts Module - Views Instructions

## Overview
This document provides comprehensive instructions for developing, maintaining, and extending Vue.js view components within the Frontend Accounts Module. Views serve as the top-level page components that orchestrate business logic, manage routing states, and coordinate between multiple components while maintaining clean separation of concerns and optimal user experience.

## Views Architecture

### 🏗️ Layer 1: View/Page (Route Components)
Views are **Layer 1** in the mandatory application frontend flow:

```
📍 LAYER 1: View/Page (Route Components)
👉 High-level route components (e.g. /accounts/profile)
👉 Assemble sections, pass props to components
👉 Handle routing, layout coordination, and page-level state
```

### View Layer Strategy
Views in this module are designed to:
- **Route Components**: Handle route-specific logic (params, query, navigation)
- **Section Assembly**: Coordinate sections and components for complete pages
- **Props Distribution**: Pass data and handlers down to child components
- **Layout Integration**: Manage page layouts and responsive behavior
- **Page-Level State**: Handle URL state, breadcrumbs, page titles
- **User Flow Orchestration**: Coordinate multi-step processes across the page
- **⚠️ NO DIRECT BACKEND COMMUNICATION**: Views must NEVER directly call apiClient, axios, fetch, or any HTTP methods. All backend communication MUST go through services layer only.

### Mandatory Flow Integration
Views must follow the application flow:
- **Layer 1 (Views)** → **Layer 2 (Sections/Components)** → **Layer 3 (Stores/Composables)** → **Layer 4 (Services)** → **Layer 5 (apiClient)**

### View Layer Responsibilities
- **Route Integration**: Parameter extraction, query handling, and navigation management
- **State Orchestration**: Coordinating between stores, composables, and components
- **Layout Management**: Page structure, responsive behavior, and layout integration
- **Loading States**: Global loading indicators and error boundary handling
- **User Experience**: Breadcrumbs, page titles, progress indicators, and transitions
- **Business Flow Coordination**: Multi-step processes and complex user interactions

## Current View Implementation

### 1. Authentication View (auth.view.vue)
```vue
// Location: frontend/src/modules/accounts/views/auth.view.vue
// Purpose: OAuth-only authentication interface
// Architecture: Minimal wrapper delegating to auth.component.vue
```

**Key Features:**
- **Simplified Architecture**: Thin wrapper around AuthComponent
- **OAuth-Only Focus**: Streamlined authentication flow
- **Layout Integration**: Proper AuthLayout usage for centered design
- **Responsive Design**: Mobile-first authentication experience

**Current Implementation:**
```vue
<script setup lang="ts">
import AuthComponent from '../components/auth.component.vue';

// The view is now just a wrapper for the component that handles all the business logic
</script>

<template>
  <div class="auth-view">
    <AuthComponent />
  </div>
</template>

<style scoped>
.auth-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--color-background);
}
</style>
```

## 🔐 Session Management in Views

### CRITICAL: Session-Based Route Management

Views are **ROUTE COORDINATION LAYER** responsible for handling session-based authentication at the page level. They coordinate authentication flows, route guards, and session-related redirects while delegating actual session management to lower layers.

### Session Management View Responsibilities

**✅ VIEWS MUST:**
- Handle OAuth callback routes (`/auth/callback`)
- Implement route-level authentication guards
- Coordinate authentication redirects based on session status
- Handle session-related route parameters and queries
- Manage page-level authentication loading states
- Coordinate session-aware navigation flows

**❌ VIEWS MUST NOT:**
- Make direct API calls for session validation or authentication
- Handle session cookies, tokens, or session storage manually
- Implement session timeout logic or session expiration handling
- Parse or validate session data client-side
- Bypass stores/composables to handle session operations directly

### Session-Based View Implementation Patterns

#### 1. OAuth Callback View
```vue
<!-- views/AuthCallback.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div v-if="loading" class="flex flex-col items-center space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <h2 class="text-xl font-semibold text-gray-900">
            Completing your login...
          </h2>
        </div>
        
        <div v-else-if="error" class="flex flex-col items-center space-y-4">
          <h2 class="text-xl font-semibold text-red-900">
            Authentication Failed
          </h2>
          <p class="text-red-600">{{ error }}</p>
          <button @click="goToLogin" class="btn-primary">
            Try Again
          </button>
        </div>
        
        <div v-else class="flex flex-col items-center space-y-4">
          <h2 class="text-xl font-semibold text-green-900">
            Login Successful!
          </h2>
          <p class="text-green-600">
            Redirecting you to the dashboard...
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { handleOAuthCallback } = useAuth();

const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    // ✅ CORRECT: Delegate to composable for OAuth handling
    await handleOAuthCallback();
    
    // Success redirect with delay for UX
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
    
  } catch (err: any) {
    console.error('OAuth callback error:', err);
    error.value = err.message || 'Failed to complete login.';
  } finally {
    loading.value = false;
  }
});

const goToLogin = () => {
  router.push('/login');
};
</script>
```

#### 2. Protected View with Session Guards
```vue
<!-- views/ProfileView.vue -->
<template>
  <div class="profile-view">
    <div v-if="authLoading" class="loading-container">
      <LoadingSpinner />
      <p>Verifying authentication...</p>
    </div>
    
    <div v-else-if="!isAuthenticated" class="unauthorized-container">
      <h2>Access Denied</h2>
      <p>Please login to access your profile.</p>
      <button @click="goToLogin" class="btn-primary">Login</button>
    </div>
    
    <div v-else class="profile-container">
      <UserProfile :user="currentUser" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import UserProfile from '../components/UserProfile.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const router = useRouter();
const { 
  isAuthenticated, 
  user: currentUser, 
  isLoading: authLoading,
  requireAuth 
} = useAuth();

// ✅ CORRECT: Route-level authentication guard
onMounted(async () => {
  const canAccess = await requireAuth();
  if (!canAccess) {
    // requireAuth handles redirect internally
    return;
  }
});

const goToLogin = () => {
  router.push('/login');
};
</script>
```

#### 3. Session-Aware Navigation View
```vue
<!-- views/DashboardView.vue -->
<template>
  <div class="dashboard-view">
    <nav class="dashboard-nav">
      <div class="user-section">
        <UserAvatar v-if="currentUser" :user="currentUser" />
        <div v-if="currentUser">
          <p>Welcome, {{ currentUser.fullName }}</p>
          <span class="role-badge">{{ currentUser.role }}</span>
        </div>
      </div>
      <button @click="handleLogout" class="logout-btn">
        Logout
      </button>
    </nav>
    
    <main class="dashboard-content">
      <!-- Role-based content sections -->
      <AdminSection v-if="isAdmin" />
      <ClientSection v-else-if="isClient" />
      <InvestorSection v-else />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { usePermissions } from '../composables/usePermissions';

const router = useRouter();
const { 
  isAuthenticated, 
  user: currentUser, 
  logout,
  checkAuthentication 
} = useAuth();

const { isAdmin, isClient } = usePermissions();

// ✅ CORRECT: Session validation on route entry
onMounted(async () => {
  if (!isAuthenticated.value) {
    const isAuth = await checkAuthentication();
    if (!isAuth) {
      router.push('/login');
      return;
    }
  }
});

// ✅ CORRECT: Session-aware logout
const handleLogout = async () => {
  try {
    await logout(); // Composable handles store coordination
    // logout composable handles redirect to /login
  } catch (error) {
    console.error('Logout failed:', error);
    // Force redirect even if logout fails
    router.push('/login');
  }
};
</script>
```

#### 4. Route Guard Integration
```typescript
// router/guards.ts - Used by views for session-based routing
import { useAuth } from '@/modules/Accounts/composables/useAuth';

export const requiresAuth = async (to: any, from: any, next: any) => {
  const { isAuthenticated, checkAuthentication } = useAuth();
  
  // ✅ CORRECT: Check session through composable
  if (!isAuthenticated.value) {
    const isAuth = await checkAuthentication();
    if (!isAuth) {
      next({ name: 'login', query: { redirect: to.fullPath } });
      return;
    }
  }
  
  next();
};

export const requiresRole = (role: string) => {
  return async (to: any, from: any, next: any) => {
    const { user, hasRole, requireAuth } = useAuth();
    
    // First ensure authentication
    const canAccess = await requireAuth();
    if (!canAccess) {
      next({ name: 'login' });
      return;
    }
    
    // Then check role
    if (!hasRole(role)) {
      next({ name: 'dashboard' }); // Redirect to allowed page
      return;
    }
    
    next();
  };
};
```

### Session Management View Architecture

```
Route Navigation Triggered
    ↓
View Route Guard Activated
    ↓
View Calls Composable for Auth Check
    ↓
Composable Coordinates with Store
    ↓
Store Validates Session via Service
    ↓
Result Flows Back to View
    ↓
View Handles Redirect or Renders Content
```

### Critical Session View Guidelines

1. **Route Guards**: Implement proper authentication guards for protected routes
2. **OAuth Callbacks**: Handle OAuth provider redirects with proper error handling
3. **Navigation Coordination**: Use composables for session-aware navigation
4. **Loading States**: Show appropriate loading indicators during session checks
5. **Error Boundaries**: Handle session errors gracefully with user-friendly messages
6. **Redirect Management**: Proper redirect flows for authentication state changes

### Session-Based Route Configuration
```typescript
// routes.ts - Session-aware routing
const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth.view.vue'),
    meta: { requiresAuth: false, layout: 'AuthLayout' }
  },
  {
    path: '/auth/callback',
    name: 'auth-callback', 
    component: () => import('../views/AuthCallback.vue'),
    meta: { requiresAuth: false, layout: 'AuthLayout' }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true, layout: 'DefaultLayout' },
    beforeEnter: requiresAuth
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true, requiresRole: 'ADMIN' },
    beforeEnter: requiresRole('ADMIN')
  }
];
```

### 2. User View (user.view.vue)
```vue
// Location: frontend/src/modules/accounts/views/user.view.vue
// Purpose: Comprehensive user management interface with multiple modes
// Architecture: Mode-based view handling profile, settings, and admin functions
```

**Key Features:**
- **Multi-Mode Interface**: Profile and settings modes with dynamic switching
- **Admin Controls**: Role-based UI elements and mode switchers
- **Dynamic Route Handling**: Supports viewing other users (admin feature)
- **Comprehensive State Management**: Individual loading states per mode
- **Responsive Layout**: Mobile-optimized with proper breakpoints

**Core Architecture:**
```vue
<template>
  <div class="user-view">
    <!-- Profile Mode (default) -->
    <div v-if="currentMode === 'profile'" class="profile-section">
      <div class="min-h-screen bg-gray-50 py-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Page Header -->
          <div class="mb-8 flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">
                {{ viewingUserId ? 'User Profile' : 'My Profile' }}
              </h1>
              <p class="mt-2 text-gray-600">
                {{ viewingUserId ? 'View user account information' : 'Manage your account information and preferences' }}
              </p>
            </div>
            
            <!-- Mode switcher for admins -->
            <div v-if="isAdmin" class="flex space-x-2">
              <button 
                @click="switchMode('profile')"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-md',
                  currentMode === 'profile' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                ]"
              >
                Profile
              </button>
              <button 
                @click="switchMode('settings')"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-md',
                  currentMode === 'settings' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                ]"
              >
                Settings
              </button>
            </div>
          </div>

          <!-- Profile content -->
          <template v-else>
            <UserComponent :userId="viewingUserId" :editable="isEditable" />

            <!-- Actions (only show for current user's profile) -->
            <div v-if="!viewingUserId" class="mt-8 flex justify-between">
              <button 
                @click="logout" 
                class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Settings Mode -->
    <div v-else-if="currentMode === 'settings'" class="settings-section">
      <!-- Settings interface -->
    </div>
  </div>
</template>
```

**State Management Pattern:**
```vue
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUser } from '../composables/useUser';
import { useAuthStore } from '../../../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// User composable
const { 
  loading, 
  error, 
  currentUser, 
  isAdmin,
  fetchCurrentUser,
  updateUserSettings
} = useUser();

// Mode management
const currentMode = ref('profile');
type ViewMode = 'profile' | 'settings';

// Individual loading states for each mode
const settingsLoading = ref(false);
const settingsError = ref<string | null>(null);

// Computed properties
const viewingUserId = computed(() => {
  const idParam = route.params.id;
  return typeof idParam === 'string' ? idParam : undefined;
});

const isEditable = computed(() => {
  // Current user can edit their own profile, admins can edit any profile
  return !viewingUserId.value || (isAdmin.value && !!viewingUserId.value);
});
</script>
```

### 3. KYC View (kyc.view.vue)
```vue
// Location: frontend/src/modules/accounts/views/kyc.view.vue
// Purpose: Complete KYC verification interface with callback handling
// Architecture: Multi-state interface handling verification flow and callbacks
```

**Key Features:**
- **Multi-State Interface**: Not submitted, pending, verified, rejected, and callback states
- **Callback Handling**: Dedicated callback processing section
- **Provider Integration**: SumSub and manual verification support
- **Progress Indicators**: Clear status communication and next steps
- **Responsive Design**: Mobile-optimized verification flow

**State-Based Architecture:**
```vue
<template>
  <div class="kyc-view">
    <!-- KYC Callback Handler (shown when handling callback) -->
    <div v-if="isCallback" class="kyc-callback-section">
      <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-2xl font-semibold text-gray-900 mb-6">Processing Your Verification</h1>
          
          <div v-if="callbackLoading" class="flex flex-col items-center justify-center p-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p class="text-gray-600">Please wait while we process your verification...</p>
          </div>
          
          <div v-else-if="callbackError" class="bg-red-50 rounded-lg p-6 mb-6 text-left">
            <!-- Error handling UI -->
          </div>
          
          <div v-else class="text-center">
            <!-- Success state UI -->
          </div>
        </div>
      </div>
    </div>

    <!-- Main KYC Verification Page -->
    <div v-else class="kyc-verification-section">
      <!-- Verified state -->
      <div v-if="isVerified" class="bg-green-50 rounded-lg p-6 mb-6">
        <!-- Verification complete UI -->
      </div>

      <!-- Pending state -->
      <div v-else-if="isPending" class="bg-yellow-50 rounded-lg p-6 mb-6">
        <!-- Verification in progress UI -->
      </div>

      <!-- Rejected state -->
      <div v-else-if="isRejected" class="bg-red-50 rounded-lg p-6 mb-6">
        <!-- Verification failed UI -->
      </div>

      <!-- Not submitted or new verification -->
      <div v-else>
        <!-- Initial verification flow UI -->
      </div>
    </div>
  </div>
</template>
```

**KYC State Logic:**
```vue
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useKyc } from '../composables/useKyc';
import { KycStatus } from '../types/kyc.types';

const route = useRoute();
const router = useRouter();
const { kycRecord, fetchKycRecord, initiateVerification } = useKyc();

// Main loading state
const isLoading = ref(true);

// Callback specific states
const callbackLoading = ref(true);
const callbackError = ref<Error | null>(null);
const callbackSuccess = ref(false);

// Determine if we're in callback mode
const isCallback = computed(() => route.path.includes('/callback'));

// KYC status computed properties
const isVerified = computed(() => kycRecord.value?.status === KycStatus.VERIFIED);
const isPending = computed(() => kycRecord.value?.status === KycStatus.PENDING);
const isRejected = computed(() => kycRecord.value?.status === KycStatus.REJECTED);
</script>
```

## View Development Guidelines

### 1. Base View Template
```vue
<template>
  <div class="domain-view">
    <!-- Page Header Section -->
    <header class="page-header">
      <div class="container">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">{{ pageTitle }}</h1>
            <p v-if="pageDescription" class="page-description">{{ pageDescription }}</p>
          </div>
          
          <!-- Action buttons or navigation -->
          <div v-if="headerActions" class="header-actions">
            <slot name="header-actions">
              <!-- Default header actions -->
            </slot>
          </div>
        </div>
        
        <!-- Breadcrumbs if needed -->
        <nav v-if="breadcrumbs" class="breadcrumbs" aria-label="Breadcrumb">
          <ol class="breadcrumb-list">
            <li v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item">
              <router-link v-if="crumb.to" :to="crumb.to" class="breadcrumb-link">
                {{ crumb.label }}
              </router-link>
              <span v-else class="breadcrumb-current">{{ crumb.label }}</span>
            </li>
          </ol>
        </nav>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="main-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-section">
          <div class="loading-spinner-container">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p class="loading-text">{{ loadingMessage || 'Loading...' }}</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-section">
          <div class="error-container">
            <div class="error-icon">
              <svg class="h-8 w-8 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 class="error-title">Something went wrong</h2>
            <p class="error-message">{{ error }}</p>
            <div class="error-actions">
              <button @click="retryAction" class="btn btn-primary">Try Again</button>
              <button @click="goBack" class="btn btn-secondary">Go Back</button>
            </div>
          </div>
        </div>

        <!-- Content State -->
        <div v-else class="content-section">
          <!-- Content goes here -->
          <slot>
            <!-- Default content slot -->
          </slot>
        </div>
      </div>
    </main>

    <!-- Footer or additional actions -->
    <footer v-if="hasFooter" class="page-footer">
      <div class="container">
        <slot name="footer">
          <!-- Default footer content -->
        </slot>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Props
interface Props {
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  headerActions?: boolean;
  hasFooter?: boolean;
  loadingMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  headerActions: false,
  hasFooter: false,
  loadingMessage: 'Loading...'
});

// Emits
const emit = defineEmits<{
  (e: 'retry'): void;
  (e: 'back'): void;
  (e: 'mounted'): void;
}>();

const route = useRoute();
const router = useRouter();

// Local state
const isLoading = ref(props.loading);
const error = ref(props.error);

// Computed properties
const pageTitle = computed(() => props.title || route.meta.title || 'Page');
const pageDescription = computed(() => props.description || route.meta.description);

const breadcrumbs = computed(() => {
  // Generate breadcrumbs from route meta or props
  return route.meta.breadcrumbs || [];
});

// Methods
const retryAction = () => {
  error.value = null;
  emit('retry');
};

const goBack = () => {
  if (history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
  emit('back');
};

// Lifecycle
onMounted(() => {
  emit('mounted');
});
</script>

<style scoped>
.domain-view {
  min-height: 100vh;
  background-color: var(--color-background);
}

.page-header {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.title-section {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
}

.page-description {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.header-actions {
  flex-shrink: 0;
}

.breadcrumbs {
  margin-top: 1rem;
}

.breadcrumb-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.875rem;
}

.breadcrumb-item:not(:last-child)::after {
  content: '/';
  margin: 0 0.5rem;
  color: var(--color-text-tertiary);
}

.breadcrumb-link {
  color: var(--color-primary);
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-current {
  color: var(--color-text-secondary);
}

.main-content {
  padding: 2rem 0;
  flex: 1;
}

.loading-section,
.error-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-spinner-container {
  text-align: center;
}

.loading-text {
  margin-top: 1rem;
  color: var(--color-text-secondary);
}

.error-container {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  margin: 0 auto 1rem;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-error-light);
  border-radius: 50%;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
}

.error-message {
  color: var(--color-text-secondary);
  margin: 0 0 2rem 0;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.page-footer {
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 2rem 0;
  margin-top: auto;
}

/* Responsive design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .error-actions {
    flex-direction: column;
  }
}
</style>
```

### 2. Multi-Mode View Pattern
```vue
<template>
  <div class="multi-mode-view">
    <!-- Mode Navigation -->
    <nav class="mode-navigation">
      <div class="container">
        <div class="mode-tabs">
          <button
            v-for="mode in availableModes"
            :key="mode.key"
            @click="switchMode(mode.key)"
            :class="[
              'mode-tab',
              {
                'mode-tab--active': currentMode === mode.key,
                'mode-tab--disabled': mode.disabled
              }
            ]"
            :disabled="mode.disabled"
          >
            <span class="mode-icon" v-if="mode.icon">{{ mode.icon }}</span>
            <span class="mode-label">{{ mode.label }}</span>
            <span v-if="mode.badge" class="mode-badge">{{ mode.badge }}</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mode Content -->
    <main class="mode-content">
      <component
        :is="currentModeComponent"
        v-bind="currentModeProps"
        @mode-change="handleModeChange"
        @action="handleModeAction"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Mode definition interface
interface ViewMode {
  key: string;
  label: string;
  component: any;
  icon?: string;
  badge?: string;
  disabled?: boolean;
  requiresAuth?: boolean;
  requiresRole?: string[];
  props?: Record<string, any>;
}

// Props
interface Props {
  defaultMode?: string;
  modes: ViewMode[];
  routeParam?: string;
}

const props = withDefaults(defineProps<Props>(), {
  defaultMode: '',
  routeParam: 'mode'
});

// Emits
const emit = defineEmits<{
  (e: 'mode-changed', mode: string): void;
  (e: 'mode-action', action: string, data: any): void;
}>();

const route = useRoute();
const router = useRouter();

// Current mode state
const currentMode = ref(props.defaultMode || props.modes[0]?.key || '');

// Computed properties
const availableModes = computed(() => {
  return props.modes.filter(mode => {
    // Filter modes based on auth/role requirements
    if (mode.requiresAuth && !isAuthenticated.value) return false;
    if (mode.requiresRole && !hasRequiredRole(mode.requiresRole)) return false;
    return true;
  });
});

const currentModeConfig = computed(() => {
  return availableModes.value.find(mode => mode.key === currentMode.value);
});

const currentModeComponent = computed(() => {
  return currentModeConfig.value?.component;
});

const currentModeProps = computed(() => {
  return {
    mode: currentMode.value,
    ...currentModeConfig.value?.props
  };
});

// Methods
const switchMode = (mode: string) => {
  if (mode === currentMode.value) return;
  
  currentMode.value = mode;
  
  // Update route if needed
  if (props.routeParam && route.query[props.routeParam] !== mode) {
    router.push({
      ...route,
      query: {
        ...route.query,
        [props.routeParam]: mode
      }
    });
  }
  
  emit('mode-changed', mode);
};

const handleModeChange = (newMode: string) => {
  switchMode(newMode);
};

const handleModeAction = (action: string, data: any) => {
  emit('mode-action', action, data);
};

// Initialize mode from route
onMounted(() => {
  const routeMode = route.query[props.routeParam] as string;
  if (routeMode && availableModes.value.some(mode => mode.key === routeMode)) {
    currentMode.value = routeMode;
  }
});

// Watch for route changes
watch(
  () => route.query[props.routeParam],
  (newMode) => {
    if (newMode && typeof newMode === 'string' && newMode !== currentMode.value) {
      if (availableModes.value.some(mode => mode.key === newMode)) {
        currentMode.value = newMode;
      }
    }
  }
);
</script>

<style scoped>
.multi-mode-view {
  min-height: 100vh;
  background-color: var(--color-background);
}

.mode-navigation {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.mode-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 0;
  overflow-x: auto;
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-weight: 500;
}

.mode-tab:hover:not(:disabled) {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.mode-tab--active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.mode-tab--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mode-icon {
  font-size: 1.125rem;
}

.mode-label {
  font-size: 0.875rem;
}

.mode-badge {
  background-color: var(--color-warning);
  color: var(--color-warning-text);
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

.mode-content {
  flex: 1;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .mode-tabs {
    padding: 0.75rem 0;
  }
  
  .mode-tab {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}
</style>
```

### 3. Form View Pattern
```vue
<template>
  <div class="form-view">
    <header class="form-header">
      <div class="container">
        <h1 class="form-title">{{ title }}</h1>
        <p v-if="description" class="form-description">{{ description }}</p>
        
        <!-- Progress indicator for multi-step forms -->
        <div v-if="steps && steps.length > 1" class="form-progress">
          <div class="progress-steps">
            <div
              v-for="(step, index) in steps"
              :key="index"
              :class="[
                'progress-step',
                {
                  'progress-step--completed': index < currentStep,
                  'progress-step--current': index === currentStep,
                  'progress-step--pending': index > currentStep
                }
              ]"
            >
              <div class="step-indicator">
                <span v-if="index < currentStep" class="step-check">✓</span>
                <span v-else class="step-number">{{ index + 1 }}</span>
              </div>
              <span class="step-label">{{ step.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="form-content">
      <div class="container">
        <!-- Form card -->
        <div class="form-card">
          <!-- Form loading state -->
          <div v-if="loading" class="form-loading">
            <div class="loading-spinner"></div>
            <p>{{ loadingMessage }}</p>
          </div>

          <!-- Form error state -->
          <div v-else-if="error" class="form-error">
            <div class="error-icon">⚠️</div>
            <h3>Unable to load form</h3>
            <p>{{ error }}</p>
            <button @click="retry" class="btn btn-primary">Try Again</button>
          </div>

          <!-- Form content -->
          <form v-else @submit.prevent="handleSubmit" class="form">
            <!-- Step content -->
            <div class="form-step">
              <slot :current-step="currentStep" :form-data="formData">
                <!-- Default form content -->
                <component
                  v-if="currentStepComponent"
                  :is="currentStepComponent"
                  v-model="formData"
                  :errors="formErrors"
                  :disabled="submitting"
                />
              </slot>
            </div>

            <!-- Form actions -->
            <div class="form-actions">
              <div class="form-actions-left">
                <button
                  v-if="currentStep > 0"
                  type="button"
                  @click="previousStep"
                  class="btn btn-secondary"
                  :disabled="submitting"
                >
                  Previous
                </button>
              </div>
              
              <div class="form-actions-right">
                <button
                  v-if="currentStep < totalSteps - 1"
                  type="button"
                  @click="nextStep"
                  class="btn btn-primary"
                  :disabled="!isCurrentStepValid || submitting"
                >
                  Next
                </button>
                
                <button
                  v-else
                  type="submit"
                  class="btn btn-primary"
                  :disabled="!isFormValid || submitting"
                >
                  <span v-if="submitting" class="button-spinner"></span>
                  {{ submitLabel }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// Form step interface
interface FormStep {
  key: string;
  label: string;
  component?: any;
  validator?: (data: any) => boolean;
}

// Props
interface Props {
  title: string;
  description?: string;
  steps?: FormStep[];
  initialData?: Record<string, any>;
  submitLabel?: string;
  loadingMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Submit',
  loadingMessage: 'Loading form...'
});

// Emits
const emit = defineEmits<{
  (e: 'submit', data: any): void;
  (e: 'step-change', step: number): void;
  (e: 'cancel'): void;
}>();

const router = useRouter();

// Form state
const loading = ref(false);
const error = ref<string | null>(null);
const submitting = ref(false);
const currentStep = ref(0);
const formData = ref({ ...props.initialData });
const formErrors = ref<Record<string, string>>({});

// Computed properties
const totalSteps = computed(() => props.steps?.length || 1);

const currentStepConfig = computed(() => {
  return props.steps?.[currentStep.value];
});

const currentStepComponent = computed(() => {
  return currentStepConfig.value?.component;
});

const isCurrentStepValid = computed(() => {
  const validator = currentStepConfig.value?.validator;
  return validator ? validator(formData.value) : true;
});

const isFormValid = computed(() => {
  return props.steps?.every(step => 
    step.validator ? step.validator(formData.value) : true
  ) ?? true;
});

// Methods
const nextStep = () => {
  if (currentStep.value < totalSteps.value - 1 && isCurrentStepValid.value) {
    currentStep.value++;
    emit('step-change', currentStep.value);
  }
};

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
    emit('step-change', currentStep.value);
  }
};

const handleSubmit = async () => {
  if (!isFormValid.value) return;
  
  submitting.value = true;
  try {
    emit('submit', { ...formData.value });
  } catch (err) {
    console.error('Form submission error:', err);
  } finally {
    submitting.value = false;
  }
};

const retry = () => {
  error.value = null;
  loading.value = false;
};

// Lifecycle
onMounted(() => {
  // Initialize form
});
</script>

<style scoped>
/* Form view styles */
.form-view {
  min-height: 100vh;
  background-color: var(--color-background);
}

.form-header {
  background-color: var(--color-surface);
  padding: 2rem 0;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
}

.form-description {
  color: var(--color-text-secondary);
  margin: 0 0 2rem 0;
}

.form-progress {
  margin-top: 2rem;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  max-width: 600px;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  position: relative;
}

.progress-step::after {
  content: '';
  position: absolute;
  top: 1rem;
  left: 60%;
  right: -40%;
  height: 2px;
  background-color: var(--color-border);
  z-index: 1;
}

.progress-step:last-child::after {
  display: none;
}

.progress-step--completed::after {
  background-color: var(--color-success);
}

.step-indicator {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  position: relative;
  z-index: 2;
}

.progress-step--completed .step-indicator {
  background-color: var(--color-success);
  color: white;
}

.progress-step--current .step-indicator {
  background-color: var(--color-primary);
  color: white;
}

.progress-step--pending .step-indicator {
  background-color: var(--color-border);
  color: var(--color-text-secondary);
}

.step-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-align: center;
}

.form-content {
  padding: 2rem 0;
}

.form-card {
  background-color: var(--color-surface);
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  max-width: 600px;
  margin: 0 auto;
}

.form-loading,
.form-error {
  text-align: center;
  padding: 2rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.form-actions-left,
.form-actions-right {
  display: flex;
  gap: 1rem;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .progress-steps {
    flex-direction: column;
    gap: 1rem;
  }
  
  .progress-step::after {
    display: none;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-actions-left,
  .form-actions-right {
    justify-content: stretch;
  }
}
</style>
```

## Route Integration Patterns

### 1. Route Parameter Handling
```vue
<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Extract route parameters
const userId = computed(() => {
  const id = route.params.id;
  return typeof id === 'string' ? id : undefined;
});

const mode = computed(() => {
  return (route.query.mode as string) || 'default';
});

const filters = computed(() => {
  return {
    search: route.query.search as string,
    status: route.query.status as string,
    page: parseInt(route.query.page as string) || 1
  };
});

// Watch for parameter changes
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      loadUserData(newId as string);
    }
  }
);

watch(
  filters,
  (newFilters) => {
    applyFilters(newFilters);
  },
  { deep: true }
);

// Update route programmatically
const updateRoute = (updates: Record<string, any>) => {
  router.push({
    ...route,
    query: {
      ...route.query,
      ...updates
    }
  });
};
</script>
```

### 2. Navigation Guards Integration
```vue
<script setup lang="ts">
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';

// Component state
const hasUnsavedChanges = ref(false);
const isSubmitting = ref(false);

// Route guards
onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value && !isSubmitting.value) {
    const answer = window.confirm(
      'You have unsaved changes. Are you sure you want to leave?'
    );
    if (!answer) return false;
  }
});

onBeforeRouteUpdate(async (to, from) => {
  // Handle route updates (e.g., different user ID)
  if (to.params.id !== from.params.id) {
    await loadData(to.params.id as string);
  }
});
</script>
```

### 3. Meta Information Management
```vue
<script setup lang="ts">
import { useMeta } from '@vueuse/head';
import { computed } from 'vue';

const route = useRoute();

// Dynamic meta information
const metaInfo = computed(() => ({
  title: `${pageTitle.value} - Your App Name`,
  meta: [
    {
      name: 'description',
      content: pageDescription.value || 'Default page description'
    },
    {
      property: 'og:title',
      content: pageTitle.value
    },
    {
      property: 'og:description',
      content: pageDescription.value || 'Default page description'
    }
  ]
}));

// Apply meta information
useMeta(metaInfo);
</script>
```

## State Management Integration

### 1. Store Integration Pattern
```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth.store';
import { useUserStore } from '../stores/user.store';
import { useKycStore } from '../stores/kyc.store';

// Store instances
const authStore = useAuthStore();
const userStore = useUserStore();
const kycStore = useKycStore();

// Reactive store state
const { user, isAuthenticated, loading: authLoading } = storeToRefs(authStore);
const { currentUser, users, loading: userLoading } = storeToRefs(userStore);
const { kycRecord, loading: kycLoading } = storeToRefs(kycStore);

// Combined loading state
const isLoading = computed(() => 
  authLoading.value || userLoading.value || kycLoading.value
);

// Store actions
const logout = async () => {
  try {
    await authStore.logout();
    router.push('/auth');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

const refreshUserData = async () => {
  await Promise.allSettled([
    userStore.fetchCurrentUser(),
    kycStore.fetchKycRecord()
  ]);
};
</script>
```

### 2. Composables Integration
```vue
<script setup lang="ts">
import { useAuth } from '../composables/useAuth';
import { useUser } from '../composables/useUser';
import { useKyc } from '../composables/useKyc';

// Composables
const { 
  isAuthenticated, 
  login, 
  logout, 
  refreshToken 
} = useAuth();

const { 
  currentUser, 
  loading: userLoading, 
  error: userError,
  fetchCurrentUser,
  updateUser 
} = useUser();

const { 
  kycRecord, 
  isVerified,
  loading: kycLoading,
  fetchKycRecord,
  submitKyc 
} = useKyc();

// Combined state
const combinedLoading = computed(() => userLoading.value || kycLoading.value);
const hasError = computed(() => !!(userError.value));
</script>
```

## Layout Integration

### 1. Layout Selection
```vue
<script setup lang="ts">
// Layout meta can be defined in route configuration
const route = useRoute();
const layoutName = computed(() => route.meta.layout || 'DefaultLayout');

// Or determined dynamically based on user state
const dynamicLayout = computed(() => {
  if (!isAuthenticated.value) return 'AuthLayout';
  if (route.path.startsWith('/admin')) return 'AdminLayout';
  return 'DefaultLayout';
});
</script>
```

### 2. Layout Communication
```vue
<script setup lang="ts">
import { provide, inject } from 'vue';

// Provide data to layout
provide('page-title', pageTitle);
provide('breadcrumbs', breadcrumbs);
provide('page-actions', pageActions);

// Or use global properties/emits for layout communication
const emit = defineEmits<{
  (e: 'set-title', title: string): void;
  (e: 'set-breadcrumbs', crumbs: any[]): void;
}>();

// Emit to parent layout
emit('set-title', 'User Profile');
emit('set-breadcrumbs', [
  { label: 'Account', to: '/account' },
  { label: 'Profile', to: '/account/profile' }
]);
</script>
```

## Error Handling Patterns

### 1. View-Level Error Boundaries
```vue
<template>
  <div class="view-container">
    <ErrorBoundary @error="handleError">
      <!-- Main content -->
      <template v-if="!hasError">
        <component :is="currentComponent" v-bind="componentProps" />
      </template>
      
      <!-- Error fallback -->
      <template v-else>
        <div class="error-fallback">
          <h2>Something went wrong</h2>
          <p>{{ errorMessage }}</p>
          <button @click="retry" class="btn btn-primary">Try Again</button>
        </div>
      </template>
    </ErrorBoundary>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ErrorBoundary from '@/components/ErrorBoundary.vue';

const hasError = ref(false);
const errorMessage = ref('');

const handleError = (error: Error) => {
  hasError.value = true;
  errorMessage.value = error.message;
  console.error('View error:', error);
};

const retry = () => {
  hasError.value = false;
  errorMessage.value = '';
  // Reload component or data
};
</script>
```

### 2. Async Error Handling
```vue
<script setup lang="ts">
import { onErrorCaptured } from 'vue';

const error = ref<Error | null>(null);
const loading = ref(false);

// Capture errors from child components
onErrorCaptured((err, instance, info) => {
  console.error('Captured error:', err, info);
  error.value = err;
  return false; // Prevent error from propagating
});

// Async operation with error handling
const performAsyncOperation = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    await someAsyncOperation();
  } catch (err) {
    error.value = err as Error;
    console.error('Async operation failed:', err);
  } finally {
    loading.value = false;
  }
};
</script>
```

## Performance Optimization

### 1. Component Lazy Loading
```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

// Lazy load heavy components
const HeavyComponent = defineAsyncComponent({
  loader: () => import('../components/HeavyComponent.vue'),
  loadingComponent: () => import('../components/LoadingSpinner.vue'),
  errorComponent: () => import('../components/ErrorComponent.vue'),
  delay: 200,
  timeout: 3000
});

const LazyModal = defineAsyncComponent(() => import('../components/Modal.vue'));
</script>
```

### 2. Data Prefetching
```vue
<script setup lang="ts">
import { onBeforeRouteUpdate } from 'vue-router';

// Prefetch data when route is about to change
onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id !== from.params.id) {
    // Start loading data before route changes
    const dataPromise = loadUserData(to.params.id as string);
    
    // Show loading state
    loading.value = true;
    
    try {
      await dataPromise;
    } catch (error) {
      console.error('Prefetch failed:', error);
    } finally {
      loading.value = false;
    }
  }
});
</script>
```

### 3. Memory Management
```vue
<script setup lang="ts">
import { onUnmounted } from 'vue';

// Cleanup subscriptions and timers
const subscriptions: Array<() => void> = [];
const timers: number[] = [];

const addSubscription = (unsubscribe: () => void) => {
  subscriptions.push(unsubscribe);
};

const addTimer = (id: number) => {
  timers.push(id);
};

onUnmounted(() => {
  // Cleanup subscriptions
  subscriptions.forEach(unsubscribe => unsubscribe());
  
  // Clear timers
  timers.forEach(id => clearTimeout(id));
  
  // Clear any other resources
});
</script>
```

## Accessibility Implementation

### 1. Semantic HTML Structure
```vue
<template>
  <main class="view-main" role="main" :aria-labelledby="titleId">
    <header class="view-header">
      <h1 :id="titleId" class="view-title">{{ title }}</h1>
      <nav class="view-nav" aria-label="Page navigation">
        <!-- Navigation content -->
      </nav>
    </header>
    
    <section class="view-content" :aria-busy="loading">
      <div v-if="loading" class="sr-only" aria-live="polite">
        Loading content...
      </div>
      
      <!-- Main content -->
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const titleId = computed(() => `title-${Math.random().toString(36).substr(2, 9)}`);
</script>
```

### 2. Keyboard Navigation
```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Escape':
      if (modalOpen.value) {
        closeModal();
        event.preventDefault();
      }
      break;
      
    case 'Enter':
    case ' ':
      if (event.target instanceof HTMLButtonElement) {
        event.target.click();
        event.preventDefault();
      }
      break;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>
```

## Testing View Components

### 1. Component Testing Setup
```typescript
// user.view.spec.ts
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import UserView from '../user.view.vue';

describe('UserView', () => {
  let wrapper: any;
  let router: any;
  let pinia: any;

  beforeEach(async () => {
    // Setup router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/user/:id?', component: UserView }
      ]
    });

    // Setup Pinia
    pinia = createPinia();

    // Mount component
    wrapper = mount(UserView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          UserComponent: true
        }
      }
    });

    await router.isReady();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('should render page title correctly', () => {
    expect(wrapper.find('h1').text()).toBe('My Profile');
  });

  it('should handle mode switching', async () => {
    await router.push('/user?mode=settings');
    await wrapper.vm.$nextTick();
    
    expect(wrapper.vm.currentMode).toBe('settings');
  });

  it('should display admin controls for admin users', async () => {
    // Mock admin user
    const userStore = useUserStore(pinia);
    userStore.currentUser = { id: '1', role: 'admin' };
    
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.mode-switcher').exists()).toBe(true);
  });
});
```

### 2. Integration Testing
```typescript
// user-flow.spec.ts
import { describe, it, expect } from 'vitest';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';

describe('User Flow Integration', () => {
  it('should complete user profile update flow', async () => {
    // Setup application
    const app = createApp({});
    const router = createRouter({
      history: createWebHistory(),
      routes: accountsRoutes
    });
    const pinia = createPinia();
    
    app.use(router);
    app.use(pinia);
    
    // Navigate to user profile
    await router.push('/account/profile');
    
    // Simulate user interaction
    // ... test implementation
  });
});
```

## View Index Organization

### 1. Views Export Structure
```typescript
// views/index.ts
/**
 * Views Index
 * 
 * This file exports all views from the Accounts module.
 */

// Main view components
export { default as AuthView } from './auth.view.vue';
export { default as UserView } from './user.view.vue';
export { default as KycView } from './kyc.view.vue';

// View-specific types
export interface ViewMeta {
  title?: string;
  description?: string;
  requiresAuth?: boolean;
  requiresRole?: string[];
  layout?: string;
  breadcrumbs?: Array<{
    label: string;
    to?: string;
  }>;
}

// View configuration helpers
export const createViewMeta = (meta: Partial<ViewMeta>): ViewMeta => ({
  requiresAuth: true,
  layout: 'DefaultLayout',
  ...meta
});
```

### 2. Route Configuration
```typescript
// routes.ts integration
import { AccountsViews } from './views';

export const accountsRoutes: RouteRecordRaw[] = [
  {
    path: '/auth',
    name: 'auth',
    component: AccountsViews.AuthView,
    meta: createViewMeta({
      requiresAuth: false,
      layout: 'AuthLayout',
      title: 'Authentication'
    })
  },
  {
    path: '/account/profile',
    name: 'user-profile',
    component: AccountsViews.UserView,
    meta: createViewMeta({
      title: 'User Profile',
      breadcrumbs: [
        { label: 'Account', to: '/account' },
        { label: 'Profile' }
      ]
    })
  },
  {
    path: '/account/kyc',
    name: 'kyc-verification',
    component: AccountsViews.KycView,
    meta: createViewMeta({
      title: 'Identity Verification',
      breadcrumbs: [
        { label: 'Account', to: '/account' },
        { label: 'KYC Verification' }
      ]
    })
  }
];
```

## Best Practices Summary

### ✅ Do's
- Keep views as thin orchestration layers over business components
- Use proper semantic HTML structure for accessibility
- Implement comprehensive error boundaries and loading states
- Handle route parameters and query strings reactively
- Provide clear visual feedback for all user interactions
- Use consistent loading and error state patterns across views
- Implement proper cleanup in onUnmounted hooks
- Use TypeScript for all props, emits, and reactive state
- Follow responsive design principles with mobile-first approach
- Implement proper breadcrumb navigation for complex flows
- Use proper ARIA labels and semantic markup
- Implement keyboard navigation support
- Write comprehensive unit and integration tests
- Use lazy loading for heavy components and routes

### ❌ Don'ts
- Don't put business logic directly in views (use composables/stores)
- Don't ignore loading and error states
- Don't hardcode values that should come from props or routes
- Don't forget to handle edge cases (empty states, errors)
- Don't use any types (maintain strict TypeScript)
- Don't ignore accessibility requirements
- Don't create memory leaks with uncleanied subscriptions
- Don't use inline styles (prefer CSS classes)
- Don't forget to implement proper responsive breakpoints
- Don't skip error boundary implementation
- Don't ignore SEO meta information management
- Don't create overly complex view logic (delegate to components)
- Don't forget to test view-specific functionality
- Don't ignore performance optimization opportunities

## Migration and Maintenance

### OAuth-Only Architecture Compliance
```vue
<script setup lang="ts">
// Ensure all views support OAuth-only authentication
const authStore = useAuthStore();

// Remove any password-based authentication references
const handleLegacyAuthAttempt = () => {
  throw new Error(
    'Password-based authentication is no longer supported. ' +
    'Please use OAuth authentication with Google or Azure.'
  );
};

// Provide clear migration messaging for legacy users
const showOAuthMigrationMessage = computed(() => {
  return route.query.legacy === 'true';
});
</script>

<template>
  <div v-if="showOAuthMigrationMessage" class="migration-notice">
    <p>Password-based login is no longer available. Please sign in with your OAuth provider.</p>
  </div>
</template>
```

### View Consolidation Strategy
```vue
<!-- Consolidated view handling multiple related routes -->
<template>
  <div class="consolidated-view">
    <component 
      :is="currentViewComponent" 
      v-bind="currentViewProps"
      @navigation="handleNavigation"
    />
  </div>
</template>

<script setup lang="ts">
const currentViewComponent = computed(() => {
  switch (route.name) {
    case 'user-profile':
      return UserProfileSection;
    case 'user-settings':
      return UserSettingsSection;
    case 'user-list':
      return UserListSection;
    default:
      return UserProfileSection;
  }
});
</script>
```

## View Architecture Best Practices

**⚠️ CRITICAL ARCHITECTURE RULE:**
Views must NEVER directly communicate with the backend. All data operations must go through:
1. **Layer 2 (Components/Sections)** that access Layer 3 (Stores/Composables)
2. **Layer 3 (Composables/Stores)** for business logic and state management  
3. **Layer 4 (Services)** for API calls (accessed through Layer 3 only)

**❌ FORBIDDEN in Views:**
```typescript
// ❌ NEVER do this in views - violates Layer 1 boundaries
import apiClient from '../../../services/apiClient';

// ❌ NEVER make direct HTTP calls from views
const fetchUserData = async () => {
  const response = await apiClient.get('/users/me'); // WRONG!
  userData.value = response.data;
};
```

**✅ CORRECT Layer 1 Architecture:**
```typescript
// ✅ Views coordinate components and handle routing
<template>
  <!-- Layer 1 → Layer 2 coordination -->
  <UserComponent 
    :user-id="userId" 
    @profile-updated="handleProfileUpdate"
  />
  <KycSection v-if="showKyc" />
</template>

<script setup lang="ts">
// ✅ Views handle route parameters and page coordination
const route = useRoute();
const router = useRouter();
const userId = route.params.id as string;

// ✅ Views can access Layer 3 for page-level state
import { useUser } from '../composables/useUser';
const { currentUser, loading } = useUser();

// ✅ Views coordinate page-level actions
const handleProfileUpdate = () => {
  router.push('/profile/success');
};

// ✅ Views manage page meta and layout
const pageTitle = computed(() => 
  userId ? `User ${userId}` : 'My Profile'
);
</script>

// ✅ The actual data operations happen in Layer 2 components:
// UserComponent.vue → useUser() → UserService → apiClient
```

---

*This instruction document ensures consistent, accessible, and maintainable view development within the Frontend Accounts Module while supporting the OAuth-only authentication architecture and clean separation of concerns.*
