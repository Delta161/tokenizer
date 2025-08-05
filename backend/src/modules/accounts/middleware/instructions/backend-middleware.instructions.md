---
applyTo: `backend/src/modules/accounts/middleware/*.middleware.ts`
---

# Middleware Folder: `backend/src/modules/accounts/middleware`

## 🏗️ MANDATORY BACKEND ARCHITECTURE - MIDDLEWARE LAYER

Middleware is **Layer 2** in the mandatory 7-layer backend architecture:

**Route → 🎯 MIDDLEWARE → Validator → Controller → Services → Utils → Types**

### ✅ Middleware Responsibilities (Layer 2)

Middleware functions run **before route handlers** and handle cross-cutting concerns:

- **Authentication checks** - verify user identity from tokens/sessions
- **Authorization enforcement** - check user permissions and roles
- **Request preprocessing** - attach user context to request object
- **Rate limiting** - protect against abuse and ensure fair usage
- **Logging** - track request information for monitoring
- **Input sanitization** - basic cleanup before validation

### ❌ What Middleware Should NOT Do

- **NO business logic** - delegate complex logic to services
- **NO database operations** - middleware should be lightweight and fast
- **NO direct Prisma usage** - only services can use Prisma
- **NO response formatting** - controllers handle responses
- **NO complex validation** - use validators for schema validation

### 🔄 Middleware Pattern

```typescript
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Extract authentication data
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    // 2. Basic validation
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // 3. Verify token (can call auth service for complex validation)
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Attach user context to request
    req.user = payload as AuthenticatedUser;
    
    // 5. Continue to next middleware/controller
    next();
  } catch (error) {
    next(error);
  }
};
```

### 🔒 Authentication Middleware Example

```typescript
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### 📌 Domain-Specific Middleware

This folder contains **domain-specific middleware** tailored to the Accounts module:

- **`auth.middleware.ts`** - Authentication and session management checks
- **`user.middleware.ts`** - User-specific access controls and validations  
- **`kyc.middleware.ts`** - KYC status checks and verification requirements

Unlike global middleware applied application-wide (e.g., CORS, security headers), this folder's middleware is specialized and scoped to **Accounts domain functionality**.

### ✅ Best Practices for Domain Middleware

1. **Single Responsibility**: Each middleware addresses one domain-specific concern
2. **Lightweight and Fast**: Avoid heavy computations or blocking operations
3. **Proper Express Types**: Use TypeScript Request, Response, NextFunction types
4. **Context Attachment**: Attach domain context to req object for downstream usage
5. **Error Handling**: Use next(error) for centralized error handling

### ✅ Architecture Compliance Rules

1. **Lightweight Processing**: Keep middleware fast and efficient
2. **No Business Logic**: Complex logic belongs in services
3. **No Prisma**: Only services can access the database
4. **Context Attachment**: Use req object to pass data to controllers
5. **Error Forwarding**: Use next(error) for centralized error handling
