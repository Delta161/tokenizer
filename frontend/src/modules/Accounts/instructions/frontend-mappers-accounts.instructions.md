---
applyTo: "frontend/src/modules/Accounts/mappers/*.ts"
---

# Frontend Accounts Mappers Instructions

## Overview

The mappers folder contains **data transformation utilities** that handle the conversion between backend and frontend data structures. These mappers are essential for maintaining clean separation between API data formats and frontend application models, ensuring consistent data handling across the Accounts module.

## Mapper Architecture

### 🔧 Utility Layer: Mappers (Data Transformation)
Mappers are **utility functions** that support the mandatory application frontend flow:

```
🔧 UTILITY LAYER: Mappers (Data Transformation)
👉 Pure data transformation functions
👉 Used primarily by Layer 4 (Services) for backend ↔ frontend data mapping
👉 No layer restrictions - can be used by any layer that needs data transformation
```

### Design Principles

1. **Pure Functions**: All mapper functions are pure with no side effects
2. **Bidirectional Mapping**: Support both backend-to-frontend and frontend-to-backend transformations
3. **Null Safety**: Graceful handling of null, undefined, and malformed data
4. **Type Safety**: Full TypeScript coverage with proper input/output types
5. **Field Normalization**: Consistent field naming between different data sources
6. **Data Validation**: Implicit validation through transformation logic
7. **⚠️ NO BACKEND COMMUNICATION**: Mappers are pure data transformation functions and must NEVER call apiClient, axios, fetch, or any HTTP methods.

### Flow Integration
Mappers support the application flow as utilities:
- **Primary Usage**: Layer 4 (Services) use mappers for API data transformation
- **Secondary Usage**: Any layer can use mappers for data format consistency
- **No Layer Restrictions**: Mappers are stateless utilities available to all layers
- **No Network Operations**: Mappers only transform data, never fetch it

### Mapper Structure Pattern

```typescript
// ✅ Standard mapper function structure
/**
 * Map backend data to frontend format
 * @param backendData Backend data structure (any type for flexibility)
 * @returns Frontend data object with proper typing
 */
export function mapBackendToFrontend(backendData: any): FrontendType {
  // Null safety check
  if (!backendData) return null;
  
  // Handle field transformations
  return {
    // Direct field mappings
    id: backendData.id,
    email: backendData.email,
    
    // Field name transformations
    firstName: backendData.firstName || backendData.first_name,
    
    // Type transformations
    createdAt: backendData.createdAt ? new Date(backendData.createdAt) : undefined,
    
    // Complex transformations
    fullName: computeFullName(backendData),
    
    // Default values
    status: backendData.status || 'UNKNOWN'
  };
}

/**
 * Map frontend data to backend format
 * @param frontendData Frontend data structure
 * @returns Backend data object for API submission
 */
export function mapFrontendToBackend(frontendData: Partial<FrontendType>): any {
  if (!frontendData) return null;
  
  return {
    // Transform frontend fields to backend format
    first_name: frontendData.firstName,
    last_name: frontendData.lastName,
    
    // Remove frontend-specific fields
    fullName: undefined,
    computedField: undefined
  };
}
```

## Mapper Specifications

### 1. auth.mapper.ts

**Purpose**: Authentication and authorization data transformations

#### Key Features:
- **OAuth Response Mapping**: Transforms OAuth provider responses
- **Token Management**: Maps access/refresh token structures
- **User Integration**: Integrates with user mapper for user data
- **Legacy Support**: Handles deprecated password-based auth (marked deprecated)

#### Primary Functions:

##### `mapBackendAuthResponseToFrontend(backendResponse: any): AuthResponse`
```typescript
// Maps complete authentication response from backend
const authResponse = mapBackendAuthResponseToFrontend({
  user: { id: '123', email: 'user@example.com', ... },
  accessToken: 'jwt-token-here',
  refreshToken: 'refresh-token-here'
});
```

