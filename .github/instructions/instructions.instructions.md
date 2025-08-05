---
applyTo: '**/*.ts'
---



# Backend and Frontend Instructions
The folder named "backend" is the backend folder.
For the backend express.js is used.
For the database PostgreSQL is used.
The database is named "tokenizer_dev".
The database is hosted on localhost.
The database is port 5432.
Prisma is used for communication with the database
The backend test server is http://localhost:3000
---
applyTo: '**/*.ts'
---

# 🚀 **Backend Development Instructions - Comprehensive Guide**

## 📋 **Project Overview & Technology Stack**

### **Core Technologies**
- **Runtime**: Node.js with TypeScript 5.8.3
- **Framework**: Express.js 5.1.0 
- **Database**: PostgreSQL (localhost:5432, database: `tokenizer_dev`)
- **ORM**: Prisma 6.11.1 with @prisma/client@6.11.1
- **Validation**: Zod 4.0.5 for all input validation and sanitization
- **Authentication**: OAuth 2.0 (Google & Azure) with JWT tokens
- **Error Handling**: http-errors package for standardized HTTP errors
- **Testing**: Supertest for API testing, Jest for unit tests
- **Development Server**: http://localhost:3000

### **Current Package Dependencies**
```json
{
  "dependencies": {
    "@prisma/client": "6.11.1",
    "cookie-parser": "1.4.7",
    "dotenv": "17.2.0",
    "ethers": "6.15.0",
    "express": "5.1.0",
    "express-session": "1.18.1",
    "hardhat": "2.26.0",
    "http-errors": "^2.0.0",
    "jsonwebtoken": "9.0.2",
    "multer": "2.0.2",
    "node-fetch": "3.3.2",
    "passport": "0.7.0",
    "passport-apple": "2.0.2",
    "passport-azure-ad": "4.3.5",
    "passport-google-oauth20": "2.0.0",
    "prisma": "6.11.1",
    "zod": "4.0.5"
  },
  "devDependencies": {
    "@types/cookie-parser": "1.4.9",
    "@types/express": "5.0.3",
    "@types/jsonwebtoken": "9.0.10",
    "@types/multer": "2.0.0",
    "@types/node": "24.0.13",
    "@types/passport": "1.0.17",
    "@types/passport-google-oauth20": "2.0.16",
    "@types/pino": "7.0.4",
    "@typescript-eslint/eslint-plugin": "8.37.0",
    "@typescript-eslint/parser": "8.37.0",
    "eslint": "9.31.0",
    "ts-node-dev": "2.0.0",
    "typescript": "5.8.3"
  }
}
```

---

## 🏗️ **Architecture & Project Structure**

### **Modular Architecture Pattern**
```
backend/
├── src/
│   ├── modules/                    # Feature-based modules
│   │   ├── accounts/              # User management & authentication
│   │   │   ├── controllers/       # HTTP request/response handling
│   │   │   ├── services/          # Business logic layer
│   │   │   ├── middleware/        # Route-specific middleware
│   │   │   ├── routes/            # Express route definitions
│   │   │   ├── validators/        # Zod validation schemas
│   │   │   ├── types/             # TypeScript interfaces & DTOs
│   │   │   ├── utils/             # Module-specific utilities
│   │   │   ├── strategies/        # OAuth strategy implementations
│   │   │   ├── constants/         # Module constants
│   │   │   ├── test/              # Module-specific tests
│   │   │   ├── test-utils/        # Test utilities & factories
│   │   │   └── index.ts           # Module barrel exports
│   │   ├── projects/              # Project management
│   │   ├── investments/           # Investment tracking
│   │   ├── blockchain/            # Blockchain interactions
│   │   ├── analytics/             # Analytics & reporting
│   │   └── documents/             # Document management
│   ├── middleware/                # Global middleware
│   ├── utils/                     # Global utilities
│   ├── config/                    # Configuration files
│   ├── prisma/                    # Prisma client & utilities
│   └── tmp/                       # Temporary files (auto-cleaned)
├── prisma/                        # Prisma schema & migrations
│   ├── schema.prisma              # Database schema definition
│   ├── migrations/                # Database migration files
│   ├── seed.ts                    # Database seeding script
│   └── modules/                   # Prisma extensions
├── app.ts                         # Express app configuration
├── server.ts                      # Server startup & lifecycle
└── .env                          # Environment variables
```

