# OAuth2 Session-Based Authentication Frontend

This is a Vue 3 frontend for session-based OAuth2 authentication with the Express.js backend.

## 🔐 **Authentication Architecture**

**IMPORTANT**: This frontend uses **session-based authentication only**. No JWT tokens are used.

### Session-Based OAuth Flow:
1. User clicks "Login with Google/Microsoft/Apple"
2. Redirected to OAuth provider
3. Provider redirects to backend callback
4. **Backend creates session automatically**
5. **Direct redirect to dashboard** (no frontend callback processing needed)
6. All API requests use HTTP-only session cookies
7. Session persists until logout or expiration

## Setup

1. Make sure the backend is running on port 3000:
   ```
   cd backend
   npm run dev
   ```

2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

3. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

4. Visit http://localhost:5173/login in your browser

## Features

- **Login Page** (`/login`): Provides buttons to login with OAuth providers
- **Callback Page** (`/auth/callback`): **Only displays OAuth errors** (success redirects to dashboard)
- **Dashboard**: Authenticated user landing page with session-based access
- **Session-Based API**: All requests use HTTP-only cookies, no token management needed

## Environment Variables

The frontend uses the following environment variables:

- `VITE_API_BASE_URL`: The base URL of the API (default: http://localhost:3000)

## Architecture

Authentication functionality is implemented in the `Accounts` module, which handles:
- User authentication (login, registration, password reset)
- OAuth authentication (Google, Azure)
- User profile management
- Authorization and access control

## Files

- `src/modules/Accounts`: Module containing all authentication and user account functionality
- `src/api.js`: Axios instance for API requests
- `src/router/index.js`: Vue Router configuration
- `src/views/LoginPage.vue`: Login page with OAuth buttons
- `src/views/CallbackPage.vue`: OAuth callback handler
- `src/modules/Accounts/components/UserProfile.component.vue`: Reusable user profile component
- `src/modules/Accounts/views/UserProfile.view.vue`: User profile page with layout and logout functionality

## Testing the Session-Based OAuth Flow

1. Click "Login with Google", "Login with Microsoft", or "Login with Apple" on the login page
2. Complete the OAuth authentication process with the provider
3. **You will be redirected directly to the dashboard** (no callback page processing)
4. Your session is automatically created and managed server-side
5. Navigate to different pages - authentication persists via session cookies
6. Use logout button to destroy session and return to login page

### 🚨 **Important Changes from JWT-Based Flow:**
- **No callback page processing** - OAuth success redirects directly to dashboard  
- **No token storage** - Authentication handled via HTTP-only session cookies
- **No manual profile fetching** - Session contains user information automatically
- **Simplified error handling** - Only OAuth errors are displayed on callback page