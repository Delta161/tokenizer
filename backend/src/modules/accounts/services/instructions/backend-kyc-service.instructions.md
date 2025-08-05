---
applyTo: 'backend/src/modules/accounts/services/kyc.service.ts'
---
# `kyc.service.ts` — Development & Usage Guidelines

This document provides detailed instructions for developers working with the `kyc.service.ts` file, located in `backend/src/modules/accounts/services`. It outlines the file's responsibilities, structure, and integration best practices.

---

## Purpose

The `kyc.service.ts` file manages all business logic related to the Know Your Customer (KYC) process. It abstracts database interactions and handles validation, processing, and retrieval of user verification information. It should remain decoupled from the transport layer (routes/controllers) and act as the single source of truth for KYC-related operations.

---

## Best Practices

* **Single Responsibility**: Only include business logic related to KYC handling. Do not mix concerns with authentication or user profile management.
* **Prisma Access**: This file should directly communicate with the Prisma client via the shared `prisma.ts` singleton.
* **Validation**: Validate input and internal data using Zod or a dedicated validation module before writing to the database.
* **Error Handling**: Use the `http-errors` package for standardized HTTP exceptions (e.g., `createError(404, 'KYC not found')`).
* **Logging**: Log key operations or failures using a centralized logger, not console.log.
* **Security**: Ensure sensitive data is encrypted or hashed as required by compliance.

---

## File Location

```txt
backend/
└── src/
    └── modules/
        └── accounts/
            └── services/
                └── kyc.service.ts
```

---

## Responsibilities

* Create or update a user's KYC record.
* Retrieve KYC status for a user.
* Validate the completeness and consistency of submitted documents.
* Handle KYC state transitions (e.g., pending → verified).
* Integrate with third-party KYC verification APIs (future enhancement).

---

## Integration Guidelines

1. **Importing the Service**:
   Use this service in the controller layer only:

   ```ts
   import { kycService } from '../services/kyc.service';
   ```

2. **Consuming Prisma**:
   Use the shared `prisma` instance:

   ```ts
   import { prisma } from '@/modules/shared/prisma';
   ```

3. **Returning Data**:
   Always return clean, serializable objects. Avoid leaking internal fields like `createdAt`, `updatedAt`, or raw Prisma instances unless explicitly needed.

4. **Error Handling**:
   Throw only `http-errors` and handle all known failure points. Example:

   ```ts
   if (!record) throw createError(404, 'KYC record not found');
   ```

---

## Naming Conventions

* Service methods should be named with action-context clarity:

  * `getUserKYCStatus(userId)`
  * `submitKYC(userId, data)`
  * `approveKYC(userId)`
  * `rejectKYC(userId, reason)`

---

## What Not To Do

* Do not define route handlers or controller logic here.
* Do not import `express`, `router`, or middleware in this file.
* Do not write unvalidated input directly to the database.
* Do not catch errors silently; all exceptions must be meaningful.

---

## Notes

* Future versions may include webhook support or document uploads to IPFS or S3.
* Consider role-based access for methods like `approveKYC`.

---

## Summary

The `kyc.service.ts` file is the central source of KYC logic for the backend. It should be modular, secure, and testable. By isolating all KYC functionality into this service, you maintain a clean architecture and ensure the KYC process can evolve independently of other modules.

Keep it minimal. Keep it focused. Keep it compliant.

---
