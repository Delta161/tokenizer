# Accounts Module

The Accounts module consolidates all user account-related functionality, including authentication, user management, and KYC (Know Your Customer) verification.

## Structure

The module follows a layered architecture:

```
accounts/
├── controllers/       # HTTP request handlers
│   ├── auth.controller.ts
│   ├── kyc.controller.ts
│   └── user.controller.ts
├── middleware/        # Express middleware
│   ├── auth.middleware.ts
│   └── kyc.middleware.ts
├── routes/            # Express routes
│   ├── auth.routes.ts
│   ├── kyc.routes.ts
│   └── user.routes.ts
├── services/          # Business logic
│   ├── auth.service.ts
│   ├── kyc.service.ts
│   └── user.service.ts
├── types/             # TypeScript interfaces and types
│   ├── auth.types.ts
│   ├── kyc.types.ts
│   └── user.types.ts
├── validators/        # Request validation schemas
│   └── kyc.validators.ts
├── index.ts           # Module exports
└── README.md          # This file
```

## Features

### Authentication

- OAuth authentication only (Google, Azure)
- JWT-based authentication with refresh tokens
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

// Example: Check if a user has verified KYC
async function checkUserKyc(userId: string) {
  const isVerified = await kycService.isKycVerified(userId);
  return isVerified;
}
```