---
applyTo: "backend/src/modules/accounts/routes/auth.routes.ts"
---

# Backend Authentication Routes Instructions

**Location:** `accounts/routes/auth.routes.ts`

**⚠️ IMPORTANT REFACTORING CHANGE:**
- **Profile route REMOVED from auth routes** (moved to user routes)
- **Auth routes now ONLY handle authentication actions**
- **User profile routes are in `user.routes.ts`**

## 🏗️ MANDATORY BACKEND ARCHITECTURE - ROUTES LAYER

Routes are **Layer 1** in the mandatory 7-layer backend architecture:

**🎯 ROUTES → Middleware → Validator → Controller → Services → Utils → Types**

### ✅ Auth Routes Responsibilities (Layer 1)

Auth routes define **authentication endpoints only**:

- **OAuth provider redirects** - `/google`, `/azure`, `/apple`
- **OAuth callbacks** - `/google/callback`, `/azure/callback`, `/apple/callback`
- **Session management** - `/logout`, `/refresh-token`
- **Health checks** - `/health`
- ❌ **NO LONGER:** Profile endpoints (moved to user routes)

### ⚠️ CRITICAL: SESSION MANAGEMENT DEPENDENCY

**MANDATORY**: All authentication routes depend on properly configured session management.

**Required Configuration** (must be in app.ts):
```typescript
// Session configuration (BEFORE Passport)
app.use(session(sessionConfig));

// Passport initialization (AFTER session)
app.use(passport.initialize());
app.use(passport.session());
```

**Required Files**:
- `src/config/session.ts` - Session store configuration
- `src/config/passport.ts` - Passport serialization/deserialization

**Without session management**:
- ❌ OAuth callbacks will FAIL
- ❌ `req.user` will be UNDEFINED
- ❌ Authentication state will NOT persist
- ❌ Login flow will be BROKEN

### ❌ What Auth Routes Should NOT Do

- **NO profile endpoints** - user routes handle profile operations
- **NO business logic** - controllers handle request processing
- **NO validation logic** - validators handle data validation
- **NO authentication logic** - middleware handles auth
- **NO database access** - services handle all Prisma operations
- **NO response formatting** - controllers format responses

### 🔄 Route Definition Pattern

```typescript
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware, optionalAuth } from '../middleware/auth.middleware';
import { validateOAuthCallback } from '../validators/auth.validator';

const router = Router();

// ✅ Simple route definition - URL + method + handler
router.get('/health', authController.healthCheck);

// ✅ Route with middleware
router.get('/profile', authMiddleware, authController.getProfile);

// ✅ Route with validation
router.post('/oauth/callback', validateOAuthCallback, authController.oauthCallback);

// ✅ Route with multiple middleware
router.post('/refresh', 
  authMiddleware, 
  validateRefreshToken, 
  authController.refreshToken
);

export default router;
```

### 📌 Authentication Routes Structure

Authentication routes for OAuth 2.0 flows:

```typescript
// Public routes (no auth required)
router.get('/health', authController.healthCheck);
router.get('/google', authController.initiateGoogleAuth);
router.get('/google/callback', validateOAuthCallback, authController.googleCallback);
router.get('/azure', authController.initiateAzureAuth);
router.get('/azure/callback', validateOAuthCallback, authController.azureCallback);

// Protected routes (auth required)
router.get('/profile', authMiddleware, authController.getProfile);
router.post('/refresh-token', authMiddleware, authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);
router.get('/verify-token', authMiddleware, authController.verifyToken);

// Error handling
router.get('/error', authController.handleAuthError);
```

### 🔐 OAuth Strategy Integration

Routes use Passport.js for OAuth flows:

- **Strategy Configuration**: Belongs in `/strategies` folder (google.strategy.ts, azure.strategy.ts)
- **Route Handlers**: Controllers handle OAuth callbacks and user processing
- **Middleware**: Auth middleware validates tokens and sessions

### 🚨 Middleware Usage Patterns

```typescript
// Authentication required
router.get('/protected', authMiddleware, controller.method);

// Optional authentication (user context if available)
router.get('/public', optionalAuth, controller.method);

// Role-based access
router.get('/admin', authMiddleware, requireRole(['admin']), controller.method);

// Multiple validations
router.post('/update', 
  authMiddleware,           // Check authentication
  validateUserUpdate,      // Validate request data
  controller.updateUser    // Handle request
);
```

### 🔄 OAuth Flow Routes

```typescript
// Initiate OAuth flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/error' }),
  authController.googleCallback
);

// Error handling for failed OAuth
router.get('/error', authController.handleAuthError);
```

### ✅ Architecture Compliance Rules

1. **Endpoint Definition Only**: Routes just connect URLs to handlers
2. **No Business Logic**: All logic belongs in controllers and services
3. **Middleware Attachment**: Use middleware for cross-cutting concerns
4. **Handler Assignment**: Connect routes to appropriate controller methods
5. **Clean Organization**: Group related routes logically

### 📁 Route File Structure

Each domain should have its own route file:

- `auth.routes.ts` - Authentication and OAuth endpoints
- `user.routes.ts` - User profile and management endpoints
- `kyc.routes.ts` - KYC verification and status endpoints

### 🧪 Best Practices

- **RESTful Design**: Use proper HTTP methods (GET, POST, PUT, DELETE)
- **Consistent Patterns**: Follow naming conventions across routes  
- **Middleware Ordering**: Apply middleware in logical sequence
- **Error Handling**: Let controllers and middleware handle errors
- **Security First**: Apply authentication/authorization at route level
