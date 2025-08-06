---
applyTo: "frontend/src/modules/Accounts/services/*.ts"
---

# Frontend Accounts Module - Services Instructions

## Overview
This document provides comprehensive instructions for developing, maintaining, and extending service classes within the Frontend Accounts Module. Services form the critical data access layer, handling all API communication with the backend while providing type-safe, error-handled, and properly mapped data interfaces.

**⚠️ IMPORTANT REFACTORING UPDATE:**
- **Profile operations MOVED from AuthService to UserService**
- **AuthService now ONLY handles authentication actions**
- **UserService handles ALL user profile and data operations**
- **Clean separation of concerns implemented**

## Service Architecture

### 🏗️ Layer 4: Service (Backend Communication)
Services are **Layer 4** in the mandatory application frontend flow:

```
📍 LAYER 4: Service (Backend Communication)
👉 Handles backend interaction via apiClient.ts (Layer 5)
👉 Makes actual HTTP requests (GET, POST, etc.)
👉 Provides data to Layer 3 (Stores/Composables)
```

### Service Definition
Services are specialized classes that:
- **🔐 EXCLUSIVE BACKEND COMMUNICATION**: Services are the ONLY layer allowed to communicate with the backend via apiClient
- Handle all API communication with the backend
- Provide type-safe interfaces for data operations
- Implement consistent error handling patterns
- Transform data between frontend and backend formats using mappers
- Abstract API complexity from components and composables
- Support session-based authentication architecture (updated from OAuth-only)

### Mandatory Flow Integration
Services must follow the application flow:
- **Layer 4 (Services)** → **Layer 5 (apiClient.ts)**
- Services are consumed by Layer 3 (Stores/Composables) ONLY
- Services are the EXCLUSIVE gateway to backend communication
- NO other layer can bypass services to access apiClient directly

### Service Layer Responsibilities
- **API Communication**: All HTTP requests to backend endpoints (EXCLUSIVE RESPONSIBILITY)
- **Data Transformation**: Frontend ↔ Backend data mapping
- **Error Handling**: Consistent error processing and propagation
- **Type Safety**: Full TypeScript integration with proper interfaces
- **Authentication**: Session-based request authentication (HTTP-only cookies)
- **Caching**: Optional response caching for performance optimization

## Service Separation After Refactoring

### 1. AuthService (Authentication Only)
**Endpoint Focus**: `/api/v1/auth/*`
**Responsibilities**:
- ✅ OAuth provider URL generation
- ✅ Logout operations
- ✅ Session validation via UserService delegation
- ✅ Authentication health checks
- ❌ **NO LONGER**: Direct profile retrieval (delegates to UserService)

