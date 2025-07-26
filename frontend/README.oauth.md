# OAuth2 Login Test Frontend

This is a minimal Vue 3 frontend for testing OAuth2 login flow with the Express.js backend.

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

- **Login Page** (`/login`): Provides buttons to login with Google or Azure
- **Callback Page** (`/callback`): Handles OAuth redirects and stores JWT
- **Profile Page** (`/profile`): Displays user data fetched from the backend

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
- `src/views/ProfilePage.vue`: User profile display

## Testing the OAuth Flow

1. Click "Login with Google" or "Login with Azure" on the login page
2. Complete the OAuth authentication process
3. You will be redirected back to the callback page
4. If successful, you will be redirected to the profile page
5. Your user profile information will be displayed