##### `mapLoginCredentialsToBackend(credentials: LoginCredentials): any`
```typescript
// Maps login credentials (OAuth only)
const backendCredentials = mapLoginCredentialsToBackend({
  email: 'user@example.com'
  // Note: password field removed for OAuth-only auth
});
```

##### `mapBackendTokenRefreshToFrontend(backendResponse: any): TokenRefreshResponse`
```typescript
// Maps token refresh response
const tokenResponse = mapBackendTokenRefreshToFrontend({
  accessToken: 'new-jwt-token',
  expiresAt: '2025-08-05T12:00:00Z'
});
```

#### Usage Patterns:
```typescript
// In AuthService
import { mapBackendAuthResponseToFrontend } from '../mappers/auth.mapper';

export class AuthService {
  async handleOAuthCallback(code: string): Promise<AuthResponse> {
    const response = await this.apiClient.post('/auth/oauth/callback', { code });
    return mapBackendAuthResponseToFrontend(response.data);
  }
}
```

#### Implementation Notes:
- Integrates with `mapBackendUserToFrontend` for user data consistency
- OAuth-only implementation (password auth deprecated)
- Automatic token structure normalization
- Handles both snake_case and camelCase backend responses

---

### 2. user.mapper.ts

**Purpose**: User profile, settings, and search data transformations

#### Key Features:
- **Name Handling**: Complex firstName/lastName/fullName transformations
- **Profile Management**: Separates profile data from general user data
- **Settings Mapping**: User preferences and configuration mapping
- **Search Integration**: Search parameters and results transformation
- **Array Processing**: Bulk user data transformations

#### Primary Functions:

##### `mapBackendUserToFrontend(backendUser: any): User`
```typescript
// Core user mapping with intelligent name handling
const user = mapBackendUserToFrontend({
  id: '123',
  fullName: 'John Doe',  // Will be split into firstName/lastName
  email: 'john@example.com',
  role: 'USER',
  avatarUrl: 'avatar.jpg'
});
// Result: { firstName: 'John', lastName: 'Doe', avatar: 'avatar.jpg', ... }
```

##### `mapFrontendUserToBackend(frontendUser: Partial<User>): any`
```typescript
// Reverse mapping for API submissions
const backendData = mapFrontendUserToBackend({
  firstName: 'John',
  lastName: 'Doe',
  avatar: 'avatar.jpg'
});
// Result: { fullName: 'John Doe', avatarUrl: 'avatar.jpg', ... }
```

##### `mapBackendUsersToFrontend(backendUsers: any[]): User[]`
```typescript
// Bulk user processing for lists and search results
const users = mapBackendUsersToFrontend([
  { id: '1', fullName: 'User One', ... },
  { id: '2', fullName: 'User Two', ... }
]);
```

##### Profile-Specific Mapping:
```typescript
// Profile data mapping (subset of user data)
const profile = mapBackendProfileToFrontend(backendProfile);
const profileData = mapFrontendProfileToBackend(frontendProfile);
```

##### Settings Mapping:
```typescript
// User settings and preferences
const settings = mapBackendSettingsToFrontend(backendSettings);
const settingsData = mapFrontendSettingsToBackend(frontendSettings);
```

##### Search Functionality:
```typescript
// Search parameters and results
const searchParams = mapSearchParamsToBackend({
  query: 'john',
  role: 'USER',
  page: 1,
  limit: 10
});

const searchResult = mapBackendSearchResultToFrontend(backendResult);
```

#### Complex Transformations:

##### Name Handling Logic:
```typescript
// Intelligent name splitting and combination
if ((!firstName || !lastName) && backendUser.fullName) {
  const nameParts = backendUser.fullName.split(' ');
  firstName = nameParts[0] || '';
  lastName = nameParts.slice(1).join(' ') || '';
}

// Reverse: combining names
const fullName = frontendUser.firstName && frontendUser.lastName
  ? `${frontendUser.firstName} ${frontendUser.lastName}`.trim()
  : frontendUser.fullName;
```

