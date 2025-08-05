---
applyTo: 'backend/src/modules/accounts/controllers/auth.controller.ts'
---
# Backend Authentication Controller Instructions

### 📄 File: `auth.controller.ts`

**Purpose:**  
This controller handles all HTTP endpoints related to authentication and session management. It processes incoming requests for login, logout, OAuth callbacks, and token validation, delegating core business logic to the `auth.service.ts` while focusing solely on HTTP-level concerns.

---

### ✅ Key Responsibilities

- Parse and validate HTTP requests related to authentication flows.
- Call appropriate methods from the authentication service layer.
- Manage session initialization, renewal, and destruction.
- Handle OAuth provider callbacks and user info retrieval.
- Return well-structured JSON responses with relevant HTTP status codes.
- Forward errors to centralized error-handling middleware using `next(error)`.

---

### 🚫 What This Controller Should Avoid

- **Business logic:** No token generation, validation, or user persistence here — delegate to `auth.service.ts`.
- **Direct database access:** Prisma client calls belong in the service layer.
- **Complex validation:** Basic request checks allowed; detailed validation should happen in middleware or service.
- **Logging and metrics:** Should be centralized outside controller.
- **Security enforcement:** Authorization and permission checks should be done before or inside service methods.
- **State management outside sessions:** Keep session management minimal and stateless where possible.

---

### ⚙️ Design Patterns & Best Practices

- Use `async`/`await` for asynchronous operations.
- Always wrap async route handlers in `try/catch` and pass errors to `next(error)`.
- Validate request data at middleware level and trust sanitized input in controller.
- Do not parse or manipulate tokens directly in controller; call service methods.
- Use HTTP status codes consistently (e.g., 200 OK, 401 Unauthorized, 400 Bad Request).
- Return clear and concise JSON responses, e.g., `{ success: true, data: { ... } }` or `{ error: "Description" }`.
- Keep controller methods short and focused — ideally one method per route.

---

### 🔒 Security Considerations

- Ensure sessions are checked and valid before sensitive operations.
- Sanitize inputs to prevent injection and other common attacks.
- Use HTTPS and secure cookies as configured in middleware.

---

### 🧪 Testing Guidance

- Write unit tests that mock the `auth.service.ts` methods.
- Test all HTTP routes for success, failure, and edge cases.
- Use integration tests to verify full OAuth flows if possible.

---

### 📚 Documentation & Comments

- Use clear JSDoc-style comments on exported controller functions.
- Document expected input parameters, response shapes, and error conditions.
- Link to related service methods where applicable.

---

Let me know if you want me to create similar instructions for other controllers or service files!
```

---
