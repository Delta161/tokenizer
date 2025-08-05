---
applyTo: 'backend/src/modules/accounts/validators/user.validator.ts'
---

### 📄 File: `user.validator.ts`

This file defines all Zod-based schemas for validating user-related request data within the **Accounts module**, focusing on structured input validation, data safety, and ensuring consistent application behavior in OAuth-only environments.

---

### ✅ Purpose

* Ensure all input related to user creation, updates, queries, and filters is type-safe, sanitized, and conforms to application rules.
* Support domain-specific validation constraints without leaking business logic into controller or service layers.
* Strictly follow OAuth-only authentication, removing password-related concerns from the validation layer.

---

### 📦 Validation Schemas Overview

#### 1. **`createUserSchema`**

* Validates user creation requests.
* Ensures required fields (`email`, `fullName`, `authProvider`) are present and well-formed.
* Uses `.refine()` to enforce that `providerId` must be accompanied by a corresponding `authProvider`.
* Supports default assignment of `UserRole.INVESTOR` if no role is provided.

#### 2. **`createUserFromOAuthSchema`**

* Validates user creation using data from OAuth profiles.
* Enforces presence of essential fields like `providerId` and `authProvider`.
* Uses `.strict()` to disallow any unknown fields.
* Tailored for internal use when normalizing external provider data.

#### 3. **`updateUserSchema`**

* Validates partial updates to user profiles.
* All fields are optional but must match their respective type and format when present.
* Uses `.strict()` to ensure no extra data is sent unintentionally.

#### 4. **`userIdParamSchema`**

* Validates route parameters where a `userId` is expected.
* Ensures it is a valid UUID to prevent malformed queries or ID spoofing.

#### 5. **`userFilterSchema`**

* Supports filtering, sorting, and pagination of user records.
* Handles query parameters such as `role`, `search`, `createdAfter`, `createdBefore`, and pagination options.
* Limits page size via `limit.max(100)` to prevent resource-intensive queries.

---

### 🛡 Best Practices

* **Schema Composition**: Each schema is tailored to a specific use-case and should not be reused in unrelated contexts.
* **Strict Mode**: Use `.strict()` wherever possible to block unintentional or malicious payloads.
* **Type Alignment**: Align enum values (e.g., `UserRole`, `AuthProvider`) with those defined in shared types or the database schema for consistency.
* **Security-Oriented**: Exclude all password-related validation due to the exclusive use of OAuth 2.0 for authentication.
* **Graceful Validation**: Ensure clear error messages and safe handling of optional fields to improve developer experience and frontend feedback.

---

### 📌 Usage Context

These schemas should be used in:

* **Controllers**: To validate incoming data from HTTP requests.
* **Services**: To enforce data correctness before interacting with business logic or the database.
* **Routers/Middleware**: To validate request parameters (`userIdParamSchema`) before reaching controllers.

---

### 🧩 Extendability Notes

* Add additional refinement logic using `.superRefine()` if future inter-field validation is needed.
* For multilingual or localized apps, replace inline error messages with i18n-compatible error maps.
* Consider extracting reusable schema fragments for fields like pagination or timestamps across modules.

---

