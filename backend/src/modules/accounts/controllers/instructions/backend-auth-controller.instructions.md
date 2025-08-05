---
applyTo: 'backend/src/modules/accounts/controllers/auth.controller.ts'
---
# Backend Authentication Controller Instructions

### 📄 File: `auth.controller.ts`

**Purpose:**  
This controller handles all HTTP endpoints related to authentication and session management. It processes incoming requests for login, logout, OAuth callbacks, and token validation, delegating core business logic to the `auth.service.ts` while focusing solely on HTTP-level concerns.

## 🏗️ MANDATORY BACKEND ARCHITECTURE - AUTH CONTROLLER

This controller is **Layer 3** in the mandatory 7-layer backend architecture:

**Route → Middleware → Validator → 🎯 AUTH CONTROLLER → Auth Service → Utils → Types**

### ✅ Auth Controller Responsibilities (Layer 3)

Authentication controllers handle HTTP requests and prepare HTTP responses:

- **Extract credentials** from request (body, headers, cookies)
- **Basic validation** of authentication data format
- **Call auth service methods** for authentication logic
- **Handle OAuth callbacks** and redirect flows
- **Set/clear authentication tokens** in cookies/headers
- **Return authentication responses** with proper status codes

### ❌ What Auth Controllers Should NOT Do

- **NO token generation/validation logic** - delegate to auth service
- **NO password hashing/comparison** - auth service handles this
- **NO database user lookups** - services handle all Prisma interactions
- **NO OAuth provider communication** - use strategies or services
- **NO session storage logic** - use middleware and services
- **NO direct Prisma usage** - only services can use Prisma

### 🔄 Auth Controller Flow Pattern

```typescript
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Extract authentication data
    const { email, password } = req.body;
    
    // 2. Basic validation
    if (!email || !password) {
      throw createError(400, 'Email and password required');
    }
    
    // 3. Call auth service
    const authResult = await authService.authenticateUser(email, password);
    
    // 4. Set authentication tokens
    res.cookie('accessToken', authResult.accessToken, { httpOnly: true });
    
    // 5. Return response
    res.status(200).json({
      success: true,
      user: authResult.user
    });
  } catch (error) {
    next(error);
  }
};
```

### 🔒 OAuth Flow Handling

```typescript
export const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Extract OAuth data from request
    const { code } = req.query;
    
    // 2. Call auth service for OAuth processing
    const authResult = await authService.processGoogleAuth(code);
    
    // 3. Set tokens and redirect
    res.cookie('accessToken', authResult.accessToken, { httpOnly: true });
    res.redirect('/dashboard');
  } catch (error) {
    next(error);
  }
};
```

### ✅ Architecture Compliance Rules

1. **Auth Service Only**: All authentication logic must be in auth service
2. **No Prisma**: Controllers cannot directly use Prisma client
3. **Token Handling**: Only set/clear tokens, never generate/validate them
4. **OAuth Delegation**: Use auth service for OAuth provider communication
5. **Error Forwarding**: Use `next(error)` for centralized error handling

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
