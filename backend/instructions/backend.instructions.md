---
applyTo: 'backend/'
---

# Backend Instructions

## 🎯 Overview

This Express.js + TypeScript + PostgreSQL + Prisma backend implements session-based authentication with OAuth providers (Google, Microsoft, Apple) and follows a strict 7-layer modular architecture for scalability, maintainability, and testability.

## 📁 **Modules Architecture Overview**

The backend is organized into 6 core modules, each handling a specific domain with complete separation of concerns:

### **🔍 Core Modules:**

#### **📋 accounts** - *Authentication & User Management*
```
accounts/
├── controllers/     # Auth, User, KYC controllers
├── middleware/      # Auth, User, KYC middleware  
├── routes/          # API endpoints for authentication
├── services/        # Auth, User, KYC business logic
├── strategies/      # OAuth strategies (Google, Microsoft, Apple)
├── types/           # TypeScript interfaces and DTOs
├── utils/           # Validation and helper utilities
└── validators/      # Zod validation schemas
```
**Core Functions:** OAuth authentication, Session management, User CRUD, KYC verification, Role-based access control

#### **⚙️ admin** - *Administrative Dashboard*
```
admin/
├── controllers/     # Admin operations and analytics
├── routes/          # Admin API endpoints
├── services/        # Admin business logic
├── types/           # Admin-specific types
└── validators/      # Admin validation schemas
```
**Core Functions:** User management, System analytics, Content moderation, Administrative dashboard

#### **💰 investor** - *Investment Management*
```
investor/
├── controllers/     # Investment operations
├── routes/          # Investor API endpoints  
├── services/        # Investment business logic
├── types/           # Investment-related types
└── validators/      # Investment validation
```
**Core Functions:** Portfolio management, Investment tracking, Analytics, Transaction history

#### **🔔 notifications** - *Communication System*
```
notifications/
├── controllers/     # Notification management
├── routes/          # Notification API endpoints
├── services/        # Notification delivery logic
├── types/           # Notification types and interfaces
└── validators/      # Notification validation schemas
```
**Core Functions:** Real-time notifications, Email delivery, Preferences, Broadcast messaging

#### **🏢 projects** - *Project Management*
```
projects/
├── controllers/     # Project CRUD operations
├── routes/          # Project API endpoints
├── services/        # Project business logic
├── types/           # Project-related types
└── validators/      # Project validation schemas
```
**Core Functions:** Project creation/management, Listings/search, Analytics, Ownership management

#### **🪙 token** - *Blockchain Integration*
```
token/
├── controllers/     # Token operations
├── routes/          # Token API endpoints
├── services/        # Blockchain interaction logic
├── types/           # Token and blockchain types
└── validators/      # Token validation schemas
```
**Core Functions:** Token minting/burning, Transfers, Blockchain integration, Token analytics

### **🔗 Module Dependencies (Mandatory Flow):**
```
accounts (Core) ← admin, investor, projects, notifications, token
admin ← notifications (for admin alerts)
investor ← projects (for investments), notifications (for updates)
projects ← token (for tokenization)
token ← notifications (for transaction alerts)
```

### **📊 Module Completeness Standards:**
- **accounts**: 95% complete ✅ (Core authentication system)
- **admin**: 85% complete ✅ (Administrative functions)
- **projects**: 90% complete ✅ (Project management)
- **investor**: 80% complete ⚠️ (Investment features)
- **notifications**: 75% complete ⚠️ (Communication system)
- **token**: 70% complete ⚠️ (Blockchain integration)

### **🚀 API Standards:**
- All modules follow `/api/{module-name}/*` pattern
- Authentication middleware applied where needed
- Role-based access control implemented
- Proper error handling and validation
- Clean separation of concerns maintained

**⚠️ MANDATORY:** All new features must follow this modular architecture. Cross-module communication must go through well-defined APIs only.

## 🏗️ MANDATORY 7-LAYER ARCHITECTURE

All backend code MUST follow this strict layered architecture pattern:

### 🔸 Layer 1: Routes
**Purpose**: Define API endpoints and map HTTP methods to controllers
- ✅ Connect URL + HTTP method to controller functions
- ✅ Apply middleware and validators in proper order
- ❌ NO business logic, validation, or database access

```typescript
// routes/auth.routes.ts
router.post('/login', validateLoginData, authController.initiateOAuth);
router.get('/callback', authController.handleOAuthCallback);
```

### 🔸 Layer 2: Middleware
**Purpose**: Pre-route processing for cross-cutting concerns
- ✅ Authentication checks and user context attachment
- ✅ Authorization enforcement and role-based access
- ✅ Rate limiting, logging, input sanitization
- ❌ NO business logic or direct database operations

```typescript
// middleware/session.middleware.ts
export const sessionGuard = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};
```

### 🔸 Layer 3: Validators
**Purpose**: Request data validation and sanitization using Zod schemas
- ✅ Data format validation and type checking
- ✅ Required field verification and constraints
- ✅ Input sanitization and normalization
- ❌ NO business logic, database access, or side effects

