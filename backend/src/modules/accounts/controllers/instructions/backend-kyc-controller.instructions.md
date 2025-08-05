---
applyTo: `backend/src/modules/accounts/controllers/kyc.controller.ts`
---

### 📄 File: `kyc.controller.ts`

**Purpose:**  
Handles KYC (Know Your Customer) operations for authenticated users.  
Provides two endpoints: one for submitting KYC data and one for retrieving it.

---

### 🧱 Structure

**Exports:**
1. `submitKyc`:  
   - `POST` endpoint for submitting user KYC form data.  
   - Requires authenticated session.  
   - Passes sanitized input to `kycService` for persistence.  
   - Returns `200 OK` and success confirmation on success.

2. `getKyc`:  
   - `GET` endpoint for retrieving previously submitted KYC data.  
   - Requires authenticated session.  
   - Delegates fetch logic to `kycService`.  
   - Returns `200 OK` and user’s KYC JSON data.

---

### ✅ Coding Standards

- Use `async` functions with `try/catch` blocks.
- Import `Request`, `Response`, and `NextFunction` from `express`.
- Use `http-errors` to throw standardized errors (e.g., `createHttpError(401, 'Unauthorized')`).
- Validate `req.session?.user`; if not present, throw `401 Unauthorized`.
- On success, return JSON responses with relevant data and HTTP status.
- On failure, forward errors using `next(error)` — no direct error formatting.

---

### 🔒 Security & Privacy

- KYC endpoints **must** only be accessible to authenticated users.
- Assume session-based auth (e.g., via Passport.js).
- Do **not** log or expose KYC payloads or sensitive fields.
- No access should be allowed without `req.session.user`.

---

### 🚫 Anti-Patterns to Avoid

- ❌ No direct Prisma/database logic here.
- ❌ No token or authentication logic inside controller.
- ❌ No input validation here — delegate to middleware or service layer.
- ❌ Do not access files or handle document uploads — assume handled elsewhere.

---

### 🧪 Testing & Best Practices

- Ensure controller methods are unit-testable (mock services).
- Use named exports for clarity and consistency.
- Follow modular structure: delegate logic to `services/kyc.service.ts`.
- Ensure handlers are idempotent and safe against repeated submissions.
- Sanitize outputs — never return internal fields (e.g., DB IDs or internal status flags).

---

### ⚙️ Usage Context

This controller assumes:
- Middleware for authentication and session is already applied.
- `kycService` is responsible for all data persistence and retrieval.
- Full-stack TypeScript app using Express 5, Prisma, and session-based auth.

---

**Design Goal:**  
A lean, secure, modular controller that performs session checks, delegates to the service layer, and handles KYC operations with strict adherence to privacy and architectural separation.