##### Date Transformations:
```typescript
// Safe date parsing
createdAt: backendUser.createdAt ? new Date(backendUser.createdAt) : undefined,
updatedAt: backendUser.updatedAt ? new Date(backendUser.updatedAt) : undefined
```

#### Usage Patterns:
```typescript
// In UserService
import { mapBackendUserToFrontend, mapFrontendUserToBackend } from '../mappers/user.mapper';

export class UserService {
  async getUser(id: string): Promise<User> {
    const response = await this.apiClient.get(`/users/${id}`);
    return mapBackendUserToFrontend(response.data);
  }
  
  async updateUser(id: string, userData: UserUpdate): Promise<User> {
    const backendData = mapFrontendUserToBackend(userData);
    const response = await this.apiClient.patch(`/users/${id}`, backendData);
    return mapBackendUserToFrontend(response.data);
  }
}
```

---

### 3. kyc.mapper.ts

**Purpose**: KYC verification process data transformations

#### Key Features:
- **Status Mapping**: KYC status enumeration handling
- **Provider Integration**: Multiple KYC provider data normalization
- **Document Processing**: Document type and country code transformations
- **Session Management**: Provider session and redirect URL handling
- **Utility Functions**: KYC status checking and formatting utilities

#### Primary Functions:

##### `mapBackendKycToFrontend(backendRecord: any): KycRecord`
```typescript
// Core KYC record mapping with status normalization
const kycRecord = mapBackendKycToFrontend({
  id: 'kyc_123',
  userId: 'user_123',
  status: 'VERIFIED',
  provider: 'SUMSUB',
  documentType: 'PASSPORT',
  country: 'US',
  createdAt: '2025-01-01T00:00:00Z'
});
```

##### `mapKycSubmissionToBackend(submissionData: KycSubmissionData): any`
```typescript
// KYC submission data for verification initiation
const submissionData = mapKycSubmissionToBackend({
  documentType: 'PASSPORT',
  country: 'US'
});
```

##### `mapBackendSessionToFrontend(backendSession: any): KycProviderSession`
```typescript
// Provider session mapping for redirects
const session = mapBackendSessionToFrontend({
  redirectUrl: 'https://provider.com/verify/abc123',
  expiresAt: '2025-08-05T18:00:00Z',
  referenceId: 'ref_12345'
});
```

##### `mapBackendKycArrayToFrontend(backendRecords: any[]): KycRecord[]`
```typescript
// Bulk KYC record processing for admin views
const kycRecords = mapBackendKycArrayToFrontend(backendRecordsArray);
```

#### Utility Functions:

##### Status and Formatting Utilities:
```typescript
// Check if KYC is verified
const isVerified = isKycVerified(kycRecord);

// Format KYC status for display
const statusDisplay = formatKycStatus(kycRecord.status);

// Format country code to country name
const countryName = formatCountryName('US'); // → 'United States'

// Format document type for display
const documentName = formatDocumentType('PASSPORT'); // → 'Passport'
```

#### KYC Status Flow Mapping:
```typescript
// Status enumeration mapping
enum KycStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',  // Frontend only
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED', 
  REJECTED = 'REJECTED'
}

// Provider enumeration mapping
enum KycProvider {
  SUMSUB = 'SUMSUB',
  JUMIO = 'JUMIO',
  ONFIDO = 'ONFIDO'
}
```

#### Usage Patterns:
```typescript
// In KycService
import { 
  mapBackendKycToFrontend, 
  mapKycSubmissionToBackend,
  mapBackendSessionToFrontend 
} from '../mappers/kyc.mapper';

export class KycService {
  async getCurrentUserKyc(): Promise<KycRecord | null> {
    const response = await this.apiClient.get('/kyc/me');
    return mapBackendKycToFrontend(response.data);
  }
  
  async initiateVerification(provider: string, redirectUrl: string): Promise<KycProviderSession> {
    const response = await this.apiClient.post(`/kyc/provider/${provider}/initiate`, {
      redirectUrl
    });
    return mapBackendSessionToFrontend(response.data);
  }
}
```