### 2. UserService (Profile & User Data)
**Endpoint Focus**: `/api/v1/users/*`
**Responsibilities**:
- ✅ Current user profile (`/users/me`, `/users/profile`)
- ✅ Profile updates and management
- ✅ User data operations
- ✅ **NEW**: Primary service for all user data (moved from AuthService)
// Location: frontend/src/modules/Accounts/services/user.service.ts
// Purpose: Complete user profile and management operations
// Architecture: Class-based service with instance methods
```

**Key Features:**
- Current user profile management (`getCurrentUser`, `updateCurrentUser`)
- Admin user operations (`getUserById`, `updateUser`, `deleteUser`)
- User search and listing (`getAllUsers`, `searchUsers`)
- Comprehensive mapper integration for data transformation
- Role-based operation support (user/admin distinction)

### 2. AuthService Object
```typescript
// Location: frontend/src/modules/Accounts/services/auth.service.ts
// Purpose: OAuth-only authentication operations
// Architecture: Object-based service with static methods
```

**Key Features:**
- OAuth-exclusive authentication (password auth deprecated)
- Token refresh management (`refreshToken`)
- Session management (`logout`, `getCurrentUser`)
- Legacy method deprecation with clear error messages

## 🔐 Session Management in Services (Layer 4)

### CRITICAL: Session-Based Authentication Implementation

Services are **THE ONLY LAYER** responsible for session management operations. All session-related logic must be implemented in the service layer following these mandatory patterns:

### Session Management Responsibilities

**✅ SERVICES MUST:**
- Handle all session validation through API calls
- Make authenticated requests with automatic session cookies
- Check authentication status via backend endpoints
- Handle session expiration and cleanup
- Manage logout operations by calling backend endpoints

**❌ SERVICES MUST NOT:**
- Manually manage session cookies (browser handles this automatically)
- Parse or validate session data client-side
- Store session tokens in localStorage (HTTP-only cookies only)
- Implement session timers or client-side expiration logic

### Session-Based Service Implementation Patterns

#### 1. Authentication Status Check
```typescript
// AuthService method for checking session status
async checkAuth(): Promise<{ isAuthenticated: boolean; user?: User }> {
  try {
    const response = await apiClient.get('/auth/profile');
    return {
      isAuthenticated: true,
      user: userMapper.fromBackend(response.data.data.user)
    };
  } catch (error) {
    // Session invalid/expired - no error throwing needed
    return { isAuthenticated: false };
  }
}
```

#### 2. Session-Based API Calls
```typescript
// Standard authenticated API call pattern
async getCurrentUser(): Promise<User> {
  try {
    // Session cookie automatically included by browser
    const response = await apiClient.get('/auth/profile');
    return userMapper.fromBackend(response.data.data.user);
  } catch (error) {
    // Handle session expiration
    if (error.response?.status === 401) {
      throw new Error('Session expired. Please login again.');
    }
    handleServiceError(error, 'Failed to retrieve user profile.');
    throw error;
  }
}
```

#### 3. Logout Operation
```typescript
// Logout must call backend to destroy session
async logout(): Promise<{ message: string }> {
  try {
    const response = await apiClient.post('/auth/logout');
    return { message: response.data.message || 'Logged out successfully' };
  } catch (error) {
    handleServiceError(error, 'Failed to logout properly.');
    throw error;
  }
}
```

#### 4. OAuth Provider Redirects
```typescript
// OAuth login redirects (no session handling needed)
getGoogleLoginUrl(): string {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${baseUrl}/api/v1/auth/google`;
}

loginWithGoogle(): void {
  // Redirect to OAuth provider - backend will create session
  window.location.href = this.getGoogleLoginUrl();
}
```

### Session Error Handling Patterns

#### Standard Session Error Handler
```typescript
// Use in all services for consistent session error handling
private handleSessionError(error: any, operation: string): void {
  if (error.response?.status === 401) {
    // Session expired - clear any cached data and redirect
    console.warn('Session expired during:', operation);
    // Store will handle cleanup and redirect
    throw new Error('Your session has expired. Please login again.');
  }
  
  if (error.response?.status === 403) {
    console.warn('Session forbidden during:', operation);
    throw new Error('Access denied. Please check your permissions.');
  }
  
  // Standard error handling for other errors
  handleServiceError(error, `Failed to ${operation}.`);
}
```

### Session Management Integration Rules

1. **API Client Configuration**: Services rely on apiClient.ts being configured with `withCredentials: true`
2. **Automatic Cookies**: Browser automatically includes session cookies - no manual header management
3. **Backend Validation**: All session validation happens on the backend via Passport
4. **Error Propagation**: Session errors must be properly propagated to stores for state management
5. **No Client-Side Session Logic**: Services should not implement any client-side session management

### Service Layer Session Architecture Flow

```
Service Method Called
    ↓
Make API Call (apiClient)
    ↓
Browser Includes Session Cookie Automatically
    ↓
Backend Validates Session (Passport)
    ↓
Return Response OR 401/403 Error
    ↓
Service Handles Response/Error
    ↓
Return Data to Store (Layer 3)
```

### Mandatory Session Management Methods

All authentication-related services must implement these methods:

```typescript
interface ISessionAwareService {
  checkAuth(): Promise<{ isAuthenticated: boolean; user?: User }>;
  handleSessionExpiration(error: any): void;
  requiresAuthentication(): boolean;
}
```

### 3. KycService Class
```typescript
// Location: frontend/src/modules/Accounts/services/kyc.service.ts
// Purpose: KYC verification and document management
// Architecture: Static class methods for stateless operations
```

**Key Features:**
- KYC record retrieval (`getCurrentUserKyc`)
- KYC submission handling (`submitKyc`)
- Provider verification initiation (`initiateProviderVerification`)
- Verification status checking (`isKycVerified`)

## Service Development Guidelines

### 1. Service Class Template
```typescript
/**
 * [ServiceName] Service
 * 
 * This service handles all API calls related to [domain].
 * It uses apiClient, which should have its baseURL set to `/api/v1`.
 */

import apiClient from '../../../services/apiClient';
import type {
  DomainType,
  DomainCreateRequest,
  DomainUpdateRequest,
  DomainSearchParams,
  DomainSearchResult,
} from '../types/domain.types';
import { handleServiceError } from '../utils/errorHandling';
import {
  mapBackendDomainToFrontend,
  mapFrontendDomainToBackend,
  mapBackendDomainsToFrontend,
  mapSearchParamsToBackend,
  mapBackendSearchResultToFrontend,
} from '../utils/mappers';

export class DomainService {
  private baseUrl = '/domain';

  /**
   * Get current user's domain data
   * Calls GET /domain/me
   */
  async getCurrentDomain(): Promise<DomainType> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/me`);
      return mapBackendDomainToFrontend(response.data.data);
    } catch (error) {
      handleServiceError(error, 'Failed to fetch current domain data.');
      throw error;
    }
  }

  /**
   * Get domain by ID
   * Calls GET /domain/{id}
   */
  async getDomainById(id: string): Promise<DomainType> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return mapBackendDomainToFrontend(response.data.data);
    } catch (error) {
      handleServiceError(error, `Failed to retrieve domain with ID: ${id}.`);
      throw error;
    }
  }

  /**
   * Update current user's domain data
   * Calls PUT /domain/me
   */
  async updateCurrentDomain(domainData: Partial<DomainUpdateRequest>): Promise<DomainType> {
    try {
      const backendData = mapFrontendDomainToBackend(domainData);
      const response = await apiClient.put(`${this.baseUrl}/me`, backendData);
      return mapBackendDomainToFrontend(response.data.data);
    } catch (error) {
      handleServiceError(error, 'Failed to update current domain.');
      throw error;
    }
  }

  /**
   * Create new domain record
   * Calls POST /domain
   */
  async createDomain(domainData: DomainCreateRequest): Promise<DomainType> {
    try {
      const backendData = mapFrontendDomainToBackend(domainData);
      const response = await apiClient.post(this.baseUrl, backendData);
      return mapBackendDomainToFrontend(response.data.data);
    } catch (error) {
      handleServiceError(error, 'Failed to create domain.');
      throw error;
    }
  }

  /**
   * Delete domain by ID (admin use case)
   * Calls DELETE /domain/{id}
   */
  async deleteDomain(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      handleServiceError(error, `Failed to delete domain with ID: ${id}.`);
      throw error;
    }
  }

  /**
   * Search domains with filters and pagination
   * Calls GET /domain/search
   */
  async searchDomains(searchParams: DomainSearchParams): Promise<DomainSearchResult> {
    try {
      const backendParams = mapSearchParamsToBackend(searchParams);
      const response = await apiClient.get(`${this.baseUrl}/search`, { params: backendParams });
      return mapBackendSearchResultToFrontend(response.data);
    } catch (error) {
      handleServiceError(error, 'Failed to search domains.');
      throw error;
    }
  }
}
```

### 2. Service Object Template (for stateless operations)
```typescript
/**
 * [ServiceName] Service
 * Handles all API calls related to [domain]
 */
