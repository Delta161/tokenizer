---
applyTo: 'backend/src/modules/accounts/controllers/auth.controller.ts'
---

**Prompt Instruction for `auth.controller.ts`:**

> The `auth.controller.ts` file defines Express route handlers for authentication-related functionality using OAuth 2.0 and sessions.
>
> It is written in TypeScript and adheres to modular Express.js architecture. This controller handles user login, logout, session verification, and OAuth redirection callbacks. The logic is asynchronous and uses service-layer delegation.
>
> **Functional Overview:**
>
> * `getSession`: Returns authenticated user info from the session (if logged in).
> * `googleRedirectCallback`: OAuth 2.0 callback for Google login. Extracts the user from the request and redirects with a session token.
> * `azureRedirectCallback`: Same as above, but for Azure AD strategy.
> * `logout`: Destroys the current session, clears cookies, and sends a logout success message.
>
> **Technical Design:**
>
> * Uses `Request`, `Response`, and `NextFunction` from Express.
> * Each controller function is `async` and safely wrapped with `try/catch`.
> * Follows the pattern: extract user/session, delegate logic, send standardized response.
> * Returns JSON responses with status codes (`200 OK`, `401 Unauthorized`, etc.).
> * On error, uses `next(error)` for centralized error handling.
>
> **Dependencies and Assumptions:**
>
> * Session is available via `req.session`, populated by Passport.js.
> * OAuth logic is handled in Passport middleware prior to controller execution.
> * Uses a redirect query pattern like `/?token=...` to pass session info to frontend after login.
>
> **Best Practices Followed:**
>
> * Clear separation of concerns — no business logic inside controller.
> * Secure session management (session destruction, cookie clearing).
> * Compliant with OAuth redirect flows.
> * No direct database calls — relies on Passport to authenticate user.

---