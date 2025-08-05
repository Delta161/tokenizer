---
applyTo: `backend/src/modules/accounts/services/*.service.ts`  
---

### 📁 `services/` Folder – Architecture & Best Practices

This folder contains all business logic and is the **ONLY place where the Prisma Client should be directly accessed**.

## 🏗️ MANDATORY BACKEND ARCHITECTURE - SERVICES LAYER

Services are **Layer 5** in the mandatory 7-layer backend architecture:

**Route → Middleware → Validator → Controller → 🎯 SERVICES → Utils → Types**

### ✅ Services Responsibilities (Layer 5)

Services are the **CORE BUSINESS LOGIC LAYER** where all the critical work happens:

- **Execute all business rules** and domain logic
- **Handle ALL database interactions** using Prisma client
- **Process complex workflows** (authentication, KYC verification, user management)
- **Coordinate data operations** (create, read, update, delete)
- **Implement business validations** (role checks, permissions, data consistency)
- **Handle third-party integrations** (KYC providers, external APIs)

### ✅ CRITICAL RULE: Prisma Usage

**🔒 ONLY SERVICES CAN USE PRISMA**

```typescript
// ✅ CORRECT - Inside service
export class UserService {
  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id }
    });
  }
}

// ❌ WRONG - Prisma in controller
export const getUser = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ ... }); // FORBIDDEN!
}
```

### 🔄 Service Layer Pattern

```typescript
export class AuthService {
  async authenticateUser(email: string, password: string) {
    // 1. Business validation
    if (!email || !password) {
      throw createError(400, 'Invalid credentials');
    }
    
    // 2. Database interaction (ONLY here!)
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    // 3. Business logic
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      throw createError(401, 'Authentication failed');
    }
    
    // 4. Complex workflow
    const tokens = this.generateTokens(user);
    await this.updateLastLogin(user.id);
    
    return {
      user: this.sanitizeUser(user),
      tokens
    };
  }
  
  private async updateLastLogin(userId: string) {
    // More Prisma usage - ONLY in services!
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    });
  }
}
```

### 📌 Structure

Only the following service files should exist here:

```
services/
│
├── auth.service.ts   // Handles OAuth logic, token generation, session validation
├── kyc.service.ts    // KYC flow: status checks, verification result handling, user identity
└── user.service.ts   // User profile handling, updates, and role management
└── index.ts         // Exports all services for easy imports
```

### ❌ What Services Should NOT Do

- **NO HTTP handling** - don't parse req/res objects
- **NO route logic** - controllers handle HTTP concerns
- **NO input validation** - validators handle schema validation
- **NO middleware logic** - keep services pure business logic

### ✅ Architecture Compliance Rules

1. **Prisma Exclusive**: ONLY services can use Prisma database client
2. **Business Logic Hub**: All domain logic must live in services
3. **Database Gateway**: Services are the only database access point
4. **Reusable Methods**: Services should be consumable by controllers, cron jobs, etc.
5. **Error Consistency**: Use http-errors for consistent error handling

### 🧪 Testing Note

Service methods should be independently testable with mocked Prisma clients.
