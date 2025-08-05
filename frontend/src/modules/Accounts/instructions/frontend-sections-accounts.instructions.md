---
applyTo: "frontend/src/modules/Accounts/sections/*.vue"
---

# Frontend Accounts Module - Sections Instructions

## Overview
This document provides comprehensive instructions for developing, maintaining, and extending section components within the Frontend Accounts Module. Sections represent large, reusable UI blocks that encapsulate complex functionality and are designed for dynamic loading and cross-module integration.

## Section Architecture

### 🏗️ Layer 2: Section/Component (UI Elements)
Sections are **Layer 2** in the mandatory application frontend flow:

```
📍 LAYER 2: Section/Component (UI Elements)
👉 UI elements, forms, cards, etc. (but larger/more complex than components)
👉 May access global state from a store or call a composable/hook
👉 Handle complex business UI logic and user interactions
```

### Section Definition
Sections are high-level UI components that:
- Represent complex UI blocks with substantial functionality
- Are designed for reusability across multiple views and modules
- Support dynamic loading through the global section registry
- Integrate seamlessly with the application's async component system
- Provide standardized interfaces for cross-module communication
- **⚠️ NO DIRECT BACKEND COMMUNICATION**: Sections must NEVER directly call apiClient, axios, fetch, or any HTTP methods. All backend communication MUST go through services layer only.

### Mandatory Flow Integration
Sections must follow the application flow:
- **Layer 2 (Sections)** → **Layer 3 (Stores/Composables)** → **Layer 4 (Services)** → **Layer 5 (apiClient)**
- Sections are larger, more complex components that handle business UI logic
- Sections can access stores directly or use composables for state management

### Section vs Component Distinction
- **Sections**: Large, complex UI blocks with business logic integration (e.g., UserProfile.section.vue)
- **Components**: Smaller, focused UI elements with specific responsibilities (e.g., UserRoleBadge.vue)
- **Views**: Page-level containers that orchestrate sections and components

## Current Section Implementation

### UserProfile.section.vue
```vue
// Complete user profile management section
// Location: frontend/src/modules/Accounts/sections/UserProfile.section.vue
// Purpose: Comprehensive user profile display and editing functionality
// Integration: Used across user management views and admin interfaces
```

**Key Features:**
- Dual-mode operation (display/edit)
- Comprehensive form handling with validation
- Social links integration
- Role-based permissions
- Responsive design with Tailwind CSS
- Event-driven architecture with parent communication

## Section Development Guidelines

### 1. File Naming Convention
```
[SectionName].section.vue
```
- Use PascalCase for section names
- Always include `.section.vue` suffix
- Descriptive names that reflect functionality

### 2. Section Structure Template
```vue
<template>
  <div class="[section-name]-section bg-white rounded-lg shadow-md overflow-hidden">
    <div class="p-6">
      <!-- Section header with title and actions -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold">{{ sectionTitle }}</h2>
          <p class="text-gray-600">{{ sectionDescription }}</p>
        </div>
        
        <!-- Action buttons -->
        <div class="flex space-x-2">
          <button v-if="editable" @click="toggleEditMode">
            <!-- Edit/Cancel icon -->
          </button>
        </div>
      </div>
      
      <!-- Main content area -->
      <div class="section-content">
        <!-- Display mode -->
        <div v-if="!isEditing" class="space-y-4">
          <!-- Content display -->
        </div>
        
        <!-- Edit mode -->
        <form v-else @submit.prevent="saveChanges" class="space-y-4">
          <!-- Form inputs -->
          
          <div class="flex justify-end space-x-3">
            <button type="button" @click="cancelEdit">Cancel</button>
            <button type="submit" :disabled="loading">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useComposableName } from '@/modules/Accounts/composables/useComposableName';
import type { TypeDefinitions } from '@/modules/Accounts/types/type.types';

// Props definition
const props = defineProps<{
  // Required props
  data: TypeDefinitions;
  // Optional props
  editable?: boolean;
  mode?: 'display' | 'edit';
}>();

// Events definition
const emit = defineEmits<{
  (e: 'update', data: Partial<TypeDefinitions>): void;
  (e: 'delete', id: string): void;
  (e: 'error', error: Error): void;
}>();

// Composables
const { loading, error, methods } = useComposableName();

// Local state
const isEditing = ref(false);
const form = reactive({
  // Form fields
});

// Computed properties
const sectionTitle = computed(() => {
  // Dynamic title logic
});

// Methods
const toggleEditMode = () => {
  isEditing.value = !isEditing.value;
};

const saveChanges = async () => {
  try {
    // Save logic
    emit('update', form);
    isEditing.value = false;
  } catch (err) {
    emit('error', err as Error);
  }
};

const cancelEdit = () => {
  isEditing.value = false;
  // Reset form
};
</script>

<style scoped>
.section-content {
  /* Section-specific styles */
}
</style>
```