export const DomainService = {
  /**
   * Get current domain data
   * @returns Promise with domain data
   */
  async getCurrentDomain(): Promise<DomainType> {
    try {
      const response = await apiClient.get('/domain/me');
      return mapBackendDomainToFrontend(response.data.data);
    } catch (error) {
      return handleServiceError(error, 'Failed to retrieve domain data.');
    }
  },

  /**
   * Update domain data
   * @param data - Domain update data
   * @returns Promise with updated domain
   */
  async updateDomain(data: Partial<DomainUpdateRequest>): Promise<DomainType> {
    try {
      const backendData = mapFrontendDomainToBackend(data);
      const response = await apiClient.put('/domain/me', backendData);
      return mapBackendDomainToFrontend(response.data.data);
    } catch (error) {
      return handleServiceError(error, 'Failed to update domain.');
    }
  }
};
```

### 3. File Naming and Structure
```
services/
├── index.ts                 # Export barrel for all services
├── user.service.ts          # User management operations
├── auth.service.ts          # Authentication operations  
├── kyc.service.ts           # KYC verification operations
└── [domain].service.ts      # Additional domain services
```

## API Client Integration

### 1. Centralized API Client Usage
```typescript
// Required import pattern
import apiClient from '../../../services/apiClient';

// ✅ Correct usage
const response = await apiClient.get('/endpoint');
const response = await apiClient.post('/endpoint', data);
const response = await apiClient.put('/endpoint', data);
const response = await apiClient.delete('/endpoint');

