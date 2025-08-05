---
applyTo: `backend/src/modules/accounts/controllers/user.controller.ts`
---

### 📄 File: `user.controller.ts`

**Purpose:**  
Handles HTTP endpoints related to user profile management and account operations.
Designed as a lightweight Express.js controller that communicates with the user service layer.

## 🏗️ MANDATORY BACKEND ARCHITECTURE - USER CONTROLLER

This controller is **Layer 3** in the mandatory 7-layer backend architecture:

**Route → Middleware → Validator → 🎯 USER CONTROLLER → User Service → Utils → Types**

### ✅ User Controller Responsibilities (Layer 3)

User controllers handle HTTP requests for user management:

- **Extract user data** from request (params, query, body)
- **Validate user session** and authentication state
- **Call user service methods** for user business logic
- **Handle user profile operations** (get, update, delete)
- **Format user responses** with proper HTTP status codes
- **Handle user-specific errors** by forwarding to error middleware

### ❌ What User Controllers Should NOT Do

- **NO user business logic** - delegate to user service
- **NO database calls** - user service handles all Prisma interactions
- **NO password hashing** - auth service handles authentication
- **NO direct user data processing** - use user service methods
- **NO OAuth handling** - auth controller handles OAuth flows
- **NO direct Prisma usage** - only services can use Prisma

### 🔄 User Controller Flow Pattern

```typescript
export const getCurrentUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Extract user context from middleware
    const userId = req.user?.id;
    
    // 2. Basic validation
    if (!userId) {
      throw createError(401, 'User not authenticated');
    }
    
    // 3. Call user service
    const userProfile = await userService.getUserProfile(userId);
    
    // 4. Return formatted response
    res.status(200).json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    next(error);
  }
};

export const updateCurrentUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Extract data
    const userId = req.user?.id;
    const updateData = req.body;
    
    // 2. Basic validation
    if (!userId) {
      throw createError(401, 'User not authenticated');
    }
    
    // 3. Call user service
    const updatedUser = await userService.updateUserProfile(userId, updateData);
    
    // 4. Return response
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};
```

### 🔐 User Management Operations

```typescript
// Admin-only user management
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const result = await userService.getAllUsers({
      page: Number(page),
      limit: Number(limit),
      search: search as string
    });
    
    res.status(200).json({
      success: true,
      data: result.users,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const user = await userService.getUserById(id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
```

### ✅ Architecture Compliance Rules

1. **User Service Only**: All user logic must be in user service
2. **No Prisma**: Controllers cannot directly use Prisma client
3. **Session Context**: Use req.user from authentication middleware
4. **Error Forwarding**: Use `next(error)` for centralized error handling
5. **Response Formatting**: Consistent JSON response structure

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