### 3. Props and Events Standards

#### Props Pattern
```typescript
// Required props should be explicit
const props = defineProps<{
  // Primary data
  user: User;
  data: DataType;
  
  // Configuration
  editable?: boolean;
  mode?: 'display' | 'edit' | 'readonly';
  variant?: 'default' | 'compact' | 'detailed';
  
  // Behavioral
  loading?: boolean;
  disabled?: boolean;
}>();
```

#### Events Pattern
```typescript
// Standardized event emissions
const emit = defineEmits<{
  // Data manipulation
  (e: 'update', data: Partial<DataType>): void;
  (e: 'create', data: DataType): void;
  (e: 'delete', id: string): void;
  
  // State changes
  (e: 'mode-change', mode: string): void;
  (e: 'edit-start'): void;
  (e: 'edit-cancel'): void;
  
  // Error handling
  (e: 'error', error: Error): void;
  (e: 'success', message: string): void;
}>();
```

### 4. Integration Patterns

#### Section Registry Integration
```typescript
// In sections/index.ts
const sections: SectionRegistry = {
  // Accounts sections
  'accounts/user-profile': () => import('@/modules/Accounts/sections/UserProfile.section.vue'),
  'accounts/user-settings': () => import('@/modules/Accounts/sections/UserSettings.section.vue'),
  'accounts/kyc-verification': () => import('@/modules/Accounts/sections/KycVerification.section.vue'),
};
```

#### Dynamic Section Loading
```vue
<template>
  <div class="section-container">
    <component :is="sectionComponent" v-bind="sectionProps" @update="handleUpdate" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getAsyncSection } from '@/sections';

const props = defineProps<{
  sectionKey: string;
  sectionProps: Record<string, any>;
}>();

const sectionComponent = computed(() => 
  getAsyncSection(props.sectionKey)
);

const handleUpdate = (data: any) => {
  // Handle section updates
};
</script>
```

## Section Integration Requirements

### 1. Composable Integration
```typescript
// Required composable usage
import { useUser } from '@/modules/Accounts/composables/useUser';
import { useAuth } from '@/modules/Accounts/composables/useAuth';

// Standard composable patterns
const { 
  loading, 
  error, 
  currentUser, 
  isAdmin,
  updateUser,
  deleteUser 
} = useUser();
```

### 2. Type Safety Requirements
```typescript
// Import all required types
import type { 
  User, 
  UserProfile, 
  UserRole,
  UserSettings 
} from '@/modules/Accounts/types/user.types';

// Use proper type annotations
const form = reactive<Partial<UserProfile>>({
  firstName: '',
  lastName: '',
  // ... other fields with proper typing
});
```

### 3. Service Integration
```typescript
// Use standardized service pattern
import { UserService } from '@/modules/Accounts/services/user.service';

// Service instantiation
const userService = new UserService();

// Service method calls with proper error handling
const updateProfile = async (profileData: Partial<UserProfile>) => {
  try {
    const updatedUser = await userService.updateProfile(profileData);
    emit('update', updatedUser);
  } catch (error) {
    emit('error', error as Error);
  }
};
```

## State Management in Sections

### 1. Local State Pattern
```typescript
// Form state management
const form = reactive<FormData>({
  // Initialize with default values
});

// UI state management
const isEditing = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Computed properties for derived state
const isFormValid = computed(() => {
  // Validation logic
});
```

### 2. Store Integration
```typescript
// Pinia store integration when needed
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/modules/Accounts/stores/user';

const authStore = useAuthStore();
const userStore = useUserStore();

// React to store changes
watchEffect(() => {
  if (authStore.currentUser) {
    // Update local state
  }
});
```

## Styling and UI Guidelines

### 1. Design System Adherence
```vue
<template>
  <!-- Use consistent design tokens -->
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="p-6">
      <!-- Standard spacing and layout -->
      <div class="space-y-4">
        <!-- Consistent form styling -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Field Label
            </label>
            <input 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 2. Responsive Design
```vue
<!-- Mobile-first responsive design -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Responsive grid items -->
</div>

<!-- Responsive text sizing -->
<h2 class="text-lg md:text-xl lg:text-2xl font-semibold">
  Section Title
</h2>

<!-- Responsive spacing -->
<div class="p-4 md:p-6 lg:p-8">
  <!-- Content -->
</div>
```

## Performance Optimization

### 1. Lazy Loading
- All sections are loaded asynchronously through the section registry
- Implement proper loading states and error boundaries
- Use Vue's `defineAsyncComponent` with appropriate timeout and error handling

### 2. Memory Management
```typescript
// Proper cleanup in onUnmounted
import { onUnmounted } from 'vue';

