---
applyTo: `backend/src/modules/accounts/middleware/auth.middleware.ts`
---

# `auth.middleware.ts` — Development & Usage Guidelines

---

## Purpose

The `auth.middleware.ts` file provides essential middleware functions that protect routes by enforcing authentication and authorization within the Accounts domain. This middleware ensures that only authenticated users can access secured resources and that users have the appropriate roles for specific actions.

**CRITICAL**: This middleware depends on properly configured session management to function correctly.

### 🔐 SESSION MANAGEMENT DEPENDENCY (MANDATORY)

**Required Configuration** for middleware to work:
1. **Session Store**: Configured in `src/config/session.ts`
2. **Passport Setup**: Configured in `src/config/passport.ts`
3. **Express Integration**: Properly initialized in app.ts

**Without session management**:
- ❌ `req.user` will be UNDEFINED
- ❌ Authentication checks will FAIL
- ❌ Protected routes will be INACCESSIBLE
- ❌ Role-based access control will NOT work

### ✅ Required App Configuration

```typescript
// In app.ts - THIS ORDER IS MANDATORY
app.use(session(sessionConfig));      // BEFORE Passport
app.use(passport.initialize());       // Initialize Passport
app.use(passport.session());          // Enable persistent sessions
```

It primarily:

* Validates JWT tokens (currently with a placeholder implementation).
* Attaches the authenticated user object to the Express request.
* Enforces role-based access control.
* Provides both required and optional authentication middleware.

---

## Middleware Functions Overview

### 1. `authGuard` (Aliases: `requireAuth`, `isAuthenticated`)

* Core middleware enforcing that a valid JWT token must be present.
* Extracts the token from the `Authorization` header.
* Verifies the token (currently via a stub `verifyBasicToken` function).
* Attaches the user object to `req.user`.
* Responds with HTTP 401 Unauthorized if the token is missing or invalid.

### 2. `roleGuard` (Aliases: `requireRole`, `hasRole`)

* Middleware factory accepting one or multiple allowed roles.
* Checks that `req.user` exists and has one of the specified roles.
* Returns HTTP 401 if no authenticated user.
* Returns HTTP 403 Forbidden if the user lacks the required role.
* Calls `next()` if authorization passes.

### 3. `optionalAuth`

* Attempts to authenticate the user if a Bearer token is present.
* Attaches the user object to `req.user` if token is valid.
* Proceeds without error if no token or token is invalid.
* Useful for endpoints that allow both authenticated and anonymous access.

---

## Current Implementation Notes

* **Token Verification:**
  The `verifyBasicToken` function is a temporary stub that checks token format and returns a mock user object. This should be replaced with a proper JWT verification and user lookup, ideally integrated with the `authService` layer.

* **Error Handling:**
  The middleware responds directly with JSON error responses on failure. For consistency and scalability, consider refactoring to throw HTTP errors (e.g., via `http-errors` package) and delegate to centralized error handling middleware.

* **TypeScript Extensions:**
  The `Request` interface is extended to include an optional `user` property to carry the authenticated user info downstream.

---

## Best Practices & Recommendations

### 1. Replace Stub Token Verification

* Integrate with a robust JWT verification utility that:

  * Validates token signature and expiry.
  * Extracts user identifiers or claims.
  * Fetches user details from the database if needed.
* Use existing service layers (e.g., `authService`) to avoid duplicating logic.

### 2. Centralize Error Handling

* Instead of responding inside middleware, throw errors using `http-errors` or custom error classes.
* Let centralized error middleware handle formatting and response.
* This improves maintainability and consistency.

### 3. Maintain Minimal Middleware Logic

* Keep middleware focused on **request validation, authentication, and authorization**.
* Delegate user data fetching and complex logic to services.

### 4. Leverage Middleware Composition

* Compose `authGuard` and `roleGuard` in routes for fine-grained control.
* Use `optionalAuth` for endpoints supporting both authenticated and anonymous users.

### 5. Use Strong Typing

* Define a proper `User` interface or DTO for `req.user` instead of `any`.
* This improves type safety and developer experience.

### 6. Provide Clear and Consistent Responses

* On auth failure, respond with clear JSON including:

  * `success: false`
  * `error`: a short error code or message
  * `message`: human-readable explanation

### 7. Secure Token Handling

* Never log or expose tokens or sensitive user info.
* Validate token presence strictly to avoid unauthorized access.

---

## Example Usage in Routes

```ts
import { authGuard, roleGuard, optionalAuth } from '@modules/accounts/middleware/auth.middleware';

router.get('/private',
  authGuard,
  (req, res) => {
    res.json({ message: `Hello, ${req.user.email}` });
  }
);

router.post('/admin-action',
  authGuard,
  roleGuard(['admin']),
  (req, res) => {
    res.json({ message: 'Admin action performed' });
  }
);

router.get('/public-info',
  optionalAuth,
  (req, res) => {
    if (req.user) {
      res.json({ message: `Welcome back, ${req.user.email}` });
    } else {
      res.json({ message: 'Hello, guest!' });
    }
  }
);
```

---

## Summary

`auth.middleware.ts` enforces authentication and authorization at the route level within the Accounts domain. It currently uses a placeholder token validation but should be updated to integrate with real JWT verification and user service lookups.

* Use this middleware to protect sensitive routes.
* Compose middleware to enforce role-based access control.
* Follow best practices for error handling and typing.
* Keep middleware logic minimal and delegate to services.

By following these guidelines, this middleware layer will provide secure, maintainable, and flexible route protection aligned with overall application architecture.

---
