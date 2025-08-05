---
applyTo: 'backend/src/modules/accounts/middleware/kyc.middleware.ts'
---

# `kyc.middleware.ts` — Development & Usage Guidelines

This document provides detailed guidelines for understanding, maintaining, and extending the `kyc.middleware.ts` file located at:

```
backend/src/modules/accounts/middleware/kyc.middleware.ts
```

---

## Purpose

The `kyc.middleware.ts` file implements middleware focused on enforcing KYC (Know Your Customer) verification status for authenticated users in the system. It ensures that only users with verified KYC status can access certain protected routes or resources.

---

## Responsibilities

* Provide middleware to enforce KYC verification status.
* Ensure that only authenticated users with verified KYC can proceed.
* Log attempts and errors related to KYC checks for audit and debugging purposes.
* Respond with appropriate HTTP status codes and JSON error messages on failures.
* Integrate cleanly with authentication middleware and KYC service layers.

---

## Design & Implementation Details

### Singleton Pattern for Service Initialization

* The KYC service instance is lazily initialized using a singleton pattern via `getKycService()`.
* This ensures efficient reuse of the Prisma client and service instance across requests without repeated re-instantiation.

### Middleware Function: `requireKycVerified`

* **Placement:** Must be used **after** authentication middleware (`auth.middleware.ts`) because it depends on `req.user`.
* **Behavior:**

  * Verifies the presence of an authenticated user.
  * Uses the KYC service to check if the user’s KYC status is verified.
  * If not verified, it responds with a `403 Forbidden` and a detailed JSON error message indicating the need for KYC verification.
  * Logs each significant event (success, failure, unauthenticated access) with context (user ID, request path, HTTP method).
  * On unexpected errors, it returns a `500 Internal Server Error` response with a generic message.
* **Error Handling:** Includes robust try-catch with detailed logging and fallback HTTP error response.
* **Logging:** Uses both a general logger and a domain-specific logger (`accountsLogger`) to capture security-relevant events and errors.

---

## Best Practices & Recommendations

* **Middleware Ordering:** Always use `auth.middleware.ts` (e.g., `authGuard`) before `requireKycVerified` to guarantee `req.user` is populated.
* **Error Response Consistency:** Responses follow a JSON structure with fields `success`, `message`, `errorCode`, and `details`. This uniformity helps clients reliably interpret API errors.
* **Comprehensive Logging:**

  * Log all authentication and authorization failures with enough context to trace and diagnose issues.
  * Use both application-level logger and domain-specific logger for separation of concerns.
* **Separation of Concerns:**

  * Middleware only deals with request validation, authorization, and passing control.
  * All business logic and database interactions are delegated to the `KycService`.
* **Security Awareness:** Do not leak sensitive user information in error messages or logs.
* **Scalability:** Singleton service instance helps to prevent unnecessary overhead and promotes scalability.

---

## Integration Guidelines

### How to Use

In your route definitions or router files, import and use this middleware as follows:

```ts
import { requireKycVerified } from '@modules/accounts/middleware/kyc.middleware';
import { authGuard } from '@modules/accounts/middleware/auth.middleware';

// Example usage in Express router
router.get('/protected-route', authGuard, requireKycVerified, (req, res) => {
  res.json({ message: 'Access granted to verified user' });
});
```

### Dependencies

* Relies on `auth.middleware.ts` to authenticate the user first.
* Uses the singleton `KycService` for all business logic related to KYC status.
* Requires the presence of `req.user` which must include at least the user ID.

---

## Error Codes & Meaning

* `AUTH_REQUIRED`: No authenticated user found on request.
* `KYC_VERIFICATION_REQUIRED`: User’s KYC is not verified and access is denied.
* `KYC_CHECK_ERROR`: Unexpected error during KYC status verification (returns 500).

Clients should handle these error codes appropriately, e.g., redirect to login or KYC completion flows.

---

## Logging Details

* Logs warnings on unauthenticated access attempts to KYC-verified endpoints.
* Logs info on successful KYC verification checks.
* Logs errors with full stack traces when middleware fails unexpectedly.
* Logs to both general `logger` and `accountsLogger` (domain-specific) to support security audits.

---

## What Not To Do

* Do not perform KYC business logic or DB queries directly in middleware; delegate to `KycService`.
* Do not bypass authentication checks before KYC validation.
* Avoid exposing detailed internal errors to API consumers.
* Do not instantiate multiple KYC service instances per request; use singleton pattern.

---

## Future Improvements

* Implement additional KYC status checks (e.g., expiry, partial verification).
* Integrate with an external KYC provider to automate verification status updates.
* Add rate limiting or throttling for repeated KYC verification attempts.
* Support role-based or tiered access controls combining KYC status and roles.
* Improve error handling by forwarding errors to centralized error middleware using `next(error)` instead of direct response.

---

## Summary

The `kyc.middleware.ts` is a critical security layer that enforces KYC verification for protected routes. By adhering to separation of concerns, centralized logging, singleton pattern, and consistent error handling, it maintains a secure, maintainable, and extensible foundation for KYC enforcement in your system.

Use it strictly in combination with authentication middleware and delegate business logic to the service layer for best results.

---
