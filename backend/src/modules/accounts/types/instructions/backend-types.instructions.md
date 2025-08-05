---
applyTo: `backend/src/modules/accounts/types/ , backend/src/modules/accounts/*.types.ts`
---

# `accounts/types` Folder — Development & Usage Guidelines

## 🏗️ MANDATORY BACKEND ARCHITECTURE - TYPES LAYER

Types are **Layer 7** in the mandatory 7-layer backend architecture:

**Route → Middleware → Validator → Controller → Services → Utils → 🎯 TYPES**

### ✅ Types Responsibilities (Layer 7)

The types layer provides **TypeScript type definitions and enums**:

- **Interface definitions** - structure for data objects
- **Enum declarations** - predefined value sets (roles, statuses, etc.)
- **DTO (Data Transfer Object) types** - input/output data shapes
- **API response types** - consistent response structures
- **Database model types** - Prisma-generated or custom entity types

### ❌ What Types Should NOT Contain

- **NO runtime logic** - types are compile-time only
- **NO functions or classes** - pure type definitions only
- **NO business rules** - logic belongs in services
- **NO validation** - validators handle data validation
- **NO side effects** - stateless type declarations only

### 🔄 Type Definition Pattern

```typescript
// ✅ Entity interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Enum definition
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MANAGER = 'manager'
}

// ✅ DTO types
export interface CreateUserDTO {
  email: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  bio?: string;
}

// ✅ API response types
export interface UserResponse {
  success: boolean;
  data: User;
}

export interface UsersListResponse {
  success: boolean;
  data: {
    users: User[];
    total: number;
    page: number;
    limit: number;
  };
}
```

### 📁 Domain-Specific Type Organization

Organize types into separate files based on domain functionality:

```
types/
├── user.types.ts    // User entities, DTOs, profiles
├── auth.types.ts    // Authentication, tokens, sessions
├── kyc.types.ts     // KYC data, statuses, verification
└── index.ts         // Barrel exports
```

### 🔄 Authentication Types Example

```typescript
// auth.types.ts
export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface OAuthProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  provider: OAuthProvider;
}

export enum OAuthProvider {
  GOOGLE = 'google',
  AZURE = 'azure'
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

### 🔄 KYC Types Example

```typescript
// kyc.types.ts
export enum KycStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export interface KycRecord {
  id: string;
  userId: string;
  status: KycStatus;
  provider: string;
  submittedAt: Date;
  approvedAt?: Date;
  metadata?: Record<string, any>;
}

export interface KycSubmissionDTO {
  documentType: string;
  documentNumber: string;
  country: string;
  metadata?: Record<string, any>;
}
```

### ✅ Architecture Compliance Rules

1. **Pure Types Only**: No runtime logic or implementations
2. **Domain Separation**: Keep auth/user/kyc types in separate files
3. **Explicit Exports**: Export all types for clarity
4. **Consistent Naming**: Use descriptive names (DTO, Response, etc.)
5. **Documentation**: Add JSDoc for complex types

### 🧪 Type Usage Best Practices

- **Domain-Specific Only**: Include only accounts-related types
- **Logical Grouping**: Organize by feature/subdomain
- **Clear Naming**: Use consistent conventions (CreateUserDTO, UserResponse)
- **No Business Logic**: Keep limited to type declarations only
- **Explicit Exports**: Export all types for maintainability

### 🔄 Integration with Other Layers

Types are used throughout the architecture:

- **Validators**: Generate schemas from types (Zod + TypeScript)
- **Controllers**: Type request/response data
- **Services**: Type business logic parameters and returns
- **Database**: Align with Prisma schema types