---

### 4. index.ts

**Purpose**: Centralized mapper exports and module interface

#### Features:
- **Unified Exports**: Single import point for all mappers
- **Organized Structure**: Logical grouping of mapper functions
- **Tree Shaking**: Supports efficient bundling
- **Type Exports**: Includes related type definitions

#### Export Structure:
```typescript
// User-related mappers
export {
  mapBackendUserToFrontend,
  mapFrontendUserToBackend,
  mapBackendUsersToFrontend,
  mapFrontendProfileToBackend,
  mapBackendProfileToFrontend,
  mapFrontendSettingsToBackend,
  mapBackendSettingsToFrontend,
  mapRegisterDataToBackend,
  mapSearchParamsToBackend,
  mapBackendSearchResultToFrontend
} from './user.mapper';

// KYC-related mappers
export {
  mapBackendKycToFrontend,
  mapKycSubmissionToBackend,
  mapBackendSessionToFrontend,
  mapBackendKycArrayToFrontend,
  formatCountryName,
  formatDocumentType,
  isKycVerified,
  formatKycStatus
} from './kyc.mapper';

// Auth-related mappers
export {
  mapBackendAuthResponseToFrontend,
  mapLoginCredentialsToBackend,
  mapBackendTokenRefreshToFrontend
} from './auth.mapper';
```

#### Usage Pattern:
```typescript
// Single import for all mapper needs
import {
  mapBackendUserToFrontend,
  mapBackendKycToFrontend,
  mapBackendAuthResponseToFrontend
} from '../mappers';
```

## Integration Patterns

### Service Layer Integration

```typescript
// ✅ Proper mapper usage in services
export class UserService {
  private apiClient = useApiClient();
  
  async getUser(id: string): Promise<User> {
    try {
      // 1. Make API call
      const response = await this.apiClient.get(`/users/${id}`);
      
      // 2. Transform backend data to frontend format
      return mapBackendUserToFrontend(response.data);
    } catch (error) {
      throw new Error('Failed to fetch user');
    }
  }
  
  async updateUser(id: string, userData: UserUpdate): Promise<User> {
    try {
      // 1. Transform frontend data to backend format
      const backendData = mapFrontendUserToBackend(userData);
      
      // 2. Make API call with transformed data
      const response = await this.apiClient.patch(`/users/${id}`, backendData);
      
      // 3. Transform response back to frontend format
      return mapBackendUserToFrontend(response.data);
    } catch (error) {
      throw new Error('Failed to update user');
    }
  }
}
```

### Composable Integration

```typescript
// ✅ Mapper usage in composables
export function useUser() {
  const fetchUser = async (id: string) => {
    try {
      const response = await userService.getUser(id);
      // Data is already transformed by service layer using mappers
      user.value = response;
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };
  
  return { user, fetchUser };
}
```

### Component Integration

```typescript
// ✅ Indirect mapper usage through services
<script setup lang="ts">
import { useUser } from '../composables/useUser';

const { user, updateUser } = useUser();

// Data transformations are handled transparently
const handleUpdate = async (formData: UserUpdate) => {
  await updateUser(user.value.id, formData);
  // All mapping handled by service/composable layers
};
</script>
```

## Error Handling Strategies

### Null Safety Patterns

```typescript
// ✅ Comprehensive null safety
export function mapBackendUserToFrontend(backendUser: any): User {
  // Early return for null/undefined
  if (!backendUser) return null;
  
  // Safe property access with fallbacks
  const firstName = backendUser.firstName || backendUser.first_name || '';
  
  // Safe array handling
  const socialLinks = backendUser.socialLinks || backendUser.social_links || {};
  
  // Safe date parsing
  const createdAt = backendUser.createdAt ? new Date(backendUser.createdAt) : undefined;
  
  return {
    id: backendUser.id,
    firstName,
    socialLinks,
    createdAt
  };
}
```