### **Layer Responsibilities**

#### **1. Routes Layer** (`routes/`)
- **Purpose**: Define HTTP endpoints and apply middleware
- **Responsibilities**: Path mapping, middleware application, parameter extraction
- **Rules**: 
  - No business logic
  - Import controllers and middleware only
  - Use descriptive route names
  - Apply authentication/authorization middleware

```typescript
// Example: accounts/routes/auth.routes.ts
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/login/google', authController.googleLogin);
router.get('/profile', requireAuth, authController.getProfile);
router.post('/logout', requireAuth, authController.logout);

export { router as authRouter };
```

#### **2. Controllers Layer** (`controllers/`)
- **Purpose**: Handle HTTP requests and responses
- **Responsibilities**: Input validation, service orchestration, response formatting
- **Rules**:
  - Always validate input with Zod schemas
  - Delegate business logic to services
  - Return consistent response formats
  - Handle errors gracefully with http-errors

```typescript
// Example: Controller pattern
export class AuthController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getUserById(req.user.id);
      const userDTO = sanitizeUserResponse(user);
      
      res.status(200).json({
        success: true,
        data: userDTO,
        message: 'Profile retrieved successfully'
      });
    } catch (error) {
      next(createError(500, 'Failed to retrieve profile'));
    }
  }
}
```

#### **3. Services Layer** (`services/`)
- **Purpose**: Implement business logic and data operations
- **Responsibilities**: Business rules, database operations, external API calls
- **Rules**:
  - Single responsibility principle
  - Transaction management for complex operations
  - Input validation and sanitization
  - Error handling with meaningful messages

```typescript
// Example: Service pattern
export class AuthService {
  async createUser(userData: CreateUserDTO): Promise<UserDTO> {
    // Validate business rules
    await this.validateUserCreation(userData);
    
    // Database transaction for complex operations
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({ data: userData });
      await tx.auditLog.create({
        action: 'USER_CREATED',
        userId: newUser.id,
        metadata: { email: userData.email }
      });
      return newUser;
    });
    
    return this.sanitizeUser(user);
  }
}
```

#### **4. Validators Layer** (`validators/`)
- **Purpose**: Define input validation schemas using Zod
- **Responsibilities**: Request validation, data transformation, error formatting
- **Rules**:
  - Comprehensive validation for all inputs
  - Transform and sanitize data
  - Provide user-friendly error messages
  - Reusable validation schemas

```typescript
// Example: Validation schemas
export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  role: z.enum(['INVESTOR', 'CLIENT', 'ADMIN']).default('INVESTOR')
}).strict();

export const GetUserParamsSchema = z.object({
  userId: z.string().uuid('Invalid user ID format')
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type GetUserParams = z.infer<typeof GetUserParamsSchema>;
```

#### **5. Types Layer** (`types/`)
- **Purpose**: Define TypeScript interfaces and DTOs
- **Responsibilities**: Type safety, API contracts, data structures
- **Rules**:
  - Separate input/output types
  - Use descriptive naming conventions
  - Include JSDoc documentation for complex types

```typescript
// Example: Type definitions
export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface CreateUserDTO {
  email: string;
  fullName: string;
  role?: UserRole;
}

export interface AuthResponseDTO {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

### **Module Structure Requirements**
Every module must contain the following folders:
- **`controllers/`**: HTTP request/response handling
- **`services/`**: Business logic + Prisma queries
- **`validators/`**: Zod schemas for body/params/query
- **`types/`**: DTOs and shared interfaces
- **`utils/`**: Mappers, helpers, adapters
- **`constants/`**: Hardcoded values (never environment variables)
- **`test/`**: Test files for the module
- **`test-utils/`**: Test utilities and factories

### **Naming Conventions**
- **Methods**: `createUser`, `getPropertyById`, `updateUserProfile`
- **DTOs**: `CreateUserDto`, `UserResponseDto`, `UpdatePropertyDto`
- **Schemas**: `CreateUserSchema`, `GetUserParamsSchema`, `UpdatePropertyBodySchema`
- **Files**: `user.controller.ts`, `auth.service.ts`, `kyc.validator.ts`

---

## 📁 **Critical File Management Rules**

### **Environment Variables (.env)**
- **Location**: `backend/.env` (never commit to version control)
- **Loading**: Must be loaded at the top of `app.ts` before any other imports
- **Storage**: All environment variables and secrets must be stored in `.env`
- **Access**: All environment variables must be loaded from `.env`
- **Validation**: Validate required environment variables at startup

```typescript
// Example: Environment validation at startup
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string()
});

