---
applyTo: 'backend/src/modules/accounts/controllers/, backend/src/modules/accounts/controllers/*.controller.ts'
---

### 📁 Folder: `backend/src/modules/accounts/controllers/`

**Purpose:**  
This folder contains all Express.js controller modules responsible for handling HTTP requests related to account management. Controllers act as the interface layer between incoming API calls and the business logic encapsulated in the services layer.

---

### ✅ Responsibilities of Controller Functions

- Handle incoming HTTP requests (e.g., params, query, body extraction).
- Call appropriate service-layer methods to execute business logic.
- Return structured HTTP responses with appropriate status codes (usually JSON).
- Use async/await and forward errors to centralized error handling middleware via `http-errors`.
- Use the `http-errors` to create and manage HTTP errors consistently.
- Keep functions short, focused, and single-responsibility.
- Avoid direct database access or complex business logic inside controllers.
- Basic input validation can be done here or delegated to middleware.

---

### 📂 Folder Contents

- `auth.controller.ts` — Authentication flows: login, logout, OAuth callbacks, session management.
- `user.controller.ts` — User profile retrieval and updates.
- `kyc.controller.ts` — KYC-specific operations.
- `index.ts` — Barrel file exporting all controller modules.

No other files should be added here. Temporary/debug files must be removed promptly.

---

### 🎯 Code Style & Best Practices

- Use **Express 5 async route handlers** with `async/await`.
- Use **TypeScript** with strongly typed parameters: `Request`, `Response`, `NextFunction`.
- Use **named exports** for all handler functions.
- Delegate all business logic and database interactions to the services layer.
- Controllers should not handle authentication, authorization, or data persistence directly.
- Use the `http-errors` package to create HTTP errors, and forward them using `next(error)` for centralized error handling.
- Avoid logging or session management beyond basic session middleware hooks.
- Validate and sanitize inputs preferably using middleware or shared validators.

---

### 🧪 Testing & Documentation

- Write unit tests for controllers that mock service calls.
- Test success and failure scenarios, including error propagation.
- Use JSDoc or TSDoc comments to document function purpose, input expectations, and output formats.

---

### 🔒 Security Notes

- Ensure controllers respect middleware security checks (auth, rate limiting).
- Do not expose sensitive information in responses.
- Sanitize all user inputs early in the request lifecycle.

---

### ⚙️ Intended Use Case

Designed for a full-stack TypeScript backend using Prisma ORM, OAuth (Google, Azure), modular feature-based architecture, and centralized error handling powered by `http-errors`.

---
