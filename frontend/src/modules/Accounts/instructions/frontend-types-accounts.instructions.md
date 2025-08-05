---
applyTo: "frontend/src/modules/accounts/types/*.ts"
---
# Frontend Accounts Module - Types Instructions

## Overview
This document provides comprehensive instructions for developing, maintaining, and extending TypeScript type definitions within the Frontend Accounts Module. Types serve as the foundation for type safety, API contract definitions, and maintaining consistency across the entire application layer while ensuring proper integration with backend services.

## Types Architecture

## Type Architecture

### 📋 Utility Layer: Types (Structure Definitions)
Types are **structure definitions** that support the mandatory application frontend flow:

```
📋 UTILITY LAYER: Types (Structure Definitions)
👉 TypeScript interfaces, types, and enums
👉 Used by ALL layers for type safety and IntelliSense
👉 No runtime behavior - purely compile-time constructs
```

### Type Definition Strategy
Type definitions in this module are designed to:
- Ensure compile-time type safety across all application layers
- Define clear contracts between frontend and backend APIs
- Support OAuth-only authentication architecture
- Provide comprehensive KYC verification type coverage
- Enable proper IntelliSense and developer experience
- Maintain consistency with backend type definitions
- Support extensible and maintainable code structure

### Flow Integration
Types support the application flow as structural definitions:
- **Universal Usage**: All 5 layers use types for compile-time safety
- **API Contracts**: Define interfaces for Layer 4 (Services) ↔ backend communication
- **Component Props**: Define interfaces for Layer 1 (Views) and Layer 2 (Components/Sections)
- **State Shapes**: Define interfaces for Layer 3 (Stores/Composables)
- **No Runtime Code**: Types exist only at compile time, no execution logic

### Type Layer Responsibilities
- **API Contracts**: Define interfaces for all API request/response structures
- **Domain Models**: Core business entity definitions (User, KYC, Auth)
- **Data Transfer Objects**: Shape data for service layer communications
- **Validation Schemas**: Type-safe validation and transformation
- **State Management**: Store state structure definitions
- **Component Props**: Vue component property type definitions
- **⚠️ NO BACKEND COMMUNICATION**: Type definitions are purely structural and must NEVER include any runtime code, HTTP calls, or backend communication logic.

## Current Type Implementation

### 1. Authentication Types (auth.types.ts)
```typescript
// Location: frontend/src/modules/accounts/types/auth.types.ts
// Purpose: OAuth-only authentication type definitions
// Architecture: Simplified authentication with deprecation notices
```

**Key Features:**
- **OAuth-Only Architecture**: Removed password-based authentication types
- **Token Management**: JWT token and refresh token interfaces
- **Deprecation Notices**: Clear migration path from legacy auth types
- **API Response Types**: Standardized authentication response structures

**Current Type Definitions:**
```typescript
/**
 * Login credentials for authentication
 * Note: Password field removed as only OAuth authentication is supported
 */
export interface LoginCredentials {
  email: string;
  // password field removed - only OAuth authentication is supported
}

/**
 * Registration data for new user accounts
 * Note: Password field removed as only OAuth authentication is supported
 */
export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  // password field removed - only OAuth authentication is supported
}

/**
 * Authentication response from the API
 */
export interface AuthResponse {
  user: import('./user.types').User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Token refresh response from the API
 */
export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken?: string;
}
```

### 2. User Types (user.types.ts)
```typescript
// Location: frontend/src/modules/accounts/types/user.types.ts
// Purpose: Comprehensive user profile and management type definitions
// Architecture: Role-based user system with extensible profile fields
```

**Key Features:**
- **Role-Based System**: Admin, manager, and user role definitions
- **Extended Profiles**: Bio, location, website, and social links support
- **Search and Filtering**: Comprehensive search parameter types
- **Settings Management**: User preferences and notification settings
- **API Integration**: Request/response types for user operations

**Core Type Structures:**
```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'user' | 'admin' | 'manager';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: UserRole;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface UserSettings {
  id: string;
  email: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
  twoFactorEnabled: boolean;
}
```

**Search and Filtering Types:**
```typescript
export interface UserSearchParams {
  query?: string;
  role?: UserRole;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'role' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UserSearchResult {
  users: User[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface UserUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  twoFactorEnabled?: boolean;
}
```