```typescript
// validators/auth.validator.ts
export const oauthCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code required'),
  state: z.string().optional(),
});
```

### 🔸 Layer 4: Controllers
**Purpose**: Handle HTTP requests and prepare responses
- ✅ Extract and validate request data
- ✅ Call appropriate service functions
- ✅ Format and return HTTP responses
- ❌ NO business logic or database operations

```typescript
// controllers/auth.controller.ts
export const handleOAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.query;
    const authResult = await authService.processOAuthLogin(code);
    res.json({ success: true, user: authResult.user });
  } catch (error) {
    next(error);
  }
};
```

### 🔸 Layer 5: Services
**Purpose**: Core business logic and database operations (ONLY layer that uses Prisma)
- ✅ All business rule execution
- ✅ Database interactions via Prisma client
- ✅ Data processing and complex workflows
- ❌ NO HTTP concerns or response formatting

```typescript
// services/auth.service.ts
export class AuthService {
  async processOAuthLogin(code: string): Promise<AuthResult> {
    // Business logic here
    const user = await prisma.user.findUnique({ where: { email } });
    return { user: this.sanitizeUser(user), tokens };
  }
}
```

### 🔸 Layer 6: Utils
**Purpose**: Reusable, stateless helper functions
- ✅ Pure utility functions (formatting, conversion, etc.)
- ✅ Stateless operations with no side effects
- ❌ NO database access or request handling

```typescript
// utils/formatter.ts
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency 
  }).format(amount);
};
```

### 🔸 Layer 7: Types
**Purpose**: TypeScript type definitions and enums
- ✅ Interface definitions and entity structures
- ✅ Enum declarations and DTO types
- ✅ API response types and data shapes
- ❌ NO runtime logic, functions, or business rules

```typescript
// types/auth.types.ts
export interface AuthResult {
  user: UserDTO;
  tokens: TokenPair;
}

export enum AuthProvider {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  APPLE = 'apple'
}
```

## 🔐 MANDATORY SESSION-BASED AUTHENTICATION

**CRITICAL**: This backend uses **PURE PASSPORT SESSION AUTHENTICATION ONLY**. No JWT tokens for authentication.

### ⚠️ AUTHENTICATION RULES
- ❌ **NO JWT token generation** for authentication
- ❌ **NO JWT token validation** middleware
- ❌ **NO refresh tokens** or token-based auth endpoints
- ✅ **ONLY session-based authentication** using Passport sessions
- ✅ **HTTP-only session cookies** for client authentication

### ✅ Required Session Configuration

#### 1. Session Store Setup (`config/session.ts`)
```typescript
import session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';

export const sessionConfig = session({
  cookie: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800000'),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  },
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000,
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
  })
});
```

#### 2. Passport Configuration (`config/passport.ts`)
```typescript
import passport from 'passport';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
```

#### 3. App.ts Integration (EXACT ORDER REQUIRED)
```typescript
// 1. Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 2. Session configuration (BEFORE Passport)
app.use(sessionConfig);

// 3. Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// 4. Route handlers
app.use('/api/v1', routes);
```

### ✅ Required Environment Variables
```env
SESSION_SECRET=your-super-secret-session-key-min-32-characters
SESSION_MAX_AGE=604800000
SESSION_NAME=tokenizer.sid
SESSION_DOMAIN=localhost
```

### ✅ Required Database Schema
```prisma
model Session {
  id        String   @id
  sid       String   @unique
  data      String
  expiresAt DateTime
  @@map("sessions")
}
```

### ✅ Authentication Middleware
```typescript
// middleware/session.middleware.ts
export const sessionGuard = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

export const optionalSession = (req: Request, res: Response, next: NextFunction) => {
  // Allows both authenticated and unauthenticated requests
  next();
};
```

## 🚀 OAuth Integration Patterns

### ✅ OAuth Strategy Configuration
```typescript
// strategies/google.strategy.ts
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: '/api/v1/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const authResult = await authService.processOAuthLogin(profile);
    return done(null, authResult.user);
  } catch (error) {
    return done(error, null);
  }
}));
```

### ✅ OAuth Route Patterns
```typescript
// OAuth initiation
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  authController.handleOAuthSuccess
);

// Logout (destroy session)
router.post('/logout', sessionGuard, authController.logout);
```

## 📁 Module Structure Standards

Each module MUST follow this folder structure:

```
modules/
  accounts/           # or any module name
    routes/           # Layer 1: API endpoint definitions
    middleware/       # Layer 2: Cross-cutting concerns
    validators/       # Layer 3: Request validation schemas
    controllers/      # Layer 4: HTTP request/response handling
    services/         # Layer 5: Business logic + Prisma operations
    utils/           # Layer 6: Pure utility functions
    types/           # Layer 7: TypeScript type definitions
    strategies/      # OAuth provider configurations (auth modules only)
```

## 🔒 Security Standards

### ✅ Input Validation
- All request data MUST be validated using Zod schemas in validators/
- Never trust client input - always validate at the entry point
- Use type-safe validation with proper error messages

