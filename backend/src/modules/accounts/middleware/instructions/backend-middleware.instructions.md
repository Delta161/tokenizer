---
applyTo: `backend/src/modules/accounts/middleware/*.middleware.ts`
---

# Middleware Folder: `backend/src/modules/accounts/middleware`

## Purpose

This folder contains **domain-specific middleware** tailored to the Accounts module in the backend. These middleware functions focus on applying concerns directly related to the `auth`, `user`, and `kyc` domains. They enforce module-level rules and checks before requests reach controllers or services.

Unlike global middleware applied application-wide (e.g., logging, CORS, security headers), this folder’s middleware is specialized and scoped to **Accounts domain functionality**.

---

## Included in Middleware folder

- **`auth.middleware.ts`**  
  Handles authentication-related checks such as verifying user identity from sessions or tokens. Ensures requests are made by authenticated users and sets user context for downstream handlers.

- **`user.middleware.ts`**  
  Contains user-specific validations and access controls, e.g., verifying user permissions or validating user-related request parameters before hitting user controllers.

- **`kyc.middleware.ts`**  
  Enforces KYC-specific preconditions like checking KYC status, validating KYC data formats, or restricting access based on KYC verification state.

---

## Best Practices for Domain Middleware

### 1. Single Responsibility Principle

- Each middleware function should address **one domain-specific concern** clearly and concisely.
- Keep middleware focused on **pre-controller validation, authentication, and authorization** relevant to the domain.
- Delegate complex business logic and data operations to service layers.

### 2. Lightweight and Fast

- Middleware must be performant as it runs on every matching request.
- Avoid heavy computations, synchronous blocking code, or unnecessary database queries.
- Cache or memoize lookups if repeated within request lifetime.

### 3. Use Proper Express Types

- Use TypeScript’s `Request`, `Response`, and `NextFunction` types for strong typing.
- Attach relevant domain context (e.g., authenticated user info, KYC flags) to `req` object for downstream usage.

### 4. Error Handling and Flow Control

- Use `next(error)` to delegate errors to centralized error handling middleware.
- For access denials or validation failures, respond early with proper HTTP status codes (e.g., 401 Unauthorized, 403 Forbidden, 400 Bad Request).
- Avoid swallowing errors silently.

### 5. Reusability and Composability

- Export named middleware functions for easy import and reuse.
- Compose middleware functions where multiple domain checks are required.
- Keep middleware functions pure and free of side effects outside their domain concern.

### 6. Consistency with Domain Logic

- Ensure middleware enforces **rules aligned with service-layer business logic** to maintain consistency.
- Middleware should not duplicate validations already performed in services but rather perform **early request-level checks**.

### 7. Secure Access Control

- Protect sensitive user or KYC operations by verifying roles, permissions, and authentication status.
- Avoid exposing internal system details or sensitive user information on failures.

---

## Middleware Application

- Domain middleware is applied **per-route or per-router** within the Accounts module routes.
- They execute **after global middleware** (such as body parsers, CORS, logging) but **before controllers**.
- Proper ordering ensures authentication checks occur before authorization or validation.

---

## Example Usage in Routes

```ts
import { authMiddleware } from '@modules/accounts/middleware/auth.middleware';
import { userMiddleware } from '@modules/accounts/middleware/user.middleware';
import { kycMiddleware } from '@modules/accounts/middleware/kyc.middleware';

router.get('/profile', authMiddleware.ensureAuthenticated, userMiddleware.loadUser, userController.getProfile);
router.post('/kyc/submit', authMiddleware.ensureAuthenticated, kycMiddleware.validateSubmission, kycController.submitKyc);
