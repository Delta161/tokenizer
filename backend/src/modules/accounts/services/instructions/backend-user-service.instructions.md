---
applyTo: 'backend/src/modules/accounts/services/user.service.ts'
---

# `user.service.ts` — Development & Usage Guidelines

This document provides detailed guidelines for contributing to or consuming the `user.service.ts` file found at:

```txt
backend/src/modules/accounts/services/user.service.ts
```

---

## Purpose

The `user.service.ts` file contains business logic related to user management. It abstracts direct database access, ensuring a clear separation of concerns between services and controllers. Responsibilities include user creation, retrieval, updating, deletion, and search/filtering with pagination.

---

## Best Practices

* **Single Responsibility**: Limit the service to user-related operations (no authentication, KYC, or roles logic).
* **Prisma Only Through Singleton**: Always use the shared `prisma` instance for database operations.
* **Input Validation**: Ensure DTOs are validated externally before they reach this layer.
* **Consistent Error Handling**: Use centralized error utilities like `createNotFound`, `createBadRequest`.
* **Avoid Data Leakage**: Exclude sensitive fields from results unless explicitly needed.

---

## Key Functions and Responsibilities

### `getUsers()`

* Retrieves a paginated list of users.
* Supports filtering by role, full name, email, and date ranges.
* Sorting is customizable by creation date or other fields.

### `getUserById()`

* Returns a single user by their unique ID.
* Throws a 404 if user is not found.

### `createUser()`

* Creates a new user with fields provided in `CreateUserDTO`.
* Validates uniqueness of email.
* Sets default role to `INVESTOR` if not provided.

### `updateUser()`

* Updates user attributes from `UpdateUserDTO`.
* Validates user existence and unique email constraint.

### `deleteUser()`

* Permanently deletes a user by ID after confirming existence.

### (Deprecated) `changePassword()`

* This method is removed. The system uses OAuth for authentication.

---

## Integration Guidelines

### How to Import

```ts
import { userService } from '@/modules/accounts/services/user.service';
```

### Consuming Methods

* Service methods should only be used in the controller or higher layers (e.g., GraphQL resolvers).
* Do not call service methods from within other services unless absolutely necessary.

### Data Shape

* Return standardized `UserDTO` objects with explicitly selected fields.
* Avoid returning raw Prisma models to external layers.

### Error Handling

```ts
if (!user) throw createNotFound('User not found');
if (existingEmail) throw createBadRequest('Email already in use');
```

---

## Method Naming Conventions

* Use clear, action-oriented method names:

  * `createUser()`
  * `updateUser()`
  * `getUserById()`
  * `getUsers()`
  * `deleteUser()`

---

## Security Considerations

* Never expose passwords or tokens.
* Ensure that only fields allowed by the user’s role/permissions are updated.
* Email uniqueness should be enforced at both DB and service levels.

---

## What Not To Do

* Do not validate input inside service methods.
* Do not log sensitive user data (e.g., email, phone).
* Do not return full user records without selecting specific fields.
* Do not tightly couple this service with other modules like KYC or Auth.

---

## Future Improvements

* Add caching for heavy read operations like `getUsers()`.
* Support batch user updates and deletions.
* Introduce an audit log for tracking user changes.
* Abstract complex filtering into utility functions for reusability.

---

## Summary

The `user.service.ts` file is responsible for all backend user management logic. By adhering to strict separation of concerns, defensive programming, and standard DTO shapes, this file enables clean, maintainable, and scalable user operations within the system.

Follow these conventions for a predictable and robust codebase.

---