onUnmounted(() => {
  // Cleanup subscriptions, timers, etc.
});

// Use weak references for large objects when appropriate
const cache = new WeakMap();
```

## Error Handling

### 1. Section-Level Error Handling
```typescript
// Comprehensive error handling
const handleError = (error: Error) => {
  console.error(`Section error in ${sectionName}:`, error);
  
  // Emit error to parent
  emit('error', error);
  
  // Set local error state
  error.value = error.message;
  
  // Optional: Report to error tracking service
  // errorTracker.captureException(error);
};
```

### 2. Form Validation
```typescript
// Client-side validation
const validateForm = (): boolean => {
  const errors: string[] = [];
  
  if (!form.firstName.trim()) {
    errors.push('First name is required');
  }
  
  if (!isValidEmail(form.email)) {
    errors.push('Valid email is required');
  }
  
  if (errors.length > 0) {
    error.value = errors.join(', ');
    return false;
  }
  
  error.value = null;
  return true;
};
```

## Testing Guidelines

### 1. Unit Test Structure
```typescript
// Section.spec.ts
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import UserProfileSection from '../UserProfile.section.vue';

describe('UserProfileSection', () => {
  const mockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'user' as const
  };

  it('renders user information correctly', () => {
    const wrapper = mount(UserProfileSection, {
      props: { user: mockUser }
    });
    
    expect(wrapper.text()).toContain('John Doe');
    expect(wrapper.text()).toContain('john@example.com');
  });

  it('toggles edit mode when editable', async () => {
    const wrapper = mount(UserProfileSection, {
      props: { 
        user: mockUser, 
        editable: true 
      }
    });
    
    await wrapper.find('[data-test="edit-button"]').trigger('click');
    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('emits update event on form submission', async () => {
    const wrapper = mount(UserProfileSection, {
      props: { 
        user: mockUser, 
        editable: true 
      }
    });
    
    await wrapper.find('[data-test="edit-button"]').trigger('click');
    await wrapper.find('form').trigger('submit');
    
    expect(wrapper.emitted('update')).toBeTruthy();
  });
});
```

### 2. Integration Testing
```typescript
// Test section integration with composables and services
it('integrates with user service for updates', async () => {
  const mockUserService = {
    updateProfile: vi.fn().mockResolvedValue(updatedUser)
  };
  
  // Test service integration
  // Test error scenarios
  // Test loading states
});
```

## Future Section Development

### 1. Planned Sections
- **UserSettings.section.vue**: Comprehensive user settings management
- **KycVerification.section.vue**: KYC document upload and verification
- **UserActivity.section.vue**: User activity timeline and logs
- **UserPreferences.section.vue**: User preferences and notifications

### 2. Section Registry Expansion
```typescript
// Planned section registry entries
const plannedSections = {
  'accounts/user-settings': () => import('@/modules/Accounts/sections/UserSettings.section.vue'),
  'accounts/kyc-verification': () => import('@/modules/Accounts/sections/KycVerification.section.vue'),
  'accounts/user-activity': () => import('@/modules/Accounts/sections/UserActivity.section.vue'),
  'accounts/user-preferences': () => import('@/modules/Accounts/sections/UserPreferences.section.vue'),
};
```

## Best Practices Summary

### ✅ Do's
- Use the `.section.vue` naming convention consistently
- Implement proper props and events interfaces
- Integrate with module composables and services
- Follow the established design system
- Include comprehensive error handling
- Provide loading and error states
- Write unit and integration tests
- Document complex business logic
- Use TypeScript for type safety
- Implement proper cleanup in onUnmounted

### ❌ Don'ts
- Don't bypass the section registry system
- Don't mix section and component responsibilities
- Don't hardcode API endpoints (use services)
- Don't ignore error boundaries
- Don't forget responsive design considerations
- Don't skip accessibility features
- Don't create sections without proper documentation
- Don't ignore performance implications
- Don't use any types (maintain type safety)
- Don't forget to test edge cases

## Migration and Legacy Support

### From Components to Sections
When converting existing components to sections:

1. **Assessment**: Evaluate if the component meets section criteria (complexity, reusability, business logic)
2. **Refactoring**: Follow the section template structure
3. **Registry Update**: Add to the global section registry
4. **Testing**: Ensure all existing functionality is preserved
5. **Documentation**: Update all references and documentation

### Backward Compatibility
- Maintain existing component interfaces during transition periods
- Provide migration guides for consumers
- Use feature flags for gradual rollout of new sections

---

*This instruction document ensures consistent, high-quality section development within the Frontend Accounts Module while maintaining integration with the broader application architecture.*
