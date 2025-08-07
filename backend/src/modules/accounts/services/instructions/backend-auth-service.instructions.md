---
applyTo: 'backend/src/modules/accounts/services/auth.service.ts'
---

# General Instructions for `auth.service.ts`

This file defines the `AuthService` class and is responsible for handling **all business logic related to user authentication** via **OAuth-based workflows**. It adheres to best practices in service-layer design within a modular Express.js + Prisma + TypeScript stack.

**⚠️ IMPORTANT REFACTORING CHANGE:**
- **Profile-related functions have been MOVED to `user.service.ts`**
- **This service now ONLY handles authentication actions**
- **User profile management is handled by the User Service**

---

## 📁 Location
`backend/src/modules/accounts/services/auth.service.ts`

---

## 🎯 Purpose

`AuthService` encapsulates **authentication logic ONLY**, including:

- ✅ Verifying access and refresh tokens
- ✅ Normalizing and validating OAuth profiles
- ✅ Handling user creation or updating from OAuth data
- ✅ Issuing new JWT tokens
- ✅ Session management and OAuth provider integrations
- ❌ **NO LONGER:** User profile retrieval (moved to user.service.ts)
- ❌ **NO LONGER:** User statistics (moved to user.service.ts)

The controller should **delegate authentication logic** to this service and **user profile logic** to the user service.

---

## ⚙️ Design Principles

- **Layered architecture:** Business logic lives in this service, while request handling is done by controllers.
- **Authentication focus:** This service ONLY handles authentication, NOT user profile management.
- **Token management:** Generates and verifies JWT access and refresh tokens using utility functions.
- **Data safety:** Always sanitizes user data before returning it.
- **OAuth-only:** Registration and login are supported only via third-party OAuth providers (e.g., Google, Azure).
- **Centralized error handling:** Uses custom error factories (`createUnauthorized`, `createNotFound`, `createBadRequest`) from the shared middleware.
- **Separation of concerns:** User profile operations are handled by `user.service.ts`

---

## 🧩 Public Methods

### 1. `verifyToken(token: string): Promise<UserDTO>`
- Validates the JWT access token.
- Fetches user by ID.
- Throws `401 Unauthorized` or `404 Not Found` when invalid.
- Returns sanitized `UserDTO`.

---

### 2. `findUserByEmail(email: string): Promise<UserDTO | null>`
- Looks up a user by their email address.
- Returns sanitized user or `null`.

---

### 4. `findUserByProviderId(providerId: string, provider: AuthProvider): Promise<UserDTO | null>`
- Fetches user using the OAuth provider ID and provider type.
- Useful for login/merge logic.

---

### 5. `processOAuthLogin(profile: OAuthProfileDTO): Promise<AuthResponseDTO>`
- Handles full OAuth login flow:
  - Maps, validates, and normalizes the profile
  - Checks for existing user by provider or email
  - Creates or updates user if needed
  - Logs successful or failed logins
  - Returns tokens and sanitized user

---

## 🔐 Private Methods

### `sanitizeUser(user: any): UserDTO`
- Removes sensitive fields (e.g., `_password`).
- Ensures consistent safe user data for external use.

---

## 🛠 Dependencies

- **Prisma Client** for database access
- **Custom JWT utilities** (`generateAccessToken`, `verifyToken`, etc.)
- **Zod validation schemas** for input validation
- **OAuth profile mapping utils**
- **Shared error-handling utilities** (`createBadRequest`, `createUnauthorized`, etc.)
- **Logger** for observability

---

## 🔒 Security Considerations

- Verifies tokens securely with fallbacks.
- Protects sensitive user fields.
- Generates placeholder email addresses when missing.
- Logs all major authentication flows and failures.
- Defensively validates all OAuth input.

---

## ✅ Best Practices Enforced

- No request/response logic inside service
- No use of Express types (`Request`, `Response`, etc.)
- Stateless and testable business logic
- Dependency-injected Prisma instance
- Pure functions where possible
- Separation of concerns: validation, token, and DB logic are modularized
- Follows naming conventions and modular folder structure

---

## ⛔ Not Allowed

- No use of session data
- No direct handling of HTTP response or request
- No hardcoded secrets (relies on JWT utilities)
- No raw user return without sanitization
- No duplicate user creation without validation

---

## 🧪 Testability

This service is designed to be **fully unit testable** by mocking the Prisma client and utilities.

---

## 📦 Exported Interface

- `authService`: A singleton instance used across the app.

---

## ✅ Summary

This file provides a robust, modular, and secure foundation for OAuth-based authentication. It strictly separates business logic from routing and data access, ensuring maintainability, extensibility, and clean architecture principles.

Only this service file (`auth.service.ts`) should be used for handling all authentication workflows in the backend.

---
