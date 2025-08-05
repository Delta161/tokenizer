---
applyTo: 'backend/src/modules/accounts/middleware/user.middleware.ts'
---

# `user.middleware.ts` — Development & Usage Guidelines

This document provides detailed guidelines for implementing and maintaining the `user.middleware.ts` file located at:

```
backend/src/modules/accounts/middleware/user.middleware.ts
```

---

## Purpose

The `user.middleware.ts` file contains middleware functions related to user-specific request handling within the accounts module. These middleware functions help enforce user-related constraints such as:

* Validating user existence before processing requests
* Checking user permissions or roles (if different from auth.middleware)
* Validating and sanitizing user input at the middleware level
* Logging user actions or request context relevant to user operations

---

## Core Responsibilities

### 1. User Existence Check Middleware

* Verify that a user exists in the database before allowing further request processing.
* Typically used for routes that update, delete, or fetch user-specific data.
* Should respond with HTTP 404 if the user is not found.
* Should add user data to the request object for downstream handlers to use (optional).

### 2. Role/Permission Check (User-Specific)

* While general role checks can be handled in `auth.middleware.ts`, user-specific permission checks may be needed here (e.g., verifying ownership, checking user flags).
* Should respond with HTTP 403 if permission is denied.

### 3. Input Sanitization / Validation

* Sanitize or preprocess request data related to users to prevent injection or malformed data before reaching services or controllers.
* Preferably, detailed validation should be handled in dedicated validators (not middleware) but some light sanitization can be done here.

### 4. Logging and Metrics (Optional)

* Log relevant user request data for audit or monitoring.
* Capture user-related metrics or usage patterns if applicable.

---

## Integration Points

* Should be used **after** authentication middleware (`auth.middleware.ts`) to ensure `req.user` is populated.
* Should be used **before** controller handlers to enforce business logic constraints.
* Should be registered in route files specific to user operations, e.g.:

```ts
import { userExists, checkUserPermissions } from './user.middleware';

router.put('/users/:id', authGuard, userExists, checkUserPermissions, updateUserController);
```

---

## Error Handling

* Middleware must pass errors using `next(error)` for centralized error handling.
* Use HTTP errors (e.g., `http-errors` package) to generate standard error responses with appropriate status codes.
* Return informative error messages and error codes for clients.

---

## Code Style and Practices

* Always use async/await in middleware where database or IO operations occur.
* Avoid business logic duplication; delegate to services when possible.
* Keep middleware functions focused and single-purpose.
* Extend `Express.Request` interface if you add properties (e.g., `req.userData`).
* Log warnings or errors with relevant context to facilitate debugging.
* Avoid sending raw database errors to clients; sanitize before forwarding.

---

## Example Middleware Snippets

```ts
import createError from 'http-errors';
import { NextFunction, Request, Response } from 'express';
import { userService } from '../services/user.service';

export const userExists = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  try {
    const user = await userService.getUserById(userId);
    if (!user) {
      return next(createError(404, 'User not found'));
    }
    req.userData = user; // attach for downstream usage
    next();
  } catch (err) {
    next(err);
  }
};
```

---

## Security Considerations

* Avoid leaking sensitive user data in middleware logs or error messages.
* Ensure that permission checks are strictly enforced to prevent unauthorized access.
* Validate user IDs and inputs to prevent injection attacks or malformed requests.
* Confirm `req.user` (authenticated user) matches the target user for sensitive operations.

---

## Future Enhancements

* Add rate limiting middleware for user-specific actions.
* Integrate with audit logging for critical user changes.
* Add middleware for enforcing user profile completeness or specific account states.

---

## Summary

`user.middleware.ts` is the domain-specific middleware layer focused on user-centric validations and checks. It should ensure data integrity, user existence, and permission correctness before controllers execute business logic. Adhering to clean coding standards and error handling best practices will maintain a robust, secure, and maintainable accounts module.

---