### ✅ Error Handling
- **MANDATORY**: All HTTP errors MUST be handled by the `http-errors` package
- **PROHIBITED**: Custom error classes or manual status code assignment
- **REQUIRED**: Use createError from http-errors for all error creation

```typescript
// CORRECT Way to create errors
import createError from 'http-errors';

// Create specific HTTP errors
throw createError(404, 'Resource not found');
throw createError(400, 'Invalid input data');
throw createError(401, 'Authentication required');
throw createError(403, 'Permission denied');
throw createError(409, 'Resource conflict');
throw createError(500, 'Internal server error');

// With additional properties
throw createError(400, 'Validation failed', { 
  code: 'VALIDATION_ERROR',
  details: validationErrors 
});

// Handling errors in controllers
try {
  // operation code
} catch (error) {
  return handleControllerError(error, req, res, 'Operation name');
}
```

### ✅ Data Sanitization
```typescript
// Always sanitize user data before returning
export const sanitizeUser = (user: User): UserDTO => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
  // Never include sensitive fields like passwords, tokens, etc.
});
```

## 📊 Database Patterns

### ✅ Prisma Usage Rules
- Prisma client can ONLY be used in services/ folder
- All database operations must go through services
- Use transactions for multi-step operations
- Always handle database errors appropriately

```typescript
// services/user.service.ts (CORRECT)
export class UserService {
  async createUser(data: CreateUserDTO): Promise<User> {
    return await prisma.user.create({ data });
  }

  async updateUser(id: string, data: UpdateUserDTO): Promise<User> {
    return await prisma.user.update({ where: { id }, data });
  }
}

// controllers/user.controller.ts (WRONG - no Prisma here)
export const getUser = async (req: Request, res: Response) => {
  // ❌ const user = await prisma.user.findUnique(...); // WRONG!
  const user = await userService.getUserById(req.params.id); // ✅ CORRECT
};
```

### ✅ Data Transfer Objects (DTOs)
```typescript
// Always use DTOs for API responses
export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Create Input DTOs for requests
export interface CreateUserDTO {
  email: string;
  fullName: string;
  authProvider: AuthProvider;
  providerId: string;
}
```

## 🚦 Request Flow Example

```
1. POST /api/v1/users
   ↓
2. routes/user.routes.ts → applies middleware & validators
   ↓
3. middleware/session.middleware.ts → checks authentication
   ↓
4. validators/user.validator.ts → validates request data
   ↓
5. controllers/user.controller.ts → extracts data, calls service
   ↓
6. services/user.service.ts → business logic + Prisma operations
   ↓
7. utils/sanitization.ts → sanitizes response data
   ↓
8. Response returned through controller
```

## 🧪 Testing Standards

### ✅ Service Testing
```typescript
// tests/services/auth.service.test.ts
describe('AuthService', () => {
  it('should create user from OAuth profile', async () => {
    const profile = mockGoogleProfile();
    const result = await authService.processOAuthLogin(profile);
    
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(profile.email);
  });
});
```

### ✅ Controller Testing
```typescript
// tests/controllers/auth.controller.test.ts
describe('AuthController', () => {
  it('should handle OAuth callback', async () => {
    const req = mockRequest({ query: { code: 'auth_code' } });
    const res = mockResponse();
    
    await authController.handleOAuthCallback(req, res, jest.fn());
    
    expect(res.json).toHaveBeenCalledWith({ success: true, user: expect.any(Object) });
  });
});
```

## 🚀 Performance Standards

### ✅ Database Optimization
- Use appropriate indexes for frequent queries
- Implement pagination for list endpoints
- Use `select` to limit returned fields
- Implement caching for frequently accessed data

### ✅ Response Optimization
```typescript
// Always paginate list endpoints
export const getUserList = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  
  const users = await userService.getUsers({
    skip,
    take: Number(limit),
  });
  
  res.json({
    data: users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: await userService.getUserCount()
    }
  });
};
```

## 📋 Code Quality Standards

### ✅ TypeScript Standards
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use enums for predefined value sets
- Never use `any` type - use proper typing

### ✅ ESLint Rules
```json
{
  "extends": ["@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### ✅ File Naming Conventions
- Routes: `*.routes.ts`
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Middleware: `*.middleware.ts`
- Validators: `*.validator.ts`
- Types: `*.types.ts`
- Utils: `*.utils.ts`

## 📝 MANDATORY IN-CODE DOCUMENTATION STANDARDS

All backend code MUST follow these documentation standards using proper commenting strategies:

### ✅ JSDoc Comments (REQUIRED for All Public APIs)

#### **Service Method Documentation (MANDATORY):**
```typescript
/**
 * Processes OAuth login for a user
 * @param provider - OAuth provider ('google', 'microsoft', 'apple')
 * @param profile - User profile data from OAuth provider
 * @param accessToken - OAuth access token
 * @param refreshToken - OAuth refresh token (optional)
 * @returns Promise<AuthResult> - Authentication result with user data
 * @throws {AuthenticationError} When OAuth profile is invalid
 * @throws {DatabaseError} When user creation/update fails
 * @example
 * ```typescript
 * const result = await processOAuthLogin('google', profile, token);
 * console.log(result.user.email);
 * ```
 */
