# Backend Refactoring Plan

## Overview

This directory contains the refactored backend code following a feature-driven architecture. The refactoring aims to improve code organization, maintainability, and scalability by grouping related code by feature rather than technical role.

## Directory Structure

```
backend/
├── src/
│   ├── modules/           # Feature modules
│   │   ├── auth/          # Authentication module
│   │   ├── user/          # User management module
│   │   ├── client/        # Client module
│   │   ├── investor/      # Investor module
│   │   ├── property/      # Property module
│   │   ├── token/         # Token module
│   │   ├── investment/    # Investment module
│   │   ├── blockchain/    # Blockchain module
│   │   ├── visit/         # Visit module
│   │   └── kyc/           # KYC module
│   ├── middleware/        # Global middleware
│   ├── config/            # Configuration files
│   ├── prisma/            # Prisma client
│   ├── utils/             # Utility functions
│   ├── types/             # Global TypeScript types
│   ├── app.ts             # Express application setup
│   └── server.ts          # Server entry point
└── tests/                 # Tests directory
    ├── unit/              # Unit tests
    └── integration/       # Integration tests
```

## Module Structure

Each feature module follows a consistent structure:

```
module/
├── module.controller.ts   # HTTP request handlers
├── module.routes.ts       # Route definitions
├── module.service.ts      # Business logic
├── module.types.ts        # TypeScript interfaces and types
├── module.validators.ts   # Request validation schemas
└── index.ts              # Module exports
```

## Migration Plan

1. Create the new directory structure
2. Implement the auth module as an example
3. Gradually migrate other modules following the same pattern
4. Update the main app.ts to use the new module structure
5. Test each module after migration
6. Update import paths throughout the codebase

## Naming Conventions

- Files: Use kebab-case for file names (e.g., `auth.controller.ts`)
- Classes: Use PascalCase for class names (e.g., `AuthController`)
- Functions: Use camelCase for function names (e.g., `verifyToken`)
- Interfaces: Use PascalCase with a descriptive suffix (e.g., `UserDTO`)
- Constants: Use UPPER_SNAKE_CASE for constants (e.g., `MAX_LOGIN_ATTEMPTS`)

## Import Path Strategy

The tsconfig.json file includes path aliases to simplify imports:

```json
"paths": {
  "@/*": ["*"],
  "@modules/*": ["modules/*"],
  "@middleware/*": ["middleware/*"],
  "@config/*": ["config/*"],
  "@prisma/*": ["prisma/*"],
  "@utils/*": ["utils/*"],
  "@types/*": ["types/*"]
}
```

This allows for cleaner imports like:

```typescript
import { authService } from '@modules/auth/auth.service';
import { logger } from '@utils/logger';
```

## Next Steps

1. Continue migrating remaining modules
2. Update the main app.ts to use all new modules
3. Add comprehensive tests for each module
4. Update documentation