// ❌ Incorrect - Don't create new axios instances
import axios from 'axios';
const response = await axios.get('http://localhost:3000/api/v1/endpoint');
```

### 2. Request Configuration
```typescript
// GET with query parameters
const response = await apiClient.get('/users/search', { 
  params: backendParams 
});

// POST with request body
const response = await apiClient.post('/users', {
  userData: mappedData
});

// PUT with request body
const response = await apiClient.put('/users/me', {
  profileData: mappedData
});

// DELETE with path parameters
const response = await apiClient.delete(`/users/${id}`);
```

### 3. Response Handling Pattern
```typescript
// Standard backend response structure
interface BackendResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

// Service method implementation
async serviceMethod(): Promise<FrontendType> {
  try {
    const response = await apiClient.get('/endpoint');
    // Backend returns { success: true, data: actualData, ... }
    return mapBackendToFrontend(response.data.data);
  } catch (error) {
    handleServiceError(error, 'Operation failed.');
    throw error; // handleServiceError throws by default
  }
}
```

## Error Handling Requirements

### 1. Service Error Handling Pattern
```typescript
import { handleServiceError } from '../utils/errorHandling';

// Standard pattern for all service methods
async serviceMethod(): Promise<ReturnType> {
  try {
    const response = await apiClient.method('/endpoint');
    return processResponse(response);
  } catch (error) {
    handleServiceError(error, 'Descriptive error message for user.');
    throw error; // Never reached - handleServiceError throws
  }
}
```

### 2. Custom Error Messages
```typescript
// Provide user-friendly error messages
handleServiceError(error, 'Failed to fetch user profile.');
handleServiceError(error, 'Unable to update account settings.');
handleServiceError(error, `Failed to delete user with ID: ${id}.`);

// Include context in error messages
handleServiceError(error, `Failed to initiate verification with ${provider}.`);
```

### 3. Special Error Handling Cases
```typescript
// KYC service example - return false instead of throwing
static async isKycVerified(): Promise<boolean> {
  try {
    const kycRecord = await this.getCurrentUserKyc();
    return kycRecord ? isKycVerified(kycRecord.status) : false;
  } catch (error) {
    // Special case: return false on error instead of throwing
    handleServiceError(error, 'Failed to check KYC verification status.', false);
    return false;
  }
}

// Handle 404 as valid response
static async getCurrentUserKyc(): Promise<KycRecord | null> {
  try {
    const response = await apiClient.get('/kyc/me');
    return mapBackendKycToFrontend(response.data.data);
  } catch (error) {
    // If 404, user hasn't submitted KYC yet
    if (error.response?.status === 404) {
      return null;
    }
    return handleServiceError(error, 'Failed to retrieve KYC information.');
  }
}
```

## Data Mapping Integration

### 1. Mapper Import Pattern
```typescript
// Import all required mappers
import {
  mapBackendUserToFrontend,
  mapFrontendUserToBackend,
  mapBackendUsersToFrontend,
  mapBackendProfileToFrontend, 
  mapFrontendProfileToBackend,
  mapSearchParamsToBackend,
  mapBackendSearchResultToFrontend,
} from '../utils/mappers';
```

### 2. Request Data Mapping
```typescript
// Single object mapping
async updateUser(userData: Partial<UserUpdate>): Promise<User> {
  try {
    const backendData = mapFrontendUserToBackend(userData);
    const response = await apiClient.put(`/users/${id}`, backendData);
    return mapBackendUserToFrontend(response.data.data);
  } catch (error) {
    handleServiceError(error, 'Failed to update user.');
    throw error;
  }
}

