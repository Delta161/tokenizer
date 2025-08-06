# OAuth Authentication Debug Summary

## Issue Identified
**"Authentication Failed - Failed to retrieve user profile"** error during OAuth callback

## Root Cause Analysis

### Flow Analysis:
1. **OAuth callback succeeds** → Backend `handleOAuthSuccess` sets `accessToken` and `refreshToken` cookies
2. **Frontend AuthCallback.vue** calls `handleOAuthCallback()`  
3. **Auth store** calls `AuthService.getCurrentUser()` → `userService.getCurrentUser()`
4. **Frontend makes GET request** to `/api/v1/users/me`
5. **Backend authGuard middleware** extracts token from `req.cookies.accessToken`
6. **Token validation fails** → "Token verification failed" (seen in logs)

### Key Findings:

1. **Cookie Setting**: ✅ `setTokenCookies()` function looks correct
   - Sets `accessToken` and `refreshToken` with proper `httpOnly`, `secure`, `sameSite` settings
   - Domain configuration looks good (`localhost` for dev)

2. **Passport Configuration**: ✅ Strategies properly configured
   - Google strategy configured with correct client ID/secret
   - Serialization/deserialization implemented
   - Session management properly initialized

3. **Error Pattern**: 🔴 Multiple "Token verification failed" in logs
   - Logs show: "2025-08-05 21:32:12:3212 error: Error: Unknown authentication strategy 'google'"
   - Logs show: "2025-08-03 12:59:57:5957 error: Token verification failed"

## Potential Issues:

### 1. **Timing Issue**
- Frontend making `/users/me` request immediately after OAuth redirect
- Cookies might not be fully set/available when subsequent request is made

### 2. **Cookie Domain/Path Mismatch**
- OAuth callback sets cookies on backend domain
- Frontend requests might not include these cookies

### 3. **Token Generation Issue**
- OAuth success handler might be generating invalid tokens
- JWT verification failing in `authGuard` middleware

### 4. **Session vs Token Confusion**
- OAuth callback uses Passport sessions but sets JWT tokens
- Possible conflict between session-based and token-based auth

## Debugging Steps to Try:

### Immediate Fix Attempt:
```typescript
// In AuthCallback.vue, add a small delay before fetching user profile:
onMounted(async () => {
  try {
    // Add small delay to ensure cookies are set
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await authStore.handleOAuthCallback();
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
    
  } catch (err: any) {
    console.error('OAuth callback error:', err)
    error.value = err.message || 'Failed to complete login. Please try again.'
  } finally {
    loading.value = false
  }
})
```

### Cookie Debug:
Add logging to see if cookies are being sent:
```typescript
// In authGuard middleware, add this debug line:
console.log('🔍 Cookies received:', req.cookies);
console.log('🔍 AccessToken cookie:', req.cookies?.accessToken);
```

### Backend Debug:
Add logging in handleOAuthSuccess:
```typescript
// After setTokenCookies call:
logger.info('🍪 Cookies set successfully', {
  accessTokenLength: accessToken.length,
  refreshTokenLength: refreshToken.length,
  cookies: res.getHeaders()['set-cookie']
});
```

## Recommended Fix Order:
1. ✅ **Check database connection** - OAuth needs working DB for user lookup
2. ✅ **Add timing delay** - Simple 500ms delay before profile fetch
3. ✅ **Add cookie debugging** - Log cookies being sent/received
4. ✅ **Verify token generation** - Ensure JWT tokens are valid
5. ✅ **Test OAuth flow end-to-end** - Full authentication flow validation

## Quick Test:
Run the start-servers script and test Google OAuth:
1. Navigate to `http://localhost:5173/login`
2. Click "Login with Google"
3. Complete OAuth flow
4. Check browser dev tools → Network tab → `/users/me` request
5. Check if `accessToken` cookie is being sent