### 3. KYC Types (kyc.types.ts)
```typescript
// Location: frontend/src/modules/accounts/types/kyc.types.ts
// Purpose: Know Your Customer verification type definitions
// Architecture: Status-based KYC system with provider integration
```

**Key Features:**
- **Status Enumeration**: Clear KYC verification status tracking
- **Provider Integration**: Third-party KYC provider support
- **Document Management**: Document type and country specifications
- **Session Management**: Provider verification session handling

**Core Type Definitions:**
```typescript
/**
 * KYC Status enum
 */
export enum KycStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

/**
 * KYC Provider enum
 */
export enum KycProvider {
  SUMSUB = 'sumsub',
  MANUAL = 'manual'
}

/**
 * KYC Record interface
 */
export interface KycRecord {
  id: string;
  userId: string;
  status: KycStatus;
  provider?: KycProvider;
  documentType?: string;
  country?: string;
  submittedAt?: string;
  verifiedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  referenceId?: string;
}

/**
 * KYC Submission Data
 */
export interface KycSubmissionData {
  documentType: string;
  country: string;
}

/**
 * KYC Provider Session
 */
export interface KycProviderSession {
  redirectUrl: string;
  expiresAt: Date | string;
  referenceId: string;
}
```

### 4. Types Index (index.ts)
```typescript
// Location: frontend/src/modules/accounts/types/index.ts
// Purpose: Centralized type exports for the module
// Architecture: Barrel export pattern for clean imports
```

**Export Structure:**
```typescript
/**
 * Types Index
 * 
 * This file exports all types from the Accounts module.
 */

export * from './user.types';
export * from './auth.types';
export * from './kyc.types';
```

## Type Development Guidelines

### 1. Core Interface Template
```typescript
/**
 * Domain Entity Interface Template
 * Use this template for creating new domain entity types
 */
export interface DomainEntity {
  // Required fields
  id: string;
  createdAt: string;
  updatedAt: string;
  
  // Domain-specific required fields
  name: string;
  status: DomainStatus;
  
  // Optional fields
  description?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  
  // Relationships
  userId?: string;
  parentId?: string;
  
  // Computed/derived fields (marked as optional in API responses)
  displayName?: string;
  isActive?: boolean;
}

/**
 * Status enumeration for domain entities
 */
export enum DomainStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  ARCHIVED = 'ARCHIVED'
}

/**
 * Create request interface (excludes auto-generated fields)
 */
export interface DomainEntityCreateRequest {
  name: string;
  description?: string;
  status?: DomainStatus;
  metadata?: Record<string, any>;
  tags?: string[];
}

/**
 * Update request interface (all fields optional except constraints)
 */
export interface DomainEntityUpdateRequest {
  name?: string;
  description?: string;
  status?: DomainStatus;
  metadata?: Record<string, any>;
  tags?: string[];
}

/**
 * Search parameters interface
 */
export interface DomainEntitySearchParams {
  query?: string;
  status?: DomainStatus;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: keyof DomainEntity;
  sortOrder?: 'asc' | 'desc';
  includeArchived?: boolean;
}

/**
 * Search result interface with pagination
 */
export interface DomainEntitySearchResult {
  items: DomainEntity[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  facets?: {
    statuses: Record<DomainStatus, number>;
    tags: Record<string, number>;
  };
}
```

### 2. API Response Type Templates
```typescript
/**
 * Standard API Response Wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

/**
 * Paginated API Response
 */
export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Error Response Structure
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  errorCode?: string;
  details?: {
    field?: string;
    message?: string;
    code?: string;
  }[];
  timestamp: string;
}

/**
 * Success Response Structure
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}
```

### 3. Authentication Type Patterns
```typescript
/**
 * OAuth Provider Profile Types
 */
export interface OAuthProfile {
  provider: 'google' | 'azure' | 'github';
  id: string;
  email: string;
  name: string;
  avatar?: string;
  verified?: boolean;
}

/**
 * JWT Token Payload
 */
export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
  provider?: string;
}

/**
 * Session Information
 */
export interface SessionInfo {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: number;
  lastActivity: string;
}

/**
 * OAuth Configuration
 */
export interface OAuthConfig {
  provider: string;
  clientId: string;
  redirectUri: string;
  scope: string[];
  responseType: 'code' | 'token';
}
```