### Validation Integration

```typescript
// ✅ Implicit validation through mapping
export function mapKycSubmissionToBackend(submissionData: KycSubmissionData): any {
  if (!submissionData) return null;
  
  // Implicit validation - only allow expected fields
  return {
    documentType: submissionData.documentType,
    country: submissionData.country
    // Unknown fields are automatically filtered out
  };
}
```

### Error Recovery

```typescript
// ✅ Graceful error recovery in mappers
export function mapBackendUserToFrontend(backendUser: any): User {
  try {
    // Attempt complex transformation
    let firstName = backendUser.firstName;
    let lastName = backendUser.lastName;
    
    if ((!firstName || !lastName) && backendUser.fullName) {
      const nameParts = backendUser.fullName.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    return { firstName, lastName, /* ... */ };
  } catch (error) {
    // Fallback to minimal valid user object
    console.warn('User mapping error, using fallback:', error);
    return {
      id: backendUser.id || 'unknown',
      firstName: 'Unknown',
      lastName: 'User',
      email: backendUser.email || ''
    };
  }
}
```

## Performance Optimization

### Efficient Array Processing

```typescript
// ✅ Optimized bulk transformations
export function mapBackendUsersToFrontend(backendUsers: any[]): User[] {
  if (!backendUsers || !Array.isArray(backendUsers)) return [];
  
  // Use efficient array methods
  return backendUsers
    .filter(user => user && user.id) // Filter invalid entries
    .map(mapBackendUserToFrontend);  // Transform valid entries
}
```

### Lazy Loading Support

```typescript
// ✅ Conditional field processing
export function mapBackendUserToFrontend(backendUser: any, includeExtended = false): User {
  const baseUser = {
    id: backendUser.id,
    email: backendUser.email,
    firstName: backendUser.firstName
  };
  
  // Only process extended fields when needed
  if (includeExtended) {
    return {
      ...baseUser,
      socialLinks: backendUser.socialLinks || {},
      preferences: mapBackendSettingsToFrontend(backendUser.settings)
    };
  }
  
  return baseUser;
}
```

### Memoization for Complex Transformations

```typescript
// ✅ Memoized expensive transformations
const countryNameCache = new Map<string, string>();

export function formatCountryName(countryCode: string): string {
  if (countryNameCache.has(countryCode)) {
    return countryNameCache.get(countryCode);
  }
  
  const countryName = lookupCountryName(countryCode); // Expensive operation
  countryNameCache.set(countryCode, countryName);
  return countryName;
}
```

## Testing Considerations

### Mapper Testing

```typescript
// ✅ Comprehensive mapper testing
import { describe, it, expect } from 'vitest';
import { mapBackendUserToFrontend } from '../user.mapper';

describe('mapBackendUserToFrontend', () => {
  it('should map complete user data correctly', () => {
    const backendUser = {
      id: '123',
      fullName: 'John Doe',
      email: 'john@example.com',
      role: 'USER'
    };
    
    const result = mapBackendUserToFrontend(backendUser);
    
    expect(result).toEqual({
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      email: 'john@example.com',
      role: 'USER'
    });
  });
  
  it('should handle null input gracefully', () => {
    expect(mapBackendUserToFrontend(null)).toBeNull();
    expect(mapBackendUserToFrontend(undefined)).toBeNull();
  });
  
  it('should handle malformed data', () => {
    const result = mapBackendUserToFrontend({ id: '123' }); // Missing required fields
    expect(result.id).toBe('123');
    expect(result.firstName).toBeDefined();
  });
});
```

### Mock Data Generation