// Search parameters mapping
async searchUsers(searchParams: UserSearchParams): Promise<UserSearchResult> {
  try {
    const backendParams = mapSearchParamsToBackend(searchParams);
    const response = await apiClient.get('/users/search', { params: backendParams });
    return mapBackendSearchResultToFrontend(response.data);
  } catch (error) {
    handleServiceError(error, 'Failed to search users.');
    throw error;
  }
}
```

### 3. Response Data Mapping
```typescript
// Single object response
const response = await apiClient.get('/users/me');
return mapBackendUserToFrontend(response.data.data);

// Array response
const response = await apiClient.get('/users');
return mapBackendUsersToFrontend(response.data);

// Complex response structure
const response = await apiClient.get('/users/search');
return mapBackendSearchResultToFrontend(response.data);
```

## Type Safety Requirements

### 1. Service Method Signatures
```typescript
// Method parameters must be typed
async getUserById(id: string): Promise<User>
async updateUser(id: string, userData: Partial<UserUpdate>): Promise<User>
async searchUsers(searchParams: UserSearchParams): Promise<UserSearchResult>

// Optional parameters with defaults
async getUsers(limit: number = 10, offset: number = 0): Promise<User[]>

// Union types for enums
async updateUserStatus(id: string, status: UserStatus): Promise<User>
```

### 2. Type Imports
```typescript
// Import all required types from the module
import type {
  User,
  UserProfile,
  UserUpdate,
  UserSearchParams,
  UserSearchResult,
  UserStatus,
  UserRole
} from '../types/user.types';

// Import auth types when needed
import type {
  AuthResponse,
  TokenRefreshResponse,
  LoginCredentials
} from '../types/auth.types';

// Import KYC types when needed
import type {
  KycRecord,
  KycSubmissionData,
  KycProviderSession
} from '../types/kyc.types';
```

### 3. Return Type Specifications
```typescript
// Always specify return types explicitly
async getCurrentUser(): Promise<User> { }
async getAllUsers(): Promise<User[]> { }
async deleteUser(id: string): Promise<void> { }
async searchUsers(params: UserSearchParams): Promise<UserSearchResult> { }

// Union types for nullable returns
async getCurrentUserKyc(): Promise<KycRecord | null> { }

// Generic types for flexible responses
async getData<T>(endpoint: string): Promise<T> { }
```

## Authentication Integration

### 1. OAuth-Only Architecture
```typescript
// ❌ Deprecated methods with clear error messages
async login(_credentials: LoginCredentials): Promise<AuthResponse> {
  return handleServiceError(
    new Error('Direct login with email and password is not supported. Please use OAuth authentication.'),
    'Password-based authentication is not supported. Please use the OAuth login options.'
  );
}

async register(_userData: RegisterData): Promise<AuthResponse> {
  return handleServiceError(
    new Error('Direct registration with email and password is not supported. Please use OAuth authentication.'),
    'Password-based registration is not supported. Please use the OAuth login options.'
  );
}
```

### 2. Token Management
```typescript
// Token refresh handling
async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
  try {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return mapBackendTokenRefreshToFrontend(response.data);
  } catch (error) {
    return handleServiceError(error, 'Failed to refresh authentication token.');
  }
}

// Session cleanup
async logout(): Promise<{ message: string }> {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  } catch (error) {
    return handleServiceError(error, 'Failed to logout properly.');
  }
}
```

### 3. Authenticated Requests
```typescript
// Services don't handle tokens directly - apiClient handles this
// All requests are automatically authenticated via interceptors
async getCurrentUser(): Promise<User> {
  // Token is automatically added by apiClient interceptors
  const response = await apiClient.get('/users/me');
  return mapBackendUserToFrontend(response.data.data);
}
```

## Service Organization Patterns

### 1. Class-Based Services (Preferred for complex domains)
```typescript
export class UserService {
  private baseUrl = '/users';

  // Instance methods for related operations
  async getCurrentUser(): Promise<User> { }
  async updateCurrentUser(data: Partial<UserProfile>): Promise<User> { }
  async deleteCurrentUser(): Promise<void> { }
}