### 4. Validation and Form Types
```typescript
/**
 * Form Field Validation
 */
export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

/**
 * Form State Management
 */
export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

/**
 * User Profile Form Types
 */
export interface UserProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface UserProfileFormValidation {
  firstName: FieldValidation;
  lastName: FieldValidation;
  email: FieldValidation;
  website: FieldValidation;
}

/**
 * KYC Form Types
 */
export interface KycFormData {
  documentType: string;
  country: string;
  acceptTerms: boolean;
}

export interface KycFormValidation {
  documentType: FieldValidation;
  country: FieldValidation;
  acceptTerms: FieldValidation;
}
```

### 5. State Management Types
```typescript
/**
 * Store State Base Interface
 */
export interface BaseStoreState {
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  isInitialized: boolean;
}

/**
 * Entity Store State Pattern
 */
export interface EntityStoreState<T> extends BaseStoreState {
  items: T[];
  currentItem: T | null;
  totalCount: number;
  filters: Record<string, any>;
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

/**
 * Auth Store State
 */
export interface AuthStoreState extends BaseStoreState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: number | null;
  sessionTimeoutTimer: number | null;
}

/**
 * User Store State
 */
export interface UserStoreState extends EntityStoreState<User> {
  currentUser: User | null;
  searchResults: UserSearchResult | null;
  searchHistory: string[];
}

/**
 * KYC Store State
 */
export interface KycStoreState extends BaseStoreState {
  kycRecord: KycRecord | null;
  providerSession: KycProviderSession | null;
  documentTypes: string[];
  supportedCountries: string[];
}
```

## Advanced Type Patterns

### 1. Generic Utility Types
```typescript
/**
 * Make specific fields optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific fields required
 */
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Exclude null and undefined
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Extract enum values as union type
 */
export type EnumValues<T> = T[keyof T];

/**
 * API response data extractor
 */
export type ApiResponseData<T> = T extends ApiResponse<infer U> ? U : never;

/**
 * Form field names from interface
 */
export type FormFieldNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
```

### 2. Conditional Types for API Integration
```typescript
/**
 * Backend to Frontend type mapping
 */
export type BackendToFrontend<T> = T extends { createdAt: string }
  ? Omit<T, 'createdAt' | 'updatedAt'> & {
      createdAt: string;
      updatedAt: string;
    }
  : T;

/**
 * Request payload type generation
 */
export type CreateRequestPayload<T> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt'
> & {
  // Force certain fields to be required for creation
} & PartialBy<T, 'status'>;

/**
 * Update payload type generation
 */
export type UpdateRequestPayload<T> = PartialBy<
  Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
  keyof T
>;

/**
 * Search filter type generation
 */
export type SearchFilters<T> = {
  [K in keyof T]?: T[K] extends string
    ? string | string[]
    : T[K] extends number
    ? number | number[] | { min?: number; max?: number }
    : T[K] extends boolean
    ? boolean
    : T[K] extends Date
    ? Date | { from?: Date; to?: Date }
    : any;
} & {
  page?: number;
  limit?: number;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
};
```

### 3. Component Prop Types
```typescript
/**
 * Base component props
 */
export interface BaseComponentProps {
  class?: string;
  style?: string | Record<string, string>;
  id?: string;
  testId?: string;
}

/**
 * Loading state component props
 */
export interface LoadingComponentProps extends BaseComponentProps {
  loading?: boolean;
  loadingText?: string;
  size?: 'small' | 'medium' | 'large';
  overlay?: boolean;
}

/**
 * Form component props
 */
export interface FormComponentProps<T = Record<string, any>> extends BaseComponentProps {
  modelValue: T;
  errors?: Partial<Record<keyof T, string>>;
  disabled?: boolean;
  readonly?: boolean;
  validation?: Partial<Record<keyof T, FieldValidation>>;
  onSubmit?: (data: T) => void | Promise<void>;
  onChange?: (field: keyof T, value: any) => void;
}

/**
 * Data table component props
 */
export interface DataTableProps<T = any> extends BaseComponentProps {
  items: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  selectable?: boolean;
  selectedItems?: T[];
  onSort?: (column: keyof T, order: 'asc' | 'desc') => void;
  onSelect?: (items: T[]) => void;
  onPageChange?: (page: number) => void;
}

export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: T[keyof T], item: T) => string;
  component?: any;
}
```

