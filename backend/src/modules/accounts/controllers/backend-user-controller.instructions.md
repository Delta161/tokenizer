---
applyTo: `backend/src/modules/accounts/controllers/user.controller.ts`
---

**General Instructions for `user.controller.ts` Code Generation:**

This file is part of a modular Express.js backend written in TypeScript. It resides at:
 `backend/src/modules/accounts/controllers/user.controller.ts`

 The controller handles HTTP endpoints related to the authenticated user’s account.
 It follows a clean, layered architecture where the controller:

 * Receives incoming HTTP requests
 * Performs basic validation or session checks
 * Delegates business logic to the service layer (if needed)
 * Sends back structured JSON responses with appropriate HTTP status codes

 **Key conventions to follow:**

 * Use `async` functions with `try/catch` blocks
 * Handle errors using `next(error)` for centralized middleware
 * Check session status via `req.session?.user`
 * Return `401 Unauthorized` if the session is invalid
 * On success, return `200 OK` with `{ user }` JSON
 * No database or token logic inside controller — assume session middleware is responsible
 * Use `Request`, `Response`, and `NextFunction` from Express
 * Always use named exports for controller functions
 * Keep the controller thin — focus on routing and response formatting
 * Follow the existing modular structure (`controllers`, `services`, `routes`)
 * Ensure the controller is secure, only exposing necessary user data
 * Use TypeScript types for request and response objects
 * Maintain consistent error handling and response formats
 * Document the purpose of each endpoint clearly in comments
 * Ensure the controller is testable and adheres to best practices
 * Use appropriate HTTP methods (GET for fetching data, POST for updates, etc.)
 * Avoid direct database access — rely on services for data operations
 * Ensure the controller is idempotent where applicable
 * Use appropriate HTTP status codes for different outcomes (e.g., 200, 401, 404)
 * Ensure the controller is modular and reusable across different routes
 * Follow the existing coding style and conventions used in the project
 * Ensure the controller is compatible with the existing session management system
 * Ensure the controller is compatible with the existing authentication middleware
 * Ensure the controller is compatible with the existing authorization middleware
 * Ensure the controller is compatible with the existing error handling middleware
 * Ensure the controller is compatible with the existing logging middleware
 * Ensure the controller is compatible with the existing validation middleware
 * Ensure the controller is compatible with the existing rate limiting middleware
 * Ensure the controller is compatible with the existing CORS middleware
 * Ensure the controller is compatible with the existing security middleware
 * Ensure the controller is compatible with the existing compression middleware
 * Ensure the controller is compatible with the existing body parsing middleware
 * Ensure the controller is compatible with the existing cookie parsing middleware
 * Ensure the controller is compatible with the existing session management middleware



 This controller is meant to be lean, secure, and framework-aligned — it should serve as a read-only interface for retrieving user data already attached to the session.

---