```typescript
// ✅ Test data factories using mappers
export function createMockUser(overrides: Partial<User> = {}): User {
  const baseUser = {
    id: '123',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'USER' as UserRole
  };
  
  return { ...baseUser, ...overrides };
}

export function createMockBackendUser(overrides: any = {}): any {
  const baseBackendUser = {
    id: '123',
    fullName: 'Test User',
    email: 'test@example.com',
    role: 'USER'
  };
  
  return { ...baseBackendUser, ...overrides };
}
```

## Security Considerations

### Data Sanitization

```typescript
// ✅ Input sanitization in mappers
export function mapFrontendUserToBackend(frontendUser: Partial<User>): any {
  if (!frontendUser) return null;
  
  return {
    // Sanitize text inputs
    firstName: sanitizeString(frontendUser.firstName),
    lastName: sanitizeString(frontendUser.lastName),
    bio: sanitizeString(frontendUser.bio, 500), // Limit length
    
    // Remove potentially dangerous fields
    isAdmin: undefined, // Never allow client to set admin status
    internalId: undefined,
    
    // Validate enums
    role: validateUserRole(frontendUser.role)
  };
}

function sanitizeString(input: string, maxLength = 100): string {
  if (!input) return '';
  return input.trim().substring(0, maxLength);
}
```

### Sensitive Data Filtering

```typescript
// ✅ Automatic sensitive data filtering
export function mapBackendUserToFrontend(backendUser: any): User {
  // Filter out sensitive backend fields
  const {
    passwordHash,
    internalNotes,
    adminFlags,
    ...safeUserData
  } = backendUser;
  
  return {
    id: safeUserData.id,
    firstName: safeUserData.firstName,
    // Only include safe, user-facing fields
  };
}
```

## Advanced Patterns

### Conditional Mapping

```typescript
// ✅ Context-aware mapping
export function mapBackendUserToFrontend(
  backendUser: any, 
  context: 'admin' | 'public' | 'self' = 'public'
): User {
  const baseUser = {
    id: backendUser.id,
    firstName: backendUser.firstName,
    avatar: backendUser.avatarUrl
  };
  
  // Add fields based on context
  switch (context) {
    case 'admin':
      return {
        ...baseUser,
        email: backendUser.email,
        role: backendUser.role,
        createdAt: new Date(backendUser.createdAt),
        lastLoginAt: backendUser.lastLoginAt ? new Date(backendUser.lastLoginAt) : undefined
      };
      
    case 'self':
      return {
        ...baseUser,
        email: backendUser.email,
        phone: backendUser.phone,
        preferences: mapBackendSettingsToFrontend(backendUser.settings)
      };
      
    case 'public':
    default:
      return baseUser; // Minimal public profile
  }
}
```

### Versioned Mapping

```typescript
// ✅ API version-aware mapping
export function mapBackendUserToFrontend(backendUser: any, apiVersion = 'v1'): User {
  switch (apiVersion) {
    case 'v2':
      return mapBackendUserToFrontendV2(backendUser);
    case 'v1':
    default:
      return mapBackendUserToFrontendV1(backendUser);
  }
}
```

## Summary

The mappers in the Accounts module provide a robust, type-safe data transformation layer that ensures consistent communication between frontend and backend systems.

**Key Benefits:**
- ✅ **Data Consistency**: Unified data formats across the application
- ✅ **Type Safety**: Full TypeScript coverage with proper validation
- ✅ **Null Safety**: Comprehensive handling of malformed data
- ✅ **Performance**: Optimized transformations with caching support
- ✅ **Security**: Automatic sanitization and sensitive data filtering
- ✅ **Maintainability**: Clear separation of transformation logic

**Mapper Responsibilities:**
- **auth.mapper.ts**: OAuth responses, token management, authentication data
- **user.mapper.ts**: User profiles, settings, search data, name handling
- **kyc.mapper.ts**: KYC verification data, provider sessions, status formatting
- **index.ts**: Centralized exports and module interface

Each mapper handles bidirectional transformations while maintaining data integrity, security, and performance across the entire Accounts module.
