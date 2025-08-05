---
applyTo: `backend/src/modules/accounts/types/ , backend/src/modules/accounts/*.types.ts`
---

# `accounts/types` Folder — Development & Usage Guidelines

This document provides detailed guidelines for organizing and using the `types` folder inside the **`accounts`** module, located at:

```txt
backend/src/modules/accounts/types/
```

---

## Purpose

The `accounts/types` folder contains all TypeScript type declarations specific to the **accounts** domain. This includes types for user management, authentication, KYC (Know Your Customer), roles, permissions, and related data structures used across services, controllers, middleware, and validators within the accounts module.

---

## Best Practices

* **Domain-Specific Types Only:** Include only types that relate directly to user accounts, authentication, and KYC.
* **Logical Grouping by Feature:** Organize types into separate files based on subdomain or functionality, such as:

  * `user.types.ts` for user-related interfaces and DTOs
  * `auth.types.ts` for authentication tokens, sessions, and OAuth profiles
  * `kyc.types.ts` for KYC data and statuses
* **Explicit Exports:** Export all types explicitly for clarity and maintainability.
* **No Business Logic:** Keep this folder limited to type declarations only — no runtime logic or implementation.
* **Clear Naming Conventions:** Use descriptive, consistent names for interfaces, enums, and DTOs (e.g., `UserDTO`, `KycStatus`, `CreateUserDTO`).
* **Documentation:** Add JSDoc comments to complex or non-obvious types for easier understanding and future maintenance.

---

## Typical Types in `accounts/types`

### User Types (`user.types.ts`)

* User entity interface
* Data Transfer Objects (DTOs) like `CreateUserDTO`, `UpdateUserDTO`
* Filter and sorting option types for user queries
* User roles and permissions enums or literal types

### Authentication Types (`auth.types.ts`)

* JWT token payload interfaces
* OAuth profile data structures
* Session and authentication response DTOs

### KYC Types (`kyc.types.ts`)

* KYC record interfaces
* KYC status enums
* Data shapes for submission and update operations

---

## Usage Guidelines

* **Import Types Where Needed:** Use these types consistently across the accounts module’s services, controllers, middleware, and validators.
* **Align with Validation:** Combine these static types with runtime validation schemas (e.g., using Zod) to ensure data correctness at both compile time and runtime.
* **Keep Types in Sync:** When modifying the data contracts related to accounts (user, auth, kyc), update the relevant types first.
* **Avoid Cross-Module Coupling:** Do not import types from unrelated modules to maintain loose coupling and modularity.
* **Use Type-Only Imports:** Use `import type` syntax to ensure imports do not add runtime code, helping tree shaking and build performance.

---

## Example File Structure

```
/modules/accounts/types/
  auth.types.ts
  kyc.types.ts
  user.types.ts
```

---

## Importing Example

```ts
import type { UserDTO, CreateUserDTO } from '@/modules/accounts/types/user.types';
import type { KycRecord, KycStatus } from '@/modules/accounts/types/kyc.types';
import type { OAuthProfile, AuthResponseDTO } from '@/modules/accounts/types/auth.types';
```

---

## Benefits Specific to Accounts Module

* **Consistency in Account Management:** Uniform user, auth, and KYC data structures reduce bugs and miscommunication across teams.
* **Easier Maintenance:** Clear separation of concerns in types improves module maintainability.
* **Improved Developer Experience:** Well-typed accounts data supports powerful IDE features and type safety.
* **Facilitates Modular Growth:** As the accounts module evolves, types can be expanded or refactored without impacting other modules.

---

## Summary

The `accounts/types` folder is the backbone for all TypeScript type declarations related to user accounts, authentication, and KYC processes. Proper organization and discipline in this folder ensures a robust, maintainable, and scalable accounts module.

---

