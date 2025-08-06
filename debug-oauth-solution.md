# OAuth Authentication Issue - Diagnosis and Solution

## Issue Summary
**Error**: "Authentication Failed - Failed to retrieve user profile" during OAuth callback

## Root Cause Analysis

Based on the code investigation, the issue is likely one of these:

### 1. **Environment Variables Not Loaded**
The JWT secret functions might be returning `undefined` because environment variables aren't properly loaded when the JWT utility functions are called.

**Evidence**: TypeScript compilation errors in `jwt.ts` suggesting `getJWTSecret()` might return undefined.

### 2. **Database Connection Issues** 
OAuth flow requires database access to:
- Find/create user during OAuth callback
- Store user session data
- Retrieve user profile for `/users/me` endpoint

**Evidence**: Error logs showing "Can't reach database server at `localhost:5432`"

### 3. **Timing Issue Between Cookie Setting and Profile Fetch**
Frontend immediately calls `/users/me` after OAuth redirect, but cookies might not be fully available.

## Solution Steps

### Step 1: Check Database Connection
```bash
# Make sure PostgreSQL is running
# Check connection string in backend/.env
DATABASE_URL="postgresql://username:password@localhost:5432/tokenizer"
```

### Step 2: Verify Environment Variables
Check that `backend/.env` has:
```env
JWT_SECRET=jmpeowjpoimmjeqotpqqjrp984jtoipqtjt5pmwjtv5j5w
JWT_REFRESH_SECRET=refresh-jmpeowjpoimmjeqotpqqjrp984jtoipqtjt5pmwjtv5j5w
SESSION_SECRET=super-secret-session-key-change-in-production-jmpeowjpoimmjeqotpqqjrp984jtoipqtjt5pmwjtv5j5w
GOOGLE_CLIENT_ID=501112770745-n6n4omncv5mne5qgdkuo22jvfbq8c2rc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Step 3: Apply Quick Fixes

#### Frontend Fix (Already Applied)
Added 1-second delay in `AuthCallback.vue` before fetching user profile:
```typescript
// Wait for cookies to be set
await new Promise(resolve => setTimeout(resolve, 1000));
```

#### Backend Debug Logging (Already Applied)
Added logging to:
- `authGuard` middleware to see cookies received
- OAuth success handler to see cookies being set

### Step 4: Test OAuth Flow

1. **Start Backend**:
   ```bash
   cd c:\Users\DamirSagi\Documents\tokenizer\backend
   npm run dev
   ```

2. **Start Frontend** (separate terminal):
   ```bash
   cd c:\Users\DamirSagi\Documents\tokenizer\frontend
   npm run dev
   ```

3. **Test OAuth**:
   - Navigate to `http://localhost:5173/login`
   - Click "Login with Google"
   - Complete OAuth flow
   - Check console logs and browser dev tools

### Step 5: Debug Information to Check

When testing, look for these console logs:

**Backend Console**:
```
🍪 OAuth Success Debug - Cookies set: { accessTokenLength: 123, ... }
🔍 AuthGuard Debug - Cookies received: { accessToken: "...", ... }
🔍 AuthGuard Debug - AccessToken cookie: "eyJ0eXAiOiJKV1QiLCJhb..."
```

**Frontend Console**:
```
🔄 OAuth callback: Waiting for cookies to be set...
🔄 OAuth callback: Fetching user profile...
✅ OAuth callback: Success! Redirecting to dashboard...
```

**Browser Dev Tools → Network Tab**:
- Check if `/users/me` request includes `Cookie` header with `accessToken`

### Step 6: Common Issues and Fixes

#### If "Token verification failed":
- Check JWT_SECRET environment variable is loaded
- Ensure same secret used for generation and verification
- Check token format in browser cookies

#### If "User not found":
- Check database connection
- Verify user creation during OAuth callback

#### If cookies not being sent:
- Check domain/path configuration
- Verify `sameSite` and `secure` settings
- Check CORS configuration

## Immediate Action
1. **Start both servers** using the `start-servers.ps1` script
2. **Test Google OAuth flow** and check console logs
3. **Report any specific error messages** you see in browser or server console

## Files Modified for Debugging
- ✅ `frontend/src/modules/Accounts/views/AuthCallback.vue` - Added timing delay
- ✅ `backend/src/modules/accounts/middleware/auth.middleware.ts` - Added cookie debugging
- ✅ `backend/src/modules/accounts/controllers/auth.controller.ts` - Added OAuth success logging

The debugging logs should help identify the exact point of failure in the authentication flow.
