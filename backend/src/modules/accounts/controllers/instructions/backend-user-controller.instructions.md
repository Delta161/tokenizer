---
applyTo: `backend/src/modules/accounts/controllers/user.controller.ts`
---

### 📄 File: `user.controller.ts`

**Purpose:**  
Handles HTTP endpoints related to the currently authenticated user.  
Designed as a lightweight Express.js controller that communicates with the user service layer.  

---

### ✅ Core Responsibilities

- Handle HTTP requests for user account operations (e.g., fetching profile).
- Validate session presence (`req.session?.user`).
- Return `401 Unauthorized` if session is missing or invalid.
- Delegate business logic to `user.service.ts`.
- Send structured JSON responses with appropriate status codes.
- Avoid any direct database, token, or authentication logic.

---

### 🧱 Structural Conventions

- Use TypeScript: import `Request`, `Response`, `NextFunction` from `express`.
- Use `async` functions and `try/catch` blocks for error handling.
- Forward errors with `next(createHttpError(...))` using the `http-errors` package.
- Always use **named exports** for controller methods.
- Keep controller logic minimal; delegate to services.
- Follow RESTful HTTP method conventions (`GET`, `POST`, etc.).
- Only expose safe, minimal user data in responses.

---

### 🔐 Security & Middleware Expectations

- Assume session middleware has already attached the user to `req.session.user`.
- Do not access Prisma or DB logic directly — use the service layer.
- Avoid embedding business logic, authentication, or formatting logic in controller.
- Do not include any middleware, logging, or validation logic directly.
- Let centralized middleware handle:
  - Error handling
  - Logging
  - Validation
  - Authorization
  - Rate limiting
  - Security headers and CORS

---

### 📦 Output Format

- On success: `200 OK` with `{ user }` in JSON format.
- On session failure: `401 Unauthorized` using `createHttpError(401, 'Unauthorized')`.
- Use consistent, typed responses (e.g., define and use `UserResponse` type or DTO).

---

### 🧪 Testing & Maintainability

- Ensure endpoint behavior is deterministic and idempotent.
- Write controller-level tests mocking the user service.
- Document each endpoint with comments explaining purpose and expected behavior.

---

### ⚠️ Avoid

- No Prisma client access here.
- No token creation or decoding.
- No direct database queries.
- No session manipulation.
- No logging or metrics.

---

**Design Goal:**  
A clean, modular, secure Express controller — focused only on routing and response formatting — delegating all logic and state to the appropriate service.
