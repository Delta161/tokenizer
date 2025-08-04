---
applyTo: 'backend/src/modules/accounts/controllers/, backend/src/modules/accounts/controllers/*.controller.ts'
---

**Prompt Instruction:**

In the `controllers` folder of a modular Express.js backend (`backend/src/modules/accounts/controllers/`), each file defines request-handling logic for a specific domain module (e.g., user authentication, account management).

These controller functions:

 * Handle incoming HTTP requests
 * Extract request data (params, query, body)
 * Invoke relevant service-layer methods to perform business logic
 * Return HTTP responses in a structured format (e.g., JSON with status codes)
 * Use centralized error handling (e.g., `next(error)`) and possibly async wrappers

 The folder currently includes:

 * `auth.controller.ts` — manages login, logout, OAuth callbacks, session checks
 * `user.controller.ts` — handles user-related endpoints like fetching profile info or updating account data
 * `kyc.controller.ts` — manages KYC (Know Your Customer) related operations
 * `index.ts` — exports all controllers for easy import

 No other files should be added to this folder.
 Temporary files created for testing or debugging should be deleted after use.

 The goal is to keep controllers lean, delegating logic to the `services` layer and maintaining separation of concerns.

 **Code style should follow:**

 * Express 5 async handlers
 * TypeScript with proper request/response typing (`Request`, `Response`, `NextFunction`)
 * Named exports for each handler function
 * Minimal business logic inside controller — should call corresponding service methods

 **Target use case:** Full-stack TypeScript app using Prisma, OAuth (Google/Azure), and modular feature folders.

---
