# Accounts Module

The Accounts module consolidates all user account-related functionality, including authentication, user management, and KYC (Know Your Customer) verification.

## Structure

The module follows a layered architecture:

```
accounts/
├── controllers/       # HTTP request handlers
│   ├── auth.controller.ts
│   ├── kyc.controller.ts
│   ├── performance.controller.ts
│   └── user.controller.ts
├── middleware/        # Express middleware
│   ├── auth.middleware.ts
│   ├── kyc.middleware.ts
│   ├── performance.middleware.ts
│   └── user.middleware.ts
├── routes/            # Express routes
│   ├── auth.routes.ts
│   ├── kyc.routes.ts
│   ├── performance.routes.ts
│   └── user.routes.ts
├── services/          # Business logic
│   ├── auth.service.ts
│   ├── kyc.service.ts
│   └── user.service.ts
├── types/             # TypeScript interfaces and types
│   ├── auth.types.ts
│   ├── kyc.types.ts
│   └── user.types.ts
├── utils/             # Utility functions
│   ├── performance-monitor.util.ts
│   └── response-formatter.ts
├── validators/        # Request validation schemas
│   └── kyc.validators.ts
├── index.ts           # Module exports
└── README.md          # This file
```

## Features

### Authentication

- OAuth authentication only (Google, Azure)
- Session-based authentication with Passport
- Role-based access control

### User Management

- CRUD operations for users
- User profile management
- Admin-only user operations

### KYC Verification

- KYC submission and verification
- Integration with KYC providers
- Admin KYC management
- KYC status checks

### Performance Monitoring

- Comprehensive performance tracking for all operations
- Categorized metrics (database reads/writes, authentication, external APIs, etc.)
- Performance statistics with percentiles
- Admin dashboard for monitoring system performance
- Automatic request timing for all API endpoints

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/health` | Health check for auth service | Public |
| POST | `/logout` | Log out the current user | Authenticated |
| POST | `/refresh` | Refresh the access token | Public (with refresh token) |
| GET | `/profile` | Get the current user's profile | Authenticated |
| POST | `/verify-token` | Verify a JWT token | Public |
| GET | `/google` | Initiate Google OAuth flow | Public |
| GET | `/google/callback` | Handle Google OAuth callback | Public |
| GET | `/azure` | Initiate Azure OAuth flow | Public |
| GET | `/azure/callback` | Handle Azure OAuth callback | Public |
| GET | `/error` | Handle OAuth errors | Public |

### User Routes (`/api/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/profile` | Get current user's profile | Authenticated |
| PATCH | `/profile` | Update current user's profile | Authenticated |
| GET | `/` | Get all users with pagination and filtering | Admin only |
| POST | `/` | Create a new user | Admin only |
| GET | `/:userId` | Get user by ID | Admin only |
| PATCH | `/:userId` | Update user | Admin only |
| DELETE | `/:userId` | Delete user | Admin only |

### KYC Routes (`/api/kyc`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/me` | Get current user's KYC status | Authenticated |
| POST | `/submit` | Submit KYC information | Authenticated |
| POST | `/provider/:provider/initiate` | Initiate verification with a KYC provider | Authenticated |
| GET | `/admin` | Get all KYC records | Admin only |
| PATCH | `/admin/:kycId` | Update KYC status | Admin only |

### Performance Routes (`/api/performance`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/metrics` | Get recent performance metrics | Admin only |
| GET | `/stats` | Get performance statistics | Admin only |
| GET | `/dashboard` | Get performance dashboard data | Admin only |
| GET | `/admin/:userId` | Get KYC record for a specific user | Admin only |
| PATCH | `/admin/:userId` | Update KYC status for a user | Admin only |
| POST | `/admin/:userId/sync` | Sync KYC status with provider | Admin only |

## Core Services

### Authentication Service (`auth.service.ts`)

| Method | Description |
|--------|-------------|
| `verifyToken(token: string)` | Verify JWT token and return user |
| `processOAuthLogin(profile: OAuthProfileDTO)` | Process OAuth login and return tokens |
| `logout(userId: string)` | Invalidate user's refresh tokens |

### User Service (`user.service.ts`)

| Method | Description |
|--------|-------------|
| `getUsers(page, limit, filters, sort)` | Get all users with pagination and filtering |
| `getUserById(userId: string)` | Get user by ID |
| `createUser(data: CreateUserDTO)` | Create a new user |
| `updateUser(userId: string, data: UpdateUserDTO)` | Update user |
| `deleteUser(userId: string)` | Delete user (soft delete) |

### KYC Service (`kyc.service.ts`)

