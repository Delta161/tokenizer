# Migration Guide: Old Auth → New Auth Module

This guide helps you migrate from the existing authentication system to the new production-grade OAuth module.

## What Changed

### Old System
- Basic Google OAuth with minimal configuration
- Session-based authentication
- Limited error handling
- No role-based access control
- Manual user creation logic

### New System
- Production-grade OAuth 2.0 module
- JWT-based authentication with HTTP-only cookies
- Comprehensive error handling and logging
- Role-based access control (RBAC)
- Auto user provisioning
- Support for Google and Azure AD
- Modular, testable architecture

## Migration Steps

### 1. Files Replaced

The following files have been replaced or are no longer needed:

- ❌ `config/passport.js` → ✅ `modules/auth/strategies/`
- ❌ `routes/auth.routes.js` → ✅ `modules/auth/auth.routes.ts`
- ✅ Updated `app.js` to use new auth module

### 2. Database Schema Changes

The new system expects these fields in your User model:

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  fullName     String
  authProvider String   // Changed from 'provider'
  providerId   String   @unique
  avatarUrl    String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Relationships for role determination
  investor     Investor?
  client       Client?
}
```

**Migration Required**: If your current schema uses different field names, you'll need to:

1. Create a migration to rename fields:
   ```sql
   ALTER TABLE "User" RENAME COLUMN "provider" TO "authProvider";
   ```

2. Or update the auth service to match your existing schema

### 3. Environment Variables

Add these new environment variables to your `.env` file:

```env
# JWT Configuration (New - Required)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-refresh-token-secret-different-from-jwt

# Azure AD Support (New - Optional)
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=common
AZURE_REDIRECT_URL=http://localhost:3000/auth/azure/callback

# Updated Google Configuration
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Application URLs (New - Optional)
FRONTEND_URL=http://localhost:5173
```

### 4. Route Protection Updates

**Before:**
```javascript
// No built-in route protection
router.get('/:id', getInvestor);
```

**After:**
```javascript
import { requireAuth, requireOwnershipOrAdmin } from '../modules/auth/index.js';

// Protected with authentication and authorization
router.get('/:id', requireAuth, requireOwnershipOrAdmin('id'), getInvestor);
```

### 5. Frontend Integration Changes

**Authentication Flow:**

1. **Login URLs remain the same:**
   - `GET /auth/google` - Initiate Google OAuth
   - `GET /auth/azure` - Initiate Azure AD OAuth (new)

2. **New endpoints:**
   - `GET /auth/me` - Get current user info
   - `GET /auth/logout` - Logout user
   - `GET /auth/health` - Health check

3. **Response format changed:**
   ```json
   {
     "success": true,
     "user": {
       "id": "user-id",
       "email": "user@example.com",
       "fullName": "User Name",
       "role": "INVESTOR",
       "authProvider": "google"
     },
     "tokens": {
       "accessToken": "jwt-token",
       "refreshToken": "refresh-token"
     }
   }
   ```

### 6. Testing the Migration

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Test Google OAuth:**
   - Navigate to `http://localhost:3000/auth/google`
   - Complete OAuth flow
   - Check that JWT cookies are set

3. **Test protected routes:**
   ```bash
   # Should work with cookies
   curl -b cookies.txt http://localhost:3000/auth/me
   
   # Should require authentication
   curl http://localhost:3000/api/investors/some-id
   ```

4. **Test Azure OAuth (if configured):**
   - Navigate to `http://localhost:3000/auth/azure`
   - Complete Azure AD OAuth flow

## Rollback Plan

If you need to rollback:

1. Restore the old files:
   - `config/passport.js`
   - `routes/auth.routes.js`
   - Original `app.js`

2. Remove the new auth module:
   ```bash
   rm -rf modules/auth
   ```

3. Update imports in `app.js` back to the old system

## Common Issues

### 1. "Cannot find module" errors
- Ensure all imports use `.js` extensions for ES modules
- Check that TypeScript compilation is working

### 2. "JWT verification failed"
- Verify `JWT_SECRET` is set and consistent
- Check that cookies are being sent with requests

### 3. "User not found" after OAuth
- Check database connection
- Verify Prisma schema matches expectations
- Check that auto-provisioning is working

### 4. OAuth redirect errors
- Verify callback URLs in OAuth provider settings
- Check environment variables are correct
- Ensure protocol (http/https) matches

## Benefits After Migration

✅ **Security**: JWT tokens, HTTP-only cookies, secure session handling
✅ **Scalability**: Stateless authentication, modular architecture
✅ **Maintainability**: Clean separation of concerns, comprehensive error handling
✅ **Flexibility**: Role-based access control, multiple OAuth providers
✅ **Production-ready**: Logging, health checks, proper error responses
✅ **Developer Experience**: TypeScript support, comprehensive documentation

## Support

If you encounter issues during migration:

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test OAuth provider configurations
4. Review the README.md for detailed setup instructions