### 4. Event and Callback Types
```typescript
/**
 * Standard event callback types
 */
export type EventCallback<T = any> = (data: T) => void;
export type AsyncEventCallback<T = any> = (data: T) => Promise<void>;

/**
 * User-related event types
 */
export interface UserEvents {
  'user:created': User;
  'user:updated': User;
  'user:deleted': string;
  'user:profile-changed': User;
  'user:role-changed': { userId: string; oldRole: UserRole; newRole: UserRole };
}

/**
 * Auth-related event types
 */
export interface AuthEvents {
  'auth:login': User;
  'auth:logout': void;
  'auth:token-refreshed': { accessToken: string; refreshToken?: string };
  'auth:session-expired': void;
  'auth:oauth-callback': { provider: string; code: string };
}

/**
 * KYC-related event types
 */
export interface KycEvents {
  'kyc:submitted': KycRecord;
  'kyc:verified': KycRecord;
  'kyc:rejected': KycRecord;
  'kyc:provider-session-created': KycProviderSession;
}

/**
 * Combined event type map
 */
export interface AccountsEvents extends UserEvents, AuthEvents, KycEvents {}
```

## Type Safety Best Practices

### 1. Strict Type Definitions
```typescript
// ✅ Good: Specific union types
export type Theme = 'light' | 'dark' | 'system';
export type UserRole = 'user' | 'admin' | 'manager';

// ❌ Bad: Loose typing
export type Theme = string;
export type UserRole = any;

// ✅ Good: Proper enum usage
export enum KycStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

// ❌ Bad: Hardcoded strings
const status = 'pending'; // Should use KycStatus.PENDING
```

### 2. Optional vs Required Fields
```typescript
// ✅ Good: Clear distinction between required and optional
export interface User {
  // Required fields
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  
  // Optional fields
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
}

// ✅ Good: Separate creation and update interfaces
export interface UserCreateRequest {
  email: string;
  firstName: string;
  lastName: string;
  role?: UserRole; // Optional with default
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  // email and role should be updated through separate endpoints
}
```

### 3. Type Guards and Validation
```typescript
/**
 * Type guard functions for runtime type checking
 */
export function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.firstName === 'string' &&
    typeof obj.lastName === 'string' &&
    ['user', 'admin', 'manager'].includes(obj.role)
  );
}

export function isKycRecord(obj: any): obj is KycRecord {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.userId === 'string' &&
    Object.values(KycStatus).includes(obj.status)
  );
}

export function isApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return obj && typeof obj.success === 'boolean';
}

export function isApiSuccessResponse<T>(obj: any): obj is ApiSuccessResponse<T> {
  return isApiResponse(obj) && obj.success === true && 'data' in obj;
}

export function isApiErrorResponse(obj: any): obj is ApiErrorResponse {
  return isApiResponse(obj) && obj.success === false && 'error' in obj;
}
```

### 4. Backend Integration Types
```typescript
/**
 * Backend API endpoint types
 */
export interface ApiEndpoints {
  // Auth endpoints
  'POST /auth/oauth/google': {
    request: { code: string; redirectUri: string };
    response: AuthResponse;
  };
  'POST /auth/oauth/azure': {
    request: { code: string; redirectUri: string };
    response: AuthResponse;
  };
  'POST /auth/refresh': {
    request: { refreshToken: string };
    response: TokenRefreshResponse;
  };
  'POST /auth/logout': {
    request: {};
    response: { message: string };
  };
  
  // User endpoints
  'GET /users/me': {
    request: {};
    response: User;
  };
  'PUT /users/me': {
    request: UserUpdateRequest;
    response: User;
  };
  'GET /users': {
    request: UserSearchParams;
    response: UserSearchResult;
  };
  
  // KYC endpoints
  'GET /kyc/me': {
    request: {};
    response: KycRecord | null;
  };
  'POST /kyc/submit': {
    request: KycSubmissionData;
    response: KycRecord;
  };
  'POST /kyc/provider/:provider/initiate': {
    request: { redirectUrl: string };
    response: KycProviderSession;
  };
}

/**
 * Extract request/response types from endpoint definitions
 */
export type ApiRequest<T extends keyof ApiEndpoints> = ApiEndpoints[T]['request'];
export type ApiResponseType<T extends keyof ApiEndpoints> = ApiEndpoints[T]['response'];

/**
 * Type-safe API client method types
 */
export interface TypedApiClient {
  get<T extends keyof ApiEndpoints>(
    endpoint: T,
    params?: ApiRequest<T>
  ): Promise<ApiResponseType<T>>;
  
  post<T extends keyof ApiEndpoints>(
    endpoint: T,
    data: ApiRequest<T>
  ): Promise<ApiResponseType<T>>;
  
  put<T extends keyof ApiEndpoints>(
    endpoint: T,
    data: ApiRequest<T>
  ): Promise<ApiResponseType<T>>;
  
  delete<T extends keyof ApiEndpoints>(
    endpoint: T
  ): Promise<ApiResponseType<T>>;
}
```