async processOAuthLogin(
  provider: OAuthProvider,
  profile: OAuthProfile,
  accessToken: string,
  refreshToken?: string
): Promise<AuthResult> {
  // Implementation
}
```

#### **Controller Method Documentation (MANDATORY):**
```typescript
/**
 * Handles OAuth callback from external providers
 * @param req - Express request object containing OAuth callback data
 * @param res - Express response object
 * @param next - Express next function for error handling
 * @returns HTTP 200 with user data or 401 on authentication failure
 */
export const handleOAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
  // Implementation
};
```

#### **Class Documentation (MANDATORY):**
```typescript
/**
 * Service for handling user authentication and session management
 * 
 * This service provides OAuth integration with Google, Microsoft, and Apple,
 * manages user sessions using Express sessions, and handles user profile creation.
 * 
 * @class AuthService
 * @since 1.0.0
 * @see {@link UserService} for user profile management
 * @see {@link SessionMiddleware} for session handling
 */
export class AuthService {
  /**
   * Creates an instance of AuthService
   * @param logger - Winston logger instance for error tracking
   * @param userService - Service for user CRUD operations
   */
  constructor(
    private readonly logger: Logger,
    private readonly userService: UserService
  ) {}
}
```

#### **Interface/Type Documentation (MANDATORY):**
```typescript
/**
 * OAuth profile data received from external providers
 * @interface OAuthProfile
 */
interface OAuthProfile {
  /** Unique identifier from OAuth provider */
  id: string;
  
  /** User's email address (verified by provider) */
  email: string;
  
  /** User's full display name */
  displayName: string;
  
  /** URL to user's profile photo */
  photo?: string;
  
  /** OAuth provider name */
  provider: 'google' | 'microsoft' | 'apple';
}
```

### ✅ Inline Comments (REQUIRED for Complex Logic)

#### **Business Logic Explanations (MANDATORY):**
```typescript
export async function calculateInvestmentROI(userId: string): Promise<number> {
  // Step 1: Fetch all user investments with current project valuations
  const investments = await prisma.investment.findMany({
    where: { investorId: userId },
    include: { project: { select: { currentValuation: true, totalRaised: true } } }
  });

  // Step 2: Calculate total invested amount and current portfolio value
  let totalInvested = 0;
  let currentValue = 0;
  
  for (const investment of investments) {
    totalInvested += investment.amount;
    
    // Calculate current value based on ownership percentage
    // Formula: (investment amount / total raised) * current valuation
    const ownershipPercent = investment.amount / investment.project.totalRaised;
    currentValue += investment.project.currentValuation * ownershipPercent;
  }

  // Step 3: Calculate ROI percentage
  // ROI = ((Current Value - Total Invested) / Total Invested) * 100
  const roi = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
  
  return Number(roi.toFixed(2)); // Round to 2 decimal places for display
}
```

### ✅ Architecture Comments (MANDATORY at Layer Boundaries)

```typescript
// ================================================
// LAYER 4: CONTROLLERS - Request/Response Logic
// ================================================
// Controllers should ONLY:
// - Extract data from requests
// - Call service methods
// - Format responses
// - Handle HTTP status codes
// NO business logic or database operations allowed
// ================================================

export class AuthController {
  // Implementation
}
```

### ✅ Security Comments (MANDATORY for Security-Critical Code)

```typescript
export class AuthMiddleware {
  static requireAuth(req: Request, res: Response, next: NextFunction) {
    // SECURITY: Always verify session existence and validity
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // SECURITY: Check session age to prevent indefinite sessions
    const sessionAge = Date.now() - req.session.createdAt;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (sessionAge > maxAge) {
      // SECURITY: Destroy expired session to prevent reuse attacks
      req.session.destroy((err) => {
        if (err) console.error('Session destruction failed:', err);
      });
      return res.status(401).json({ error: 'Session expired' });
    }
    
    next();
  }
}
```

### ✅ Performance Comments (MANDATORY for Optimization Decisions)

```typescript
export class UserService {
  async getUsers(filters: UserFilters): Promise<User[]> {
    // PERFORMANCE: Use database-level filtering instead of memory filtering
    // to handle large datasets efficiently
    return await prisma.user.findMany({
      where: {
        // Only add filters if provided to avoid unnecessary WHERE clauses
        ...(filters.role && { role: filters.role }),
        ...(filters.search && {
          OR: [
            { fullName: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } }
          ]
        })
      },
      // PERFORMANCE: Pagination to prevent memory issues
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      // PERFORMANCE: Only select required fields
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        // Exclude sensitive fields like hashedPassword
      }
    });
  }
}
```

### ✅ TODO/FIXME Comments (REQUIRED for Technical Debt)

```typescript
export class KYCService {
  async submitKYCDocuments(userId: string, documents: KYCDocuments) {
    // TODO: Implement document virus scanning before processing
    // Priority: High - Security requirement for production
    // Assignee: Security Team
    // Deadline: Before production deployment
    
    // FIXME: Current validation doesn't check document expiry dates
    // Bug: Expired documents are being accepted
    // Impact: Compliance risk
    // Assigned: Backend Team
    
    // NOTE: KYC processing typically takes 24-48 hours
    // This delay is handled by external provider webhook system
    
    return await this.processDocuments(documents);
  }
}
```

### ❌ Comment Quality Rules (MANDATORY)

#### **BAD Comments (FORBIDDEN):**
```typescript
// ❌ DON'T: Obvious comments that state what code does
counter++; // Increment counter by 1