// Usage in components/composables
const userService = new UserService();
const user = await userService.getCurrentUser();
```

### 2. Object-Based Services (For simple/stateless operations)
```typescript
export const AuthService = {
  async logout(): Promise<{ message: string }> { },
  async refreshToken(token: string): Promise<TokenRefreshResponse> { },
  async getCurrentUser(): Promise<User> { }
};

// Usage in components/composables
const result = await AuthService.logout();
```

### 3. Static Class Methods (For utility-style operations)
```typescript
export class KycService {
  static async getCurrentUserKyc(): Promise<KycRecord | null> { }
  static async submitKyc(data: KycSubmissionData): Promise<KycRecord> { }
  static async isKycVerified(): Promise<boolean> { }
}

// Usage in components/composables
const isVerified = await KycService.isKycVerified();
```

## Performance Optimization

### 1. Request Optimization
```typescript
// Use appropriate HTTP methods
async getUser(id: string): Promise<User> {
  // GET for data retrieval
  const response = await apiClient.get(`/users/${id}`);
  return mapBackendUserToFrontend(response.data.data);
}

async updateUser(id: string, data: Partial<UserUpdate>): Promise<User> {
  // PUT for full updates
  const response = await apiClient.put(`/users/${id}`, mappedData);
  return mapBackendUserToFrontend(response.data.data);
}

async updateUserStatus(id: string, status: UserStatus): Promise<User> {
  // PATCH for partial updates
  const response = await apiClient.patch(`/users/${id}/status`, { status });
  return mapBackendUserToFrontend(response.data.data);
}
```

### 2. Pagination Support
```typescript
// Implement pagination parameters
async getAllUsers(page: number = 1, limit: number = 10): Promise<UserSearchResult> {
  try {
    const response = await apiClient.get('/users', {
      params: { page, limit }
    });
    return mapBackendSearchResultToFrontend(response.data);
  } catch (error) {
    handleServiceError(error, 'Failed to retrieve users.');
    throw error;
  }
}

// Search with pagination
async searchUsers(searchParams: UserSearchParams): Promise<UserSearchResult> {
  try {
    const backendParams = mapSearchParamsToBackend(searchParams);
    const response = await apiClient.get('/users/search', { params: backendParams });
    return mapBackendSearchResultToFrontend(response.data);
  } catch (error) {
    handleServiceError(error, 'Failed to search users.');
    throw error;
  }
}
```

### 3. Caching Considerations
```typescript
// Simple in-memory caching for frequently accessed data
class UserService {
  private userCache = new Map<string, { user: User; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getUserById(id: string, useCache: boolean = true): Promise<User> {
    if (useCache) {
      const cached = this.userCache.get(id);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.user;
      }
    }

    try {
      const response = await apiClient.get(`/users/${id}`);
      const user = mapBackendUserToFrontend(response.data.data);
      
      // Cache the result
      this.userCache.set(id, { user, timestamp: Date.now() });
      
      return user;
    } catch (error) {
      handleServiceError(error, `Failed to retrieve user with ID: ${id}.`);
      throw error;
    }
  }

  // Clear cache when user is updated
  async updateUser(id: string, userData: Partial<UserUpdate>): Promise<User> {
    try {
      const backendData = mapFrontendUserToBackend(userData);
      const response = await apiClient.put(`/users/${id}`, backendData);
      const user = mapBackendUserToFrontend(response.data.data);
      
      // Update cache
      this.userCache.set(id, { user, timestamp: Date.now() });
      
      return user;
    } catch (error) {
      handleServiceError(error, `Failed to update user with ID: ${id}.`);
      throw error;
    }
  }
}
```

## Testing Guidelines

### 1. Service Unit Tests
```typescript
// user.service.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../user.service';
import apiClient from '../../../services/apiClient';
import * as mappers from '../utils/mappers';
import * as errorHandling from '../utils/errorHandling';

// Mock dependencies
vi.mock('../../../services/apiClient');
vi.mock('../utils/mappers');
vi.mock('../utils/errorHandling');