const env = envSchema.parse(process.env);
```

### **App.ts File Rules**
- **Location**: Must be at `backend/app.ts`
- **Purpose**: Define Express application without starting server
- **First Import**: Must enable async error propagation via `express-async-errors`
- **Environment Loading**: Load all environment variables before any other code
- **Single Instance**: Express app instantiated exactly once
- **Required Middleware Order**:
  1. Security middleware (helmet, CORS, compression)
  2. Request logging (morgan)
  3. Body parsing (JSON, URL-encoded)
  4. Global authentication/session middleware
  5. Feature routers
  6. Health check endpoint
  7. 404 handler
  8. Global error handler
- **Restrictions**:
  - No database connections
  - No server listeners
  - No inline route handlers
  - No hard-coded secrets
  - Use path aliases, avoid deep relative paths

### **Temporary Files Policy**
- **Location**: `backend/src/tmp/` for all temporary files
- **Purpose**: Testing purposes only
- **Cleanup**: Delete all files after each test
- **No Backups**: Never create backups before deletion
- **Security**: Ensure temporary files don't contain sensitive data

---

## 🗄️ **Database & Prisma Integration**

### **Prisma Directory Structure (CRITICAL - DO NOT MODIFY)**
```
/backend/prisma/                   # Prisma CLI workspace (ESSENTIAL)
├── schema.prisma                  # Database schema (REQUIRED PATH)
├── migrations/                    # Migration history (NEVER MODIFY MANUALLY)
├── seed.ts                       # Database seeding script
└── modules/                      # Schema extensions only

/backend/src/prisma/              # Application-level utilities (ESSENTIAL)
├── client.ts                     # PrismaClient singleton with logging
└── utils/                       # Database helper utilities
```

### **PRISMA RULES (STRICTLY ENFORCED)**
- The `/backend/prisma/` directory is **ESSENTIAL** and must never be removed
- The `/backend/prisma/schema.prisma` file defines the core database schema for Prisma CLI
- The `/backend/prisma/migrations/` directory stores all migration files - **NEVER DELETE MANUALLY**
- The `/backend/prisma/seed.ts` script seeds the database with initial data
- The `/backend/src/prisma/` directory houses application-specific database utilities
- The `/backend/src/prisma/client.ts` file exports the PrismaClient singleton
- All services and controllers **MUST** import Prisma client from `/backend/src/prisma/client.ts`
- Migration files are versioned and **MUST NOT** be deleted manually
- The division between root `prisma/` (schema/migrations) and `src/prisma/` (client/config) **MUST BE MAINTAINED**
- Any schema changes **MUST** be accompanied by a corresponding migration
- Both directories **MUST** be tracked in Git

### **Database Best Practices**
1. **Schema Management**: Always use migrations for schema changes
2. **Query Optimization**: Use `select` and `include` for efficient queries
3. **Transaction Management**: Use transactions for complex operations
4. **Connection Pooling**: Configure appropriate connection limits
5. **Migration Safety**: Never manually edit migration files

```typescript
// Example: Efficient Prisma queries
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    fullName: true,
    role: true,
    createdAt: true
  },
  where: { role: 'INVESTOR' },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: offset
});
```

---

## 🛡️ **Security & Authentication**

### **Authentication Requirements**
- **OAuth 2.0 Only**: Google OAuth 2.0 and Azure AD
- **Token Strategy**: JWT tokens stored in HTTP-only cookies
- **Route Protection**: Always apply `requireAuth` middleware on protected routes
- **Role-Based Access**: Use `requireRole('<ROLE>')` for role gating
- **Client Trust**: Never trust client-supplied IDs or data

### **Authorization Patterns**
```typescript
// Authentication middleware usage
router.get('/protected', requireAuth, controller.method);
router.post('/admin-only', requireRole('ADMIN'), controller.method);
router.patch('/user/:id', requireSelfAccess('id'), controller.method);
```

### **Security Best Practices**
1. **Input Validation**: Rigorously validate every input with Zod
2. **Field Rejection**: Reject extra fields in requests
3. **Output Sanitization**: Never expose sensitive data in responses
4. **Error Handling**: Generic error messages to prevent information leakage
5. **Audit Logging**: Record security-sensitive actions
6. **Rate Limiting**: Prevent abuse with request throttling

---

## 📊 **Error Handling & Response Standards**

### **Structured Error Format**
```typescript
// Error Response Structure
{
  success: false,
  error: {
    statusCode: number,
    errorCode: string,
    message: string,
    details?: any
  },
  timestamp: string,
  requestId: string
}

