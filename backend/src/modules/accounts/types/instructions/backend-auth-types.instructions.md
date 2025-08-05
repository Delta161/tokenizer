---
applyTo: '/backend/src/modules/accounts/types/auth.types.ts'
---

# `auth.types.ts` — Development & Usage Guidelines

This document provides comprehensive guidelines for the **`auth.types.ts`** file found at:

```
backend/src/modules/accounts/types/auth.types.ts
```

---

## Purpose

The `auth.types.ts` file defines TypeScript types and interfaces that represent data structures specific to the authentication domain within the accounts module. These include user DTOs, OAuth profile representations, token payloads, and authentication responses.

---

## Best Practices

* **Domain-Centric Types:** Contain only authentication and authorization related types such as token payloads, OAuth profiles, and user auth metadata.
* **Reuse Prisma Enums:** Import `UserRole` or other enums directly from Prisma to maintain consistency between DB schema and type definitions.
* **Clear Separation:** Authentication types should not include unrelated user domain fields; keep types focused and minimal.
* **Use Optional Properties Wisely:** Fields like `authProvider`, `avatarUrl`, and `lastLoginAt` are optional because they might not always be present depending on the auth flow.
* **Detailed OAuth Profile Types:** Provide detailed shape for common OAuth providers (Google, Azure) for better typings in OAuth handling.
* **Normalized Profiles:** Include a normalized profile interface to unify data from different OAuth providers into a common shape for easier processing.
* **Avoid Legacy DTOs:** As your system supports OAuth-only authentication, remove or archive DTOs related to password-based login or registration.

---

## Core Interfaces

### `UserDTO`

* Represents authenticated user data sent to frontend or other systems.
* Includes essential identity fields, role, timestamps, and optional OAuth-related metadata.
* Use this type as a baseline for authenticated user data transport.

### `AuthResponseDTO`

* Represents the typical payload returned after successful authentication.
* Contains user info plus access and refresh tokens.

### `TokenPayload`

* Defines JWT token payload shape.
* Includes minimal identifying data such as user ID, email, role, and optional issued-at and expiration timestamps.

### `OAuthProfileDTO`

* Raw profile data returned by generic OAuth providers.
* Flexible and loosely typed to cover a variety of OAuth responses.

### `NormalizedProfile`

* Unified type that normalizes multiple OAuth profiles to a common shape.
* Useful for downstream processing like user creation or update in your system.

### Provider-Specific Profiles (`GoogleProfile`, `AzureProfile`)

* Detailed types for common providers, reflecting the exact fields your application expects.
* Helps with type-safe extraction of profile data during OAuth flows.

---

## Usage Guidelines

* **Import Types Where Needed:** Use these types in OAuth service handlers, auth controllers, middleware, and user service when dealing with authenticated users.
* **Combine With Validation:** Use runtime validation libraries (e.g., Zod) alongside these static types to ensure safety both at compile time and runtime.
* **Maintain Synchronization:** Keep these types in sync with changes in OAuth provider APIs or your Prisma schema.
* **Use `import type` Syntax:** When importing these types, use `import type` to avoid runtime side effects.
* **Document Changes:** When adding or modifying OAuth profile types, comment on the provider version or API changes to keep track.

---

## Example Import Statements

```ts
import type { UserDTO, AuthResponseDTO, TokenPayload } from '@/modules/accounts/types/auth.types';
import type { OAuthProfileDTO, NormalizedProfile } from '@/modules/accounts/types/auth.types';
```

---

## Security Considerations

* **Minimal Exposure:** Do not expose sensitive tokens or internal-only fields via these types unless explicitly required.
* **Role Safety:** The `UserRole` enum ensures role-based authorization is consistent and type-safe.
* **Token Payload Integrity:** Ensure token payloads match these types strictly to avoid auth bypasses.

---

## What Not To Do

* Do not include business logic or utility functions in this file.
* Avoid coupling auth types with unrelated modules or domains.
* Do not store secret keys or passwords in these types.
* Avoid bloating interfaces with unnecessary optional fields.

---

## Future Improvements

* Add types for additional OAuth providers as your system grows.
* Introduce union types or discriminated unions if supporting multiple auth mechanisms.
* Create helper type guards or utility functions for common auth type checks.
* Version OAuth profile types if provider APIs change significantly.

---

## Summary

The `auth.types.ts` file is a cornerstone for all type-safe authentication-related data in the accounts module. By following clear separation, reusing enums, and detailed provider typing, this file ensures maintainable, secure, and predictable auth flows throughout your backend.

---
- **Keep it focused:** Ensure types are strictly related to authentication and authorization.
- **Use Prisma Enums:** Import enums directly from Prisma to maintain consistency.
- **Avoid Legacy DTOs:** Remove or archive any types related to password-based authentication if your system is now OAuth-only.
- **Normalize Profiles:** Use a unified profile type to handle data from various OAuth providers.
- **Document Changes:** Keep track of changes in OAuth provider APIs or your Prisma schema to maintain type integrity.
- **Security First:** Ensure sensitive data is not exposed and token payloads are strictly typed.
- **Use `import type`:** When importing these types, use `import type` to avoid runtime side effects.
