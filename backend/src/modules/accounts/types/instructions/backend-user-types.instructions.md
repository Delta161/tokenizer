---
applyTo: 'backend/src/modules/accounts/types/user.types.ts'
---

# `user.types.ts` — Development & Usage Guidelines

This document provides detailed guidelines for the **`user.types.ts`** file located at:

```
backend/src/modules/accounts/types/user.types.ts
```

---

## Purpose

The `user.types.ts` file defines all TypeScript interfaces, types, and DTOs related to the User domain within the accounts module. This includes data transfer objects for user creation, update, filtering, sorting, and public-facing views.

---

## Best Practices

* **Domain Specificity:** Keep only user-related types here, separating concerns from auth or KYC domains.
* **Reuse Prisma Enums:** Import enums like `AuthProvider` and `UserRole` (the latter from `auth.types.ts`) to maintain consistency with database schema.
* **Explicit DTOs:** Clearly distinguish between internal DTOs (`UserDTO`), public-facing DTOs (`UserPublicDTO`), and request payloads (`CreateUserDTO`, `UpdateUserDTO`).
* **Optional vs Required:** Mark optional fields explicitly to reflect their optional presence in update or creation flows.
* **Filter & Sort Types:** Provide dedicated interfaces for filtering and sorting parameters used in querying user lists.
* **Consistent Naming:** Use the `DTO` suffix for data transfer objects to clarify their usage context.
* **Minimal Exposure:** Keep sensitive fields (like `providerId`) internal and exclude from public DTOs.

---

## Core Types and Interfaces

### `UserDTO`

* Represents a full user record as used internally or returned by service layers.
* Contains fields like `id`, `email`, `fullName`, `providerId`, timestamps, `role`, and auth-related fields.
* Includes optional fields like `avatarUrl`, `phone`, `preferredLanguage`, and `timezone`.

### `UserPublicDTO`

* Contains only publicly safe user fields suitable for exposure via public APIs or UI.
* Includes basic identifiers like `id`, `email`, `fullName`, and `role`.

### `CreateUserDTO`

* Represents data required to create a new user.
* Password is omitted due to OAuth-only authentication.
* Optional fields like `role`, `phone`, and `timezone` allow for flexible creation.
* Requires `email`, `fullName`, `providerId`, and `authProvider`.

### `UpdateUserDTO`

* Represents data allowed for updating existing users.
* All fields are optional to support partial updates.
* Includes typical user profile fields such as `email`, `fullName`, `phone`, and `role`.

### `UserFilterOptions`

* Defines filtering parameters for user listing queries.
* Supports filtering by `role`, `search` string (name or email), and creation date ranges.

### `UserSortField` & `UserSortOptions`

* Enumerates sortable user fields (`fullName`, `email`, `createdAt`, `role`, `authProvider`).
* Defines sorting direction (`asc` or `desc`).
* Used to specify sorting behavior in user queries.

---

## Usage Guidelines

* **Use `import type`:** Import these types as type-only imports to avoid runtime overhead.
* **Validation:** Combine these static types with runtime validation libraries (e.g., Zod) at the request validation layer.
* **Service Layer Contracts:** Use these DTOs as method inputs and outputs in user services for consistent contracts.
* **Public APIs:** Use `UserPublicDTO` to expose safe user data without sensitive internal info.
* **Filter & Sort:** Use `UserFilterOptions` and `UserSortOptions` in controllers or services that implement user search or listing.

---

## Security Considerations

* **Sensitive Data:** Avoid exposing internal fields such as `providerId` or `authProvider` in public DTOs or APIs.
* **Partial Updates:** Ensure that update DTOs validate role changes and do not allow unauthorized elevation.
* **Immutable Fields:** Certain fields like `id` and `createdAt` should never be updated through user-facing APIs.

---

## What Not To Do

* Do not include authentication credentials or passwords (handled externally via OAuth).
* Avoid mixing unrelated domain types (e.g., do not include KYC or auth tokens here).
* Do not use these DTOs directly as ORM entities or database models.
* Avoid making DTOs too large or complex; split them logically as needed.

---

## Future Improvements

* Add types for additional user metadata or preferences.
* Introduce paginated response types specifically for user listings.
* Support roles and permissions more granularly via extended types.
* Add discriminated unions if user types become more complex (e.g., admin vs regular user).

---

## Summary

The `user.types.ts` file is the authoritative source for all User domain type definitions in the accounts module. Adhering to clear DTO distinctions, strong typing, and separation of public vs internal fields will enable a maintainable, secure, and robust user data model across the backend.

---