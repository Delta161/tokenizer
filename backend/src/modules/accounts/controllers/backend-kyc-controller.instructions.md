---
applyTo: `backend/src/modules/accounts/controllers/kyc.controller.ts`
---

**Code Generation Prompt for `kyc.controller.ts`:**

 Generate an Express controller in TypeScript for handling KYC (Know Your Customer) verification endpoints. The controller file is located at:
 `backend/src/modules/accounts/controllers/kyc.controller.ts`

 It defines handlers for submitting and retrieving KYC data per user. The logic is minimal and delegates data storage and retrieval to a service layer.

 **Controller Exports:**

 1. `submitKyc`: Accepts POST requests with KYC form data in the body. Validates the user from the session (`req.session.user`), passes the data to a service method to store KYC info. Returns a success message.
 2. `getKyc`: Accepts GET requests. Checks if the user is authenticated, then calls the service to fetch existing KYC data. Returns the data in JSON format.

 **Technical Requirements:**

 * Use `Request`, `Response`, and `NextFunction` from `express`.
 * All handlers must be `async` with `try/catch` for error handling.
 * Check for a valid session (`req.session?.user`). If missing, respond with `401 Unauthorized`.
 * On success, respond with `200 OK` and structured JSON.
 * On error, delegate to centralized error handler using `next(error)`.
 * No direct database interaction — assume KYC logic is handled in a separate service (e.g. `kycService`).

 **Conventions and Style:**

 * Use named exports for each handler function.
 * Return clean and predictable JSON responses.
 * Minimal logic in controller — enforce separation of concerns.
 * Follow modular Express structure (`controllers`, `services`, `routes` folders).

 **Used For:**

 * Storing KYC form inputs such as personal details, documents, etc.
 * Retrieving previously submitted KYC records for the logged-in user.

 **Security:**

 * Requires an active authenticated session to access both routes.
 * Relies on session-based authentication (likely via Passport.js).

---