## Testing Type Definitions

### 1. Type Testing Utilities
```typescript
/**
 * Type testing utilities for ensuring type correctness
 */
export type Expect<T extends true> = T;
export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
export type NotEqual<X, Y> = Equal<X, Y> extends true ? false : true;

// Example type tests
type TestUserInterface = Expect<Equal<
  keyof User,
  'id' | 'email' | 'firstName' | 'lastName' | 'fullName' | 'role' | 'avatar' | 'bio' | 'location' | 'website' | 'socialLinks' | 'createdAt' | 'updatedAt'
>>;

type TestKycStatus = Expect<Equal<
  KycStatus.VERIFIED,
  'VERIFIED'
>>;

type TestApiResponse = Expect<Equal<
  ApiResponse<User>['data'],
  User | undefined
>>;
```

### 2. Runtime Type Validation
```typescript
/**
 * Runtime validation schemas using Zod or similar
 */
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  fullName: z.string().optional(),
  role: z.enum(['user', 'admin', 'manager']),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
  socialLinks: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const KycRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.nativeEnum(KycStatus),
  provider: z.nativeEnum(KycProvider).optional(),
  documentType: z.string().optional(),
  country: z.string().length(2).optional(),
  submittedAt: z.string().datetime().optional(),
  verifiedAt: z.string().datetime().optional(),
  rejectedAt: z.string().datetime().optional(),
  rejectionReason: z.string().optional(),
  referenceId: z.string().optional(),
});

export const ApiResponseSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  message: z.string().optional(),
  error: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

// Type inference from schemas
export type UserSchemaType = z.infer<typeof UserSchema>;
export type KycRecordSchemaType = z.infer<typeof KycRecordSchema>;
```

## Migration and Deprecation Patterns

### 1. OAuth Transition Types
```typescript
/**
 * Legacy auth types with deprecation notices
 * @deprecated Password-based authentication is no longer supported
 * @see OAuth authentication flow
 * @since v2.0.0 OAuth-only architecture
 */
export interface LegacyLoginCredentials {
  email: string;
  /** @deprecated Use OAuth providers instead */
  password?: never; // Prevent usage at type level
}

/**
 * Migration helper types
 */
export interface AuthMigrationInfo {
  hasLegacyAccount: boolean;
  migrationRequired: boolean;
  supportedProviders: ('google' | 'azure')[];
  migrationDeadline?: string;
}

/**
 * Backward compatibility wrapper
 */
export type AuthCredentials = LoginCredentials; // Alias for smooth migration
```

### 2. Version-aware Types
```typescript
/**
 * API version types
 */
export type ApiVersion = 'v1' | 'v2';

export interface VersionedApiResponse<T = any> extends ApiResponse<T> {
  apiVersion: ApiVersion;
  deprecated?: boolean;
  migrationPath?: string;
}

/**
 * Feature flag types
 */
export interface FeatureFlags {
  oauthOnly: boolean;
  kycRequired: boolean;
  multiFactorAuth: boolean;
  socialProfiles: boolean;
}

export interface UserWithFeatures extends User {
  features: FeatureFlags;
}
```

## Performance and Optimization

### 1. Lazy Loading Types
```typescript
/**
 * Dynamic import types for code splitting
 */
export type LazyComponent<T = any> = () => Promise<{ default: T }>;

export interface LazyLoadedModule<T> {
  component: LazyComponent<T>;
  loading: boolean;
  error: Error | null;
}

/**
 * Chunked data loading types
 */
export interface ChunkedDataRequest {
  chunkSize: number;
  startIndex: number;
  endIndex?: number;
}

export interface ChunkedDataResponse<T> {
  items: T[];
  chunk: {
    index: number;
    size: number;
    total: number;
  };
  hasMore: boolean;
}
```