// Success Response Structure
{
  success: true,
  data: any,
  message: string,
  meta?: {
    pagination?: PaginationMeta,
    timestamp: string
  }
}
```

### **HTTP Status Code Standards**
- **200**: Successful GET, PATCH, PUT operations
- **201**: Successful POST (resource created)
- **204**: Successful DELETE (no content)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (uniqueness violations)
- **422**: Unprocessable Entity (business logic errors)
- **500**: Internal Server Error (unexpected errors)

### **Error Handling Requirements**
- All HTTP errors **MUST** be handled by the `http-errors` package
- Use structured error responses for consistency
- Log errors with appropriate severity levels
- Never expose internal system details in error messages

---

## 🧪 **Testing Strategy & Requirements**

### **Testing Architecture**
```
backend/src/modules/<module>/test/
├── unit/                         # Unit tests for services/utilities
├── integration/                  # API endpoint tests
└── e2e/                         # End-to-end workflow tests

backend/src/modules/<module>/test-utils/
├── setup.ts                     # Test environment setup
├── teardown.ts                  # Test cleanup
├── factories.ts                 # Test data factories
├── mocks.ts                    # Service/dependency mocks
└── constants.ts                # Test constants
```

### **Testing Requirements**
- **Unit Tests**: Write tests for every public method
- **Integration Tests**: Use `supertest` for API endpoint testing
- **Mocking**: Mock dependencies with appropriate tools
- **Edge Cases**: Test error scenarios and edge cases
- **Coverage**: Aim for >80% code coverage
- **Test Utils**: Dedicated test utilities in `test-utils/` folder

```typescript
// Example: Integration test pattern
describe('POST /api/auth/login', () => {
  it('should authenticate user with valid Google OAuth', async () => {
    const mockUser = userFactory.build();
    jest.spyOn(authService, 'processOAuthLogin').mockResolvedValue(mockUser);
    
    const response = await request(app)
      .post('/api/auth/login/google')
      .send({ accessToken: 'valid-token' })
      .expect(200);
      
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(mockUser.email);
  });
});
```

---

## 🔍 **Code Quality & Debugging**

### **ESLint Requirements (MANDATORY)**
- **Must** run ESLint with `@typescript-eslint/parser` and plugin on all TypeScript files
- Address **ALL** lint errors before any debugging or fixes
- Fix type mistakes, unused variables, and style violations as part of debugging process
- ESLint configuration must be maintained and enforced

### **Code Quality Standards**
1. **Type Safety**: Strict TypeScript configuration with no implicit any
2. **Code Formatting**: Consistent formatting with Prettier
3. **Pre-commit Hooks**: Run linting and tests before commits
4. **Code Reviews**: All changes require peer review

---

## 📈 **Performance & Scalability**

### **Database Optimization**
1. **Selective Queries**: Always use `select`/`include` to fetch only needed fields
2. **Pagination**: Use `take`/`skip` or cursor-based pagination for list endpoints
3. **Indexing**: Create appropriate database indexes for query performance
4. **Connection Pooling**: Configure Prisma connection pool limits

### **Caching & Performance**
1. **Application-Level**: Cache frequently accessed data
2. **Database-Level**: Use Prisma query result caching
3. **HTTP-Level**: Implement appropriate cache headers
4. **Session Caching**: Cache authentication tokens for performance

---

## 🏛️ **Architecture Patterns**

### **Data Transfer Layer**
- **DTO Pattern**: Never return raw Prisma models—map to DTOs exposing only safe fields
- **Input/Output Separation**: Separate DTOs for input validation and output formatting
- **Field Selection**: Always specify which fields to return in responses

### **Adapter Patterns**
- **Third-Party Integrations**: Abstract external services (storage, KYC, email) behind interfaces
- **Configuration Management**: Read credentials, URLs, feature flags from `process.env`
- **Startup Validation**: Validate all configuration at application startup

### **Extensibility & Future-Proofing**
- **Interface-Driven Design**: Use interfaces for external dependencies
- **Dependency Injection**: Services should be injectable for testing
- **Modular Architecture**: Keep modules loosely coupled and highly cohesive

---

## 📚 **Documentation & Monitoring**

### **Documentation Requirements**
- **JSDoc/TSDoc**: Document all public methods and DTOs
- **Module README**: Include README for non-trivial modules
- **API Documentation**: Maintain OpenAPI/Swagger specifications
- **Architecture Decisions**: Document significant architectural choices

### **Logging & Monitoring**
- **Structured Logging**: Use Pino (JSON format) for all logging
- **Request Logging**: Log method, path, userId for all requests
- **Error Logging**: Comprehensive error logging with context
- **Audit Hooks**: Record security-sensitive actions in Audit Log Module

```typescript
// Example: Structured logging pattern
logger.info('User authentication attempt', {
  userId: user.id,
  email: user.email,
  provider: 'google',
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  timestamp: new Date().toISOString()
});
```

---

## ✅ **Development Checklist**

### **Pre-Development**
- [ ] Define database schema changes in `schema.prisma`
- [ ] Create and run Prisma migrations
- [ ] Define TypeScript interfaces and DTOs
- [ ] Plan security and authentication requirements

### **Development**
- [ ] Implement Zod validation schemas with comprehensive validation
- [ ] Create service layer with business logic and error handling
- [ ] Implement controllers with proper HTTP response formatting
- [ ] Add authentication/authorization middleware where required
- [ ] Define routes with appropriate middleware application

### **Testing & Quality**
- [ ] Write unit tests for all services and utilities
- [ ] Create integration tests for all API endpoints
- [ ] Test error scenarios and edge cases thoroughly
- [ ] Verify security and authorization mechanisms
- [ ] Run ESLint and fix ALL issues before proceeding

### **Documentation & Deployment**
- [ ] Add JSDoc comments to all public methods
- [ ] Update API documentation and module README
- [ ] Validate TypeScript compilation with no errors
- [ ] Check code coverage meets minimum standards
- [ ] Review security implications and error handling

This comprehensive backend instruction set ensures consistent, secure, and maintainable development following industry best practices and established architecture patterns.
Save all files temporarly created for testing purposes in the backend\src\tmp folder
Delete all files in the backend\src\tmp folder after each test
Do not make backups of files before you delete them.
Validation and Sanitization must be done by Zod 4.0.5
The backend is using Zod 4.0.5 for validation and sanitization.
The backend is using Prisma 6.11.1 for database communication.
All http errors must be handled by http-errors package.

### ENV FILE Rules
The .env file is located at backend\.env
All enviremonet varibale and secrets must be stored in the .env file.
All enviremonet varibale and secrets must be loaded from the .env file.


### APP.ts FILE Rules
The app.ts file must be located at backend\app.ts
The app.ts file defines the Express application without starting or listening on a port.
The first import in app.ts must enable async error propagation via express-async-errors.
All environment variables must be loaded at the top of app.ts before any other code executes.
The Express app must be instantiated exactly once in app.ts and assigned to a single variable.
Security middleware must be included in app.ts, specifically helmet, CORS configured with the frontend origin, and response compression.
The request-logging middleware morgan should be configured in app.ts.
Body-parsing middleware for JSON and URL-encoded payloads must be applied in app.ts.
Global authentication or session middleware must be mounted in app.ts after body parsing but before feature routers.
All feature routers (accounts, projects, investments, blockchain, analytics) must be imported and mounted under their respective base paths in app.ts.
A health-check endpoint must be defined in app.ts to respond with service status.
A catch-all 404 “Route not found” handler must be registered immediately after all routers in app.ts.
The global error-handling middleware must be the final middleware registered in app.ts.
No database connection, listener, or I/O operations should occur in app.ts.
app.ts must not call listen, createServer, or any network-binding functions.
The only export from app.ts must be the configured Express app object.
app.ts must not contain inline route handlers; all routes must be defined in separate router modules.
Feature flags or analytics initialization must not be performed in app.ts—those belong in their own modules.
app.ts must not perform graceful-shutdown logic; shutdown hooks belong in the server entrypoint.
No hard-coded secrets or environment-specific URLs should appear in app.ts.
app.ts must use path aliases or absolute imports to reference internal modules, avoiding deep relative paths.

### PRISMA Rules
* The `/backend/prisma/` directory is essential and must be kept.
* The `/backend/prisma/schema.prisma` file defines the core database schema for Prisma CLI.
* The `/backend/prisma/migrations/` directory stores all migration files that track schema changes over time.
* The `/backend/prisma/seed.ts` script seeds the database with initial data and must remain in place.
* The `/backend/prisma/modules/` folder contains additional Prisma-related modules and type definitions.
* The `/backend/src/prisma/` directory is essential and must be kept.
* The `/backend/src/prisma/client.ts` file exports the application-level PrismaClient singleton with logging configuration.
* The root `/backend/prisma/` directory is the standard location that Prisma CLI commands rely on for schema management.
* Removing the `/backend/prisma/` directory will break `prisma migrate`, `prisma generate`, and seeding functionality.
* The `/backend/src/prisma/` directory houses application-specific database utilities and must not be removed.
* All services and controllers must import the Prisma client from `/backend/src/prisma/client.ts`.
* The `/backend/prisma/schema.prisma` path must not be modified; it is required for Prisma CLI compatibility.
* Migration files under `/backend/prisma/migrations/` must be versioned and never deleted manually.
* The `seed.ts` script in `/backend/prisma/` must reference the Prisma client from the `/backend/src/prisma/` directory.
* The `/backend/prisma/modules/` folder should only contain files that augment or extend the Prisma schema.
* The `/backend/src/prisma/` folder should only contain the client singleton and helper utilities.
* Both `/backend/prisma/` and `/backend/src/prisma/` must be tracked in Git and excluded from `.gitignore`.
* No other files or folders should be placed under `/backend/prisma/` or `/backend/src/prisma/` without explicit necessity.
* The division between the root `prisma/` (schema/migrations) and `src/prisma/` (client/config) must be maintained.
* Any changes to the Prisma schema must be accompanied by a corresponding migration in `/backend/prisma/migrations/`.
* The `/backend/prisma/seed.ts` script must be used to seed the database with initial data.
* The `/backend/prisma/migrations/` directory must not be manually modified without using Prisma CLI.
* The `/backend/prisma/modules/` folder should only contain files that augment or extend the Prisma schema.
* The `/backend/src/prisma/` folder should only contain the client singleton and helper utilities.
* All services and controllers must import the Prisma client from `/backend/src/prisma/client.ts`.
* The `/backend/prisma/schema.prisma` path must not be modified; it is required for Prisma CLI compatibility.


















##### FRONTEND #####

The folder named "frontend" is the frontend folder.
In the frontend folder, Vue.js is used.
The frontend test server is http://localhost:5173
All communication between frontend and backend must happen trough the Standadized API Client. 
All styling must be done by tailwindcss.
Only oAuth 2.0 login will be possible.
No password reset will be possible.