describe('UserService', () => {
  let userService: UserService;
  
  beforeEach(() => {
    userService = new UserService();
    vi.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should fetch and map current user successfully', async () => {
      // Arrange
      const mockBackendUser = { id: '1', first_name: 'John', last_name: 'Doe' };
      const mockFrontendUser = { id: '1', firstName: 'John', lastName: 'Doe' };
      
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockBackendUser }
      });
      vi.mocked(mappers.mapBackendUserToFrontend).mockReturnValue(mockFrontendUser);

      // Act
      const result = await userService.getCurrentUser();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/users/me');
      expect(mappers.mapBackendUserToFrontend).toHaveBeenCalledWith(mockBackendUser);
      expect(result).toEqual(mockFrontendUser);
    });

    it('should handle errors properly', async () => {
      // Arrange
      const mockError = new Error('Network error');
      vi.mocked(apiClient.get).mockRejectedValue(mockError);
      vi.mocked(errorHandling.handleServiceError).mockImplementation(() => {
        throw mockError;
      });

      // Act & Assert
      await expect(userService.getCurrentUser()).rejects.toThrow('Network error');
      expect(errorHandling.handleServiceError).toHaveBeenCalledWith(
        mockError,
        'Failed to fetch current user data.'
      );
    });
  });

  describe('updateCurrentUser', () => {
    it('should update and return mapped user', async () => {
      // Arrange
      const updateData = { firstName: 'Jane', lastName: 'Smith' };
      const mappedBackendData = { first_name: 'Jane', last_name: 'Smith' };
      const mockBackendResponse = { id: '1', first_name: 'Jane', last_name: 'Smith' };
      const mockFrontendUser = { id: '1', firstName: 'Jane', lastName: 'Smith' };

      vi.mocked(mappers.mapFrontendProfileToBackend).mockReturnValue(mappedBackendData);
      vi.mocked(apiClient.put).mockResolvedValue({
        data: { data: mockBackendResponse }
      });
      vi.mocked(mappers.mapBackendUserToFrontend).mockReturnValue(mockFrontendUser);

      // Act
      const result = await userService.updateCurrentUser(updateData);

      // Assert
      expect(mappers.mapFrontendProfileToBackend).toHaveBeenCalledWith(updateData);
      expect(apiClient.put).toHaveBeenCalledWith('/users/me', mappedBackendData);
      expect(mappers.mapBackendUserToFrontend).toHaveBeenCalledWith(mockBackendResponse);
      expect(result).toEqual(mockFrontendUser);
    });
  });
});
```

### 2. Integration Testing
```typescript
// user.service.integration.spec.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { UserService } from '../user.service';
import { setupTestServer, teardownTestServer } from '../../../../tests/setup';

describe('UserService Integration', () => {
  let userService: UserService;

  beforeAll(async () => {
    await setupTestServer();
    userService = new UserService();
  });

  afterAll(async () => {
    await teardownTestServer();
  });

  it('should handle complete user workflow', async () => {
    // Test with real API client against test server
    // 1. Get current user
    const currentUser = await userService.getCurrentUser();
    expect(currentUser).toBeDefined();
    expect(currentUser.id).toBeTruthy();

    // 2. Update current user
    const updateData = { firstName: 'Updated Name' };
    const updatedUser = await userService.updateCurrentUser(updateData);
    expect(updatedUser.firstName).toBe('Updated Name');

    // 3. Verify update persistence
    const refreshedUser = await userService.getCurrentUser();
    expect(refreshedUser.firstName).toBe('Updated Name');
  });
});
```

## Service Index and Exports

### 1. Index File Structure
```typescript
/**
 * Services Index
 * 
 * This file exports all services from the Accounts module.
 */

export { UserService } from './user.service';
export { AuthService } from './auth.service';
export { KycService } from './kyc.service';

// Export default instances for convenience
export const userService = new UserService();

// Note: AuthService and KycService use static methods or object exports
// so no default instances are needed
```

### 2. Module Integration
```typescript
// In module barrel file (modules/Accounts/index.ts)
export {
  UserService,
  AuthService,
  KycService,
  userService
} from './services';

// Usage in components
import { userService, AuthService, KycService } from '@/modules/Accounts';

