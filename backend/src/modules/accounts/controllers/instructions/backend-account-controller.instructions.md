---
applyTo: 'backend/src/modules/accounts/controllers/, backend/src/modules/accounts/controllers/*.controller.ts'
---

### 📁 Folder: `backend/src/modules/accounts/controllers/`

**Purpose:**  
This folder contains all Express.js controller modules responsible for handling HTTP requests related to account management. Controllers act as the interface layer between incoming API calls and the business logic encapsulated in the services layer.

## 🏗️ MANDATORY BACKEND ARCHITECTURE - CONTROLLERS LAYER

Controllers are **Layer 3** in the mandatory 7-layer backend architecture:

**Route → Middleware → Validator → 🎯 CONTROLLER → Service → Utils → Types**

### ✅ Controller Responsibilities (Layer 3)

Controllers handle the incoming HTTP request and prepare the HTTP response:

- **Extract data** from request (params, query, body)
- **Validate request data** (basic validation or use validators)
- **Call appropriate service functions** to perform business logic
- **Format and return responses** with proper HTTP status codes
- **Handle errors** by forwarding to error handling middleware

### ❌ What Controllers Should NOT Do

- **NO business logic** - delegate to services
- **NO database calls** - services handle all Prisma interactions
- **NO complex data processing** - use services and utils
- **NO authentication logic** - use middleware
- **NO direct Prisma usage** - only services can use Prisma

### 🔄 Controller Flow Pattern

```typescript
export const controllerFunction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Extract request data
    const { param } = req.params;
    const { query } = req.query;
    const data = req.body;
    
    // 2. Basic validation (or use validators)
    if (!data.required) {
      throw createError(400, 'Required field missing');
    }
    
    // 3. Call service layer
    const result = await serviceFunction(data);
    
    // 4. Return formatted response
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error); // Forward to error handling middleware
  }
};
```

### ✅ Architecture Compliance Rules

1. **Services Only**: All business logic must be in services layer
2. **No Prisma**: Controllers cannot directly use Prisma client
3. **Error Forwarding**: Use `next(error)` for centralized error handling
4. **Single Responsibility**: Each controller function handles one endpoint
5. **Type Safety**: Use TypeScript with proper Request/Response typing

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