### 2. Memory-efficient Types
```typescript
/**
 * Reference types for large datasets
 */
export interface UserReference {
  id: string;
  email: string;
  displayName: string;
}

export interface KycReference {
  id: string;
  userId: string;
  status: KycStatus;
  verifiedAt?: string;
}

/**
 * Cached data types
 */
export interface CachedEntity<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

export interface CacheMetadata {
  size: number;
  hitRate: number;
  missRate: number;
  lastCleanup: number;
}
```

## Type Export Strategy

### 1. Module Exports
```typescript
// In index.ts - Comprehensive export strategy

// Core entity types
export type {
  User,
  UserRole,
  UserProfile,
  UserSettings,
  UserUpdate,
  UserSearchParams,
  UserSearchResult
} from './user.types';

export type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  TokenRefreshResponse
} from './auth.types';

export type {
  KycRecord,
  KycSubmissionData,
  KycProviderSession
} from './kyc.types';

// Enums
export { KycStatus, KycProvider } from './kyc.types';

// Utility types
export type {
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginatedApiResponse
} from './common.types';

// Component types
export type {
  BaseComponentProps,
  FormComponentProps,
  DataTableProps,
  TableColumn
} from './component.types';

// Event types
export type {
  UserEvents,
  AuthEvents,
  KycEvents,
  AccountsEvents
} from './event.types';
```

### 2. Type Re-exports for Convenience
```typescript
// In module's main index.ts
export type {
  // User types - most commonly used
  User,
  UserRole,
  UserProfile,
  
  // Auth types
  AuthResponse,
  LoginCredentials,
  
  // KYC types
  KycRecord,
  KycStatus,
  KycProvider,
  
  // API types
  ApiResponse
} from './types';

// Full types namespace for advanced usage
export * as AccountsTypes from './types';

// Usage examples:
// import { User, KycStatus } from '@/modules/accounts';
// import { AccountsTypes } from '@/modules/accounts';
// const user: AccountsTypes.User = ...;
```

## Best Practices Summary

### ✅ Do's
- Use strict TypeScript configuration with no implicit any
- Define comprehensive interfaces with proper JSDoc documentation
- Use enums for fixed sets of values (status, roles, providers)
- Separate create, update, and read interfaces appropriately
- Implement type guards for runtime type checking
- Use utility types for complex type transformations
- Maintain consistency with backend type definitions
- Provide proper deprecation notices for removed features
- Use branded types for IDs when type safety is critical
- Implement comprehensive error type definitions
- Use conditional types for complex API integrations
- Maintain proper import/export organization

### ❌ Don'ts
- Don't use `any` type unless absolutely necessary
- Don't make all interface properties optional
- Don't ignore TypeScript errors or use type assertions carelessly
- Don't define overly broad union types without constraints
- Don't duplicate type definitions across files
- Don't forget to update types when API contracts change
- Don't use hardcoded strings instead of enums or union types
- Don't neglect runtime validation for external data
- Don't create circular type dependencies
- Don't ignore backward compatibility when updating types
- Don't mix interface and type alias usage inconsistently
- Don't forget to export new types from the index file

## Migration Guidelines

### OAuth-Only Architecture
```typescript
// Remove password-related types completely
// Replace with clear error messages for legacy code

/**
 * Migration utility for detecting legacy auth usage
 */
export function detectLegacyAuthUsage(credentials: any): void {
  if ('password' in credentials) {
    throw new Error(
      'Password-based authentication is no longer supported. ' +
      'Please use OAuth authentication with Google or Azure.'
    );
  }
}

/**
 * Type-safe migration wrapper
 */
export function migrateAuthCredentials(
  legacyCredentials: any
): LoginCredentials {
  const { email } = legacyCredentials;
  
  if (!email) {
    throw new Error('Email is required for OAuth authentication');
  }
  
  return { email };
}
```

### Type Version Management
```typescript
/**
 * Version-aware type definitions
 */
export namespace AccountsTypesV1 {
  // Legacy types for backward compatibility
}

export namespace AccountsTypesV2 {
  // Current types with OAuth-only architecture
}

// Default export uses latest version
export * from './types'; // V2 types
```

---

*This instruction document ensures consistent, type-safe development within the Frontend Accounts Module while maintaining proper integration with backend services and supporting the OAuth-only authentication architecture.*