// Or direct service imports
import { UserService } from '@/modules/Accounts/services/user.service';
```

## Best Practices Summary

### ✅ Do's
- Use the centralized `apiClient` for all HTTP requests
- Implement comprehensive error handling with `handleServiceError`
- Map all data using the designated mapper functions
- Provide descriptive error messages for user feedback
- Specify explicit return types for all methods
- Follow consistent naming conventions (`[Domain]Service`)
- Use appropriate HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Implement proper TypeScript typing throughout
- Include JSDoc comments for all public methods
- Handle 404 responses appropriately (return null vs throw)
- Cache frequently accessed data when appropriate
- Support pagination for list operations

### ❌ Don'ts
- Don't create new Axios instances (use apiClient)
- Don't bypass error handling (always use handleServiceError)
- Don't skip data mapping (always transform backend ↔ frontend)
- Don't hardcode API endpoints (use configurable base URLs)
- Don't handle authentication tokens directly (apiClient handles this)
- Don't mix HTTP logic with business logic
- Don't use any types (maintain strict TypeScript)
- Don't ignore error scenarios in tests
- Don't skip documentation for complex operations
- Don't implement password-based authentication (OAuth-only)

## Migration and Legacy Support

### OAuth-Only Transition
```typescript
// Deprecate password-based methods with clear messaging
async login(_credentials: LoginCredentials): Promise<AuthResponse> {
  return handleServiceError(
    new Error('Direct login with email and password is not supported. Please use OAuth authentication.'),
    'Password-based authentication is not supported. Please use the OAuth login options.'
  );
}

// Provide migration path documentation
/**
 * @deprecated Password-based registration is no longer supported
 * @see OAuth authentication flow in auth.composable.ts
 * @since v2.0.0 OAuth-only architecture
 */
```

## Backend Communication Architecture

**🔐 CRITICAL ARCHITECTURE RULE:**
Services are the ONLY layer in the entire application that can communicate with the backend. This is a strict architectural boundary that ensures:

### Layer 4: The EXCLUSIVE Backend Gateway
- **✅ ALLOWED**: Services can use `apiClient`, `axios`, `fetch`, or any HTTP methods
- **✅ RESPONSIBILITY**: All API calls, data fetching, and backend communication
- **✅ INTEGRATION**: Direct access to Layer 5 (apiClient.ts) for HTTP operations

### Layer 5: apiClient.ts Integration
```typescript
// ✅ ONLY Layer 4 (Services) can access Layer 5 (apiClient)
import apiClient from '../../../services/apiClient';

export class UserService {
  async getCurrentUser(): Promise<User> {
    // Layer 4 → Layer 5 communication (EXCLUSIVE)
    const response = await apiClient.get('/users/me');
    return mapBackendUserToFrontend(response.data);
  }
}
```

### All Other Layers: NO Backend Communication
- **❌ Layer 1 (Views)**: Must coordinate through Layer 2 components
- **❌ Layer 2 (Components/Sections)**: Must use Layer 3 for data operations
- **❌ Layer 3 (Composables/Stores)**: Must use Layer 4 services for API calls
- **❌ Utilities (Mappers/Types)**: Pure functions/definitions with no network operations

### Mandatory Data Flow
```
Layer 1 (Views) 
    ↓ coordinates
Layer 2 (Components/Sections)
    ↓ accesses  
Layer 3 (Stores/Composables)
    ↓ calls
Layer 4 (Services) ← ONLY LAYER THAT CAN ACCESS BACKEND
    ↓ uses
Layer 5 (apiClient.ts) → Backend API
```

### Service Method Evolution
```typescript
// Maintain backward compatibility during transitions
class UserService {
  /**
   * @deprecated Use getCurrentUser() instead
   * @see getCurrentUser
   */
  async getProfile(): Promise<User> {
    console.warn('getProfile() is deprecated. Use getCurrentUser() instead.');
    return this.getCurrentUser();
  }

  async getCurrentUser(): Promise<User> {
    // New implementation
  }
}
```

---

*This instruction document ensures consistent, high-quality service development within the Frontend Accounts Module while maintaining integration with the centralized API client and error handling systems. Services are the exclusive gateway to backend communication, ensuring clean architecture and separation of concerns.*