| Method | Description |
|--------|-------------|
| `getByUserId(userId: string)` | Get KYC record for a user |
| `submitKyc(userId: string, data: KycSubmissionData)` | Submit or update KYC information |
| `updateKycStatus(userId: string, data: KycUpdateData)` | Update KYC status |
| `getAllKycRecords(page, limit, filters)` | Get all KYC records with pagination |
| `isKycVerified(userId: string)` | Check if a user has verified KYC |
| `initiateProviderVerification(userId, provider)` | Initiate verification with a KYC provider |
| `syncKycStatus(userId: string)` | Sync KYC status with provider |

## Middleware

### Authentication Middleware (`auth.middleware.ts`)

| Middleware | Description |
|------------|-------------|
| `authGuard` | Verifies JWT token and attaches user to request |
| `roleGuard(roles: string[])` | Ensures user has required role(s) |

### KYC Middleware (`kyc.middleware.ts`)

| Middleware | Description |
|------------|-------------|
| `requireKycVerified` | Ensures user has verified KYC status |

## Usage

### Initialization

```typescript
import { initAccountsModule } from './modules/accounts';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const accountsModule = initAccountsModule(prisma);

// Use the combined router
app.use('/api', accountsModule.router);

// Or use individual routers
app.use('/api/auth', accountsModule.authRouter);
app.use('/api/users', accountsModule.userRouter);
app.use('/api/kyc', accountsModule.kycRouter);
```

### Authentication Middleware

```typescript
import { authGuard, roleGuard } from './modules/accounts';
import { UserRole } from './modules/accounts';

// Protect a route with authentication
app.get('/protected', authGuard, (req, res) => {
  res.json({ message: 'Protected route' });
});

// Protect a route with role-based access control
app.get('/admin-only', authGuard, roleGuard(UserRole.ADMIN), (req, res) => {
  res.json({ message: 'Admin only route' });
});
```

### KYC Middleware

```typescript
import { requireKycVerified } from './modules/accounts';

// Require KYC verification for a route
app.get('/kyc-required', authGuard, requireKycVerified, (req, res) => {
  res.json({ message: 'KYC verified route' });
});
```

## Direct Service Access

You can also access the services directly for use in other modules:

```typescript
import { authService, userService, kycService } from './modules/accounts';

```// Example: Check if a user has verified KYC
async function checkUserKyc(userId: string) {
  const isVerified = await kycService.isKycVerified(userId);
  return isVerified;
}
```

## Error Handling

All services and controllers in the Accounts module use a consistent error handling approach:

- Services throw typed errors with appropriate messages
- Controllers catch these errors and format them into standardized HTTP responses
- HTTP status codes are used appropriately (400 for validation errors, 401 for authentication errors, etc.)

## Security Considerations

- All authentication is OAuth-based (Google, Azure) - no password authentication
- JWT tokens are stored in HTTP-only cookies to prevent XSS attacks
- Role-based access control is enforced for all admin operations
- Input validation is performed using Zod schemas
- KYC verification is required for sensitive operations

## Integration with Other Modules

The Accounts module is designed to be integrated with other modules in the application:

- The `authGuard` middleware can be used to protect routes in other modules
- The `roleGuard` middleware can be used to enforce role-based access control
- The `requireKycVerified` middleware can be used to ensure users have completed KYC
- The services can be imported and used directly in other modules

## Performance Monitoring

The Accounts module includes a comprehensive performance monitoring system that can be used across the application.

### Operation Categories

Performance metrics are categorized for better analysis:

```typescript
enum OperationCategory {
  DATABASE_READ = 'database_read',
  DATABASE_WRITE = 'database_write',
  AUTHENTICATION = 'authentication',
  EXTERNAL_API = 'external_api',
  FILE_OPERATION = 'file_operation',
  COMPUTATION = 'computation',
  REQUEST_HANDLING = 'request_handling'
}
```

### Measuring Performance

Use the `measurePerformance` utility to track the performance of any operation:

```typescript
import { measurePerformance, OperationCategory } from '../utils/performance-monitor.util';

// Example: Measure the performance of a database query
async function getUserById(userId: string) {
  return await measurePerformance(
    'getUserById', // Operation name
    OperationCategory.DATABASE_READ, // Category
    async () => {
      // The operation to measure
      return await prisma.user.findUnique({ where: { id: userId } });
    },
    { userId } // Optional metadata
  );
}
```

### Automatic Request Timing

All API requests are automatically timed using the `performanceMonitorMiddleware`. This middleware is applied globally in `app.ts`.

### Viewing Performance Metrics

Administrators can view performance metrics through the following API endpoints:

- `GET /api/performance/metrics` - Recent performance metrics
- `GET /api/performance/stats` - Performance statistics
- `GET /api/performance/dashboard` - Performance dashboard data

### Performance Thresholds

Operations are categorized by duration:

```typescript
enum PerformanceThreshold {
  FAST = 100,    // < 100ms
  MEDIUM = 300,  // 100-300ms
  SLOW = 500,    // 300-500ms
  VERY_SLOW = 1000 // > 1000ms
}
```

Slow operations are automatically logged with appropriate severity levels.