// ❌ DON'T: Outdated comments
// TODO: Add validation (already implemented)

// ❌ DON'T: Misleading comments
// Get user by email
const user = await prisma.user.findUnique({ where: { id } }); // Wrong field!
```

#### **GOOD Comments (REQUIRED):**
```typescript
// ✅ DO: Explain WHY, not WHAT
// Increment retry counter for exponential backoff rate limiting
counter++;

// ✅ DO: Provide business context
// KYC verification must be completed within 30 days of registration
// to comply with EU GDPR and US financial regulations
if (isKYCExpired(user.kycSubmittedAt)) {
  throw new ComplianceError('KYC verification expired');
}

// ✅ DO: Explain complex algorithms
// Use binary search to find optimal portfolio allocation
// Time complexity: O(log n), Space complexity: O(1)
const allocation = binarySearchAllocation(portfolioData, targetRisk);
```

### 📋 Documentation Compliance Checklist (MANDATORY)

- [ ] All public service methods have JSDoc documentation
- [ ] All controller methods have JSDoc documentation
- [ ] All interfaces and types have property documentation
- [ ] Complex business logic has step-by-step inline comments
- [ ] Security-critical code has SECURITY comments
- [ ] Performance optimizations have PERFORMANCE comments
- [ ] All TODO/FIXME items include priority and assignee
- [ ] Architecture layer boundaries are clearly documented
- [ ] No obvious or misleading comments exist
- [ ] All comments explain WHY, not WHAT

## 🔧 Environment Configuration

### ✅ Required Environment Variables
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tokenizer"

# Session Management
SESSION_SECRET="your-super-secret-key-min-32-characters"
SESSION_MAX_AGE=604800000

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"

# Server Configuration
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

## 📚 Dependencies Standards (MANDATORY - NO ADDITIONAL MODULES ALLOWED)

**⚠️ CRITICAL:** This is the COMPLETE and FINAL list of approved backend dependencies. **NO additional modules may be installed** without explicit architecture review and approval.

### **🏗️ Core Framework & Server**

#### **express@5.1.0** ✅
- **Purpose**: Main web application framework for Node.js
- **Used in**: All route files, app.ts, server.ts
- **Layer Usage**: Routes layer foundation
- **Required for**: HTTP server, routing, middleware pipeline

#### **typescript@5.8.3** ✅
- **Purpose**: Static type checking for JavaScript
- **Used in**: All .ts files across entire backend
- **Layer Usage**: All 7 layers
- **Required for**: Type safety, IDE support, compilation

#### **@types/express@5.0.3** ✅
- **Purpose**: TypeScript definitions for Express
- **Used in**: Controllers, middleware, routes
- **Layer Usage**: Routes, Controllers, Middleware layers
- **Required for**: Type-safe Express API usage

#### **@types/node@24.0.13** ✅
- **Purpose**: TypeScript definitions for Node.js APIs
- **Used in**: Utils, config files, all Node.js API usage
- **Layer Usage**: All layers using Node.js APIs
- **Required for**: fs, path, crypto, process type safety

### **🗄️ Database & ORM (Prisma Only)**

#### **@prisma/client@6.11.1** ✅
- **Purpose**: Type-safe database client for PostgreSQL
- **Used in**: Services layer ONLY
- **Layer Usage**: Services layer exclusively
- **Required for**: All database operations, migrations

#### **prisma@6.11.1** ✅
- **Purpose**: Prisma CLI and schema management
- **Used in**: Database schema, migrations, development
- **Layer Usage**: Database schema management
- **Required for**: Schema generation, migrations, introspection

### **🔐 Authentication & Security (Session-Based Only)**

#### **passport@0.7.0** ✅
- **Purpose**: Strategy-based authentication middleware
- **Used in**: accounts/strategies/, accounts/middleware/
- **Layer Usage**: Middleware layer
- **Required for**: Core authentication framework

#### **passport-google-oauth20@2.0.0** ✅
- **Purpose**: Google OAuth 2.0 authentication strategy
- **Used in**: accounts/strategies/google.strategy.ts
- **Layer Usage**: Middleware layer (OAuth strategies)
- **Required for**: Login with Google functionality

#### **passport-azure-ad@4.3.5** ✅
- **Purpose**: Microsoft Azure AD/OAuth authentication
- **Used in**: accounts/strategies/microsoft.strategy.ts
- **Layer Usage**: Middleware layer (OAuth strategies)
- **Required for**: Login with Microsoft functionality

#### **passport-apple@2.0.2** ✅
- **Purpose**: Apple Sign-In authentication strategy
- **Used in**: accounts/strategies/apple.strategy.ts
- **Layer Usage**: Middleware layer (OAuth strategies)
- **Required for**: Login with Apple functionality

#### **@types/passport@1.0.17** ✅
- **Purpose**: TypeScript definitions for Passport
- **Used in**: All authentication-related files
- **Layer Usage**: Middleware, Controllers layers
- **Required for**: Type-safe authentication development

#### **@types/passport-google-oauth20@2.0.16** ✅
- **Purpose**: TypeScript definitions for Google OAuth
- **Used in**: accounts/strategies/google.strategy.ts
- **Layer Usage**: Middleware layer
- **Required for**: Type-safe Google authentication

#### **@types/passport-azure-ad@4.3.6** ✅
- **Purpose**: TypeScript definitions for Azure AD
- **Used in**: accounts/strategies/microsoft.strategy.ts
- **Layer Usage**: Middleware layer
- **Required for**: Type-safe Microsoft authentication

### **📝 Session Management (Required for Authentication)**

#### **express-session@1.18.2** ✅
- **Purpose**: Session middleware for Express
- **Used in**: config/session.ts, app.ts
- **Layer Usage**: Middleware layer
- **Required for**: HTTP session management, cookie handling

#### **@quixo3/prisma-session-store@3.1.13** ✅
- **Purpose**: Prisma-based session store
- **Used in**: config/session.ts
- **Layer Usage**: Configuration layer
- **Required for**: Persistent session storage in PostgreSQL

#### **@types/express-session@1.18.2** ✅
- **Purpose**: TypeScript definitions for express-session
- **Used in**: Session configuration and middleware
- **Layer Usage**: Middleware, Types layers
- **Required for**: Type-safe session management

#### **cookie-parser@1.4.7** ✅
- **Purpose**: Parse HTTP request cookies
- **Used in**: app.ts, middleware configuration
- **Layer Usage**: Middleware layer
- **Required for**: Session cookie handling

#### **@types/cookie-parser@1.4.9** ✅
- **Purpose**: TypeScript definitions for cookie-parser
- **Used in**: Cookie handling middleware
- **Layer Usage**: Middleware layer
- **Required for**: Type-safe cookie operations

### **🛡️ Security & Middleware (Mandatory Protection)**

#### **helmet@8.1.0** ✅
- **Purpose**: Security middleware collection
- **Used in**: app.ts, security configuration
- **Layer Usage**: Middleware layer
- **Required for**: HTTP security headers, XSS protection

#### **cors@2.8.5** ✅
- **Purpose**: Cross-Origin Resource Sharing middleware
- **Used in**: app.ts, API configuration
- **Layer Usage**: Middleware layer
- **Required for**: Frontend-backend communication

#### **@types/cors@2.8.19** ✅
- **Purpose**: TypeScript definitions for CORS
- **Used in**: CORS configuration
- **Layer Usage**: Middleware layer
- **Required for**: Type-safe CORS setup

#### **express-rate-limit@8.0.1** ✅
- **Purpose**: Rate limiting middleware
- **Used in**: Routes requiring rate limiting
- **Layer Usage**: Routes, Middleware layers
- **Required for**: API protection, DoS prevention

#### **dompurify@3.2.6** ✅
- **Purpose**: HTML sanitization library
- **Used in**: Services layer for input cleaning
- **Layer Usage**: Services layer
- **Required for**: XSS attack prevention

#### **@types/dompurify@3.0.5** ✅
- **Purpose**: TypeScript definitions for DOMPurify
- **Used in**: Input sanitization in services
- **Layer Usage**: Services layer
- **Required for**: Type-safe input cleaning

### **✅ Validation & Data Processing (Zod Only)**

#### **zod@4.0.5** ✅
- **Purpose**: TypeScript schema validation library
- **Used in**: All validators/ folders across modules
- **Layer Usage**: Validators layer
- **Required for**: Runtime type checking, request validation

#### **express-validator@7.2.1** ✅
- **Purpose**: Express middleware for validation
- **Used in**: Additional validation utilities
- **Layer Usage**: Validators layer
- **Required for**: Extended validation capabilities

#### **@types/validator@13.15.2** ✅
- **Purpose**: TypeScript definitions for validator
- **Used in**: Validation utilities
- **Layer Usage**: Validators, Utils layers
- **Required for**: Type-safe validation functions

### **📁 File Upload & Processing (Multer Only)**

#### **multer@2.0.2** ✅
- **Purpose**: Handle multipart/form-data file uploads
- **Used in**: Controllers handling file uploads (KYC, documents)
- **Layer Usage**: Controllers layer
- **Required for**: Document uploads, profile images

#### **@types/multer@2.0.0** ✅
- **Purpose**: TypeScript definitions for Multer
- **Used in**: File upload controllers and middleware
- **Layer Usage**: Controllers, Middleware layers
- **Required for**: Type-safe file operations

#### **compression@1.8.1** ✅
- **Purpose**: Gzip compression middleware
- **Used in**: app.ts, performance optimization
- **Layer Usage**: Middleware layer
- **Required for**: Response compression, performance

#### **@types/compression@1.8.1** ✅
- **Purpose**: TypeScript definitions for compression
- **Used in**: Compression middleware setup
- **Layer Usage**: Middleware layer
- **Required for**: Type-safe compression configuration

### **🪙 Blockchain Integration (Token Module Only)**

#### **ethers@6.15.0** ✅
- **Purpose**: Ethereum blockchain interaction library
- **Used in**: token/services/ for blockchain operations
- **Layer Usage**: Services layer (token module only)
- **Required for**: Smart contract interactions, transactions

#### **hardhat@2.26.0** ✅
- **Purpose**: Ethereum development environment
- **Used in**: Smart contract development and deployment
- **Layer Usage**: Development tooling
- **Required for**: Contract compilation, testing, deployment

### **📊 Logging & Monitoring (Winston Only)**

#### **winston@3.17.0** ✅
- **Purpose**: Structured logging library
- **Used in**: All services, controllers, error handling
- **Layer Usage**: All layers for logging
- **Required for**: Application logging, debugging, monitoring

#### **@types/pino@7.0.4** ✅
- **Purpose**: TypeScript definitions for Pino logger (alternative)
- **Used in**: High-performance logging scenarios
- **Layer Usage**: Services layer
- **Required for**: Performance-critical logging

#### **morgan@1.10.1** ✅
- **Purpose**: HTTP request logger middleware
- **Used in**: app.ts for request/response logging
- **Layer Usage**: Middleware layer
- **Required for**: HTTP request tracking

#### **@types/morgan@1.9.10** ✅
- **Purpose**: TypeScript definitions for Morgan
- **Used in**: Request logging middleware
- **Layer Usage**: Middleware layer
- **Required for**: Type-safe request logging

### **🌐 HTTP & Network (Node-Fetch Only)**

#### **node-fetch@3.3.2** ✅
- **Purpose**: Fetch API implementation for Node.js
- **Used in**: Services making external API calls
- **Layer Usage**: Services layer
- **Required for**: External API integrations, webhooks

#### **http-errors@2.0.0** ✅
- **Purpose**: HTTP error objects for Express
- **Used in**: Error handling across all layers
- **Layer Usage**: All layers for error responses
- **Required for**: Standardized HTTP error responses

### **⚙️ Configuration & Environment**

#### **dotenv@17.2.0** ✅
- **Purpose**: Load environment variables from .env files
- **Used in**: server.ts, configuration files
- **Layer Usage**: Configuration management
- **Required for**: Environment-specific settings

### **🔧 Development Tools (TypeScript Execution)**

#### **ts-node@10.9.2** ✅
- **Purpose**: Run TypeScript directly without compilation
- **Used in**: Development server execution
- **Layer Usage**: Development tooling
- **Required for**: Development productivity

#### **ts-node-dev@2.0.0** ✅
- **Purpose**: Development tool with automatic restarts
- **Used in**: npm run dev script
- **Layer Usage**: Development tooling
- **Required for**: Hot reloading during development

#### **tsx@4.20.3** ✅
- **Purpose**: Modern TypeScript execution engine
- **Used in**: Fast TypeScript execution
- **Layer Usage**: Development tooling
- **Required for**: Enhanced development performance

#### **tsconfig-paths@4.2.0** ✅
- **Purpose**: Load modules according to tsconfig paths
- **Used in**: Import path resolution
- **Layer Usage**: All layers with path mapping
- **Required for**: Clean import paths (@/config, @/utils)

### **🧪 Testing (Vitest Only)**

#### **vitest@3.2.4** ✅
- **Purpose**: Modern testing framework
- **Used in**: Unit and integration tests
- **Layer Usage**: Testing all layers
- **Required for**: Code quality assurance, CI/CD

### **📝 Code Quality & Formatting (ESLint + Prettier)**

#### **eslint@9.31.0** ✅
- **Purpose**: JavaScript/TypeScript linter
- **Used in**: Code quality enforcement across all files
- **Layer Usage**: All layers for code standards
- **Required for**: Code consistency, bug prevention

#### **@typescript-eslint/eslint-plugin@8.37.0** ✅
- **Purpose**: ESLint rules for TypeScript
- **Used in**: TypeScript-specific linting
- **Layer Usage**: All TypeScript files
- **Required for**: TypeScript best practices

#### **@typescript-eslint/parser@8.37.0** ✅
- **Purpose**: ESLint parser for TypeScript
- **Used in**: Parse TypeScript for linting
- **Layer Usage**: ESLint configuration
- **Required for**: TypeScript linting support

#### **prettier@3.6.2** ✅
- **Purpose**: Opinionated code formatter
- **Used in**: Automatic code formatting
- **Layer Usage**: All source files
- **Required for**: Consistent code style

#### **eslint-config-prettier@10.1.8** ✅
- **Purpose**: Disable ESLint rules that conflict with Prettier
- **Used in**: ESLint configuration
- **Layer Usage**: Code quality tooling
- **Required for**: ESLint + Prettier integration

#### **eslint-plugin-prettier@5.5.3** ✅
- **Purpose**: Run Prettier as an ESLint rule
- **Used in**: Unified linting and formatting
- **Layer Usage**: Code quality tooling
- **Required for**: Single command formatting + linting

#### **eslint-formatter-friendly@7.0.0** ✅
- **Purpose**: Human-friendly ESLint output formatter
- **Used in**: ESLint output formatting
- **Layer Usage**: Development tooling
- **Required for**: Better error reporting

## 🚫 **FORBIDDEN DEPENDENCIES**

### **❌ Token-Based Auth Libraries (Forbidden)**
- **All token-based auth libraries** - Conflicts with our session-based auth approach
- **Any libraries that bypass Passport sessions**

### **❌ Alternative ORMs (Forbidden)**
- **typeorm** - Use Prisma only
- **sequelize** - Use Prisma only
- **mongoose** - PostgreSQL only, no MongoDB

### **❌ Alternative Authentication (Forbidden)**
- **auth0** - Use Passport strategies only
- **firebase-admin** - Use local authentication
- **supabase** - Use Prisma + PostgreSQL

### **❌ Alternative Validation (Forbidden)**
- **joi** - Use Zod only
- **yup** - Use Zod only
- **class-validator** - Use Zod schemas

### **❌ Alternative Loggers (Forbidden)**
- **bunyan** - Use Winston only
- **log4js** - Use Winston only

### **❌ Alternative HTTP Clients (Forbidden)**
- **axios** - Use node-fetch only
- **got** - Use node-fetch only
- **superagent** - Use node-fetch only

## 🔒 **Dependency Management Rules (MANDATORY)**

### **✅ Installation Rules:**
1. **NO new dependencies** without explicit approval
2. **All dependencies** must have TypeScript definitions
3. **Security audits** required for any changes
4. **Version pinning** required for production
5. **Dependency updates** require architecture review

### **✅ Usage Rules:**
1. **Database operations**: Prisma ONLY in Services layer
2. **Validation**: Zod ONLY in Validators layer
3. **Authentication**: Passport ONLY in Middleware layer
4. **HTTP requests**: node-fetch ONLY in Services layer
5. **Logging**: Winston ONLY across all layers

### **✅ Security Requirements:**
1. **npm audit** must pass with 0 vulnerabilities
2. **Regular security updates** for all dependencies
3. **No dev dependencies** in production builds
4. **Environment isolation** for development tools

**⚠️ VIOLATION POLICY:** Any unauthorized dependency installation will be automatically rejected in code review and CI/CD pipeline.

---

## ✅ Architecture Compliance Checklist

### **Module Architecture:**
- [ ] All features follow the 6-module structure (accounts, admin, investor, notifications, projects, token)
- [ ] Each module contains complete 7-layer architecture (routes, middleware, validators, controllers, services, utils, types)
- [ ] Cross-module communication uses well-defined APIs only
- [ ] Module dependencies follow the established hierarchy
- [ ] New features are placed in the appropriate module
- [ ] API endpoints follow `/api/{module-name}/*` pattern

### **Code Architecture:**
- [ ] All routes only define endpoints and delegate to controllers
- [ ] Middleware handles only cross-cutting concerns
- [ ] Validators use Zod schemas for request validation
- [ ] Controllers handle HTTP concerns and call services
- [ ] Services contain business logic and use Prisma
- [ ] Utils are pure, stateless helper functions
- [ ] Types define interfaces and enums only

### **Authentication & Security:**
- [ ] Session-based authentication is properly configured
- [ ] OAuth strategies are properly implemented with Passport
- [ ] Error handling follows established patterns
- [ ] Data sanitization is implemented in services

### **Dependency Management (CRITICAL):**
- [ ] Only approved dependencies from the official list are installed
- [ ] No token-based authentication libraries are used
- [ ] No alternative ORMs (typeorm, sequelize, mongoose) are installed
- [ ] No alternative validation libraries (joi, yup, class-validator) are used
- [ ] No alternative HTTP clients (axios, got, superagent) are installed
- [ ] All dependencies have TypeScript definitions included
- [ ] npm audit passes with 0 high/critical vulnerabilities
- [ ] Prisma is used ONLY in Services layer
- [ ] Zod is used ONLY in Validators layer
- [ ] Winston is used for all logging requirements

### **Documentation Standards:**
- [ ] All public service methods have JSDoc documentation
- [ ] All controller methods have JSDoc documentation
- [ ] All interfaces and types have property documentation
- [ ] Complex business logic has step-by-step inline comments
- [ ] Security-critical code has SECURITY comments
- [ ] Performance optimizations have PERFORMANCE comments
- [ ] All TODO/FIXME items include priority and assignee
- [ ] Architecture layer boundaries are clearly documented
- [ ] No obvious or misleading comments exist
- [ ] All comments explain WHY, not WHAT

### **Testing & Environment:**
- [ ] Testing covers services and controllers
- [ ] Environment variables are properly configured

This architecture ensures scalability, maintainability, testability, security, comprehensive documentation, and strict dependency control across the entire backend application.
