# Authentication Module

A production-grade OAuth 2.0 authentication module for Express.js applications, specifically designed for real estate tokenization platforms.

## Features

- **OAuth 2.0 Only**: No username/password authentication - secure OAuth flows only
- **Multi-Provider Support**: Google and Azure AD authentication
- **Auto User Provisioning**: Automatic user registration on first login
- **JWT-Based Authentication**: Stateless authentication with HTTP-only cookies
- **Role-Based Access Control**: Comprehensive RBAC with hierarchical permissions
- **TypeScript Support**: Fully typed with comprehensive interfaces
- **Production Ready**: Error handling, logging, and security best practices
- **Modular Design**: Clean separation of concerns and reusable components

## Supported Providers

- **Google OAuth 2.0** (`passport-google-oauth20`)
- **Azure Active Directory** (`passport-azure-ad`)

## Installation & Setup

### 1. Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# JWT Configuration (Required)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-token-secret-different-from-jwt

# Google OAuth (Required for Google auth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Azure AD OAuth (Required for Azure auth)
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=common
AZURE_REDIRECT_URL=http://localhost:3000/auth/azure/callback

# Application URLs (Optional)
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# Database (Prisma)
DATABASE_URL=your-database-connection-string
```

### 2. OAuth Provider Setup

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)

#### Azure AD Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Set redirect URI to:
   - `http://localhost:3000/auth/azure/callback` (development)
   - `https://yourdomain.com/auth/azure/callback` (production)
5. Go to "Certificates & secrets" → "New client secret"
6. Note down the client ID and secret

### 3. Integration with Express App

```typescript
import express from 'express';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { initializeAuth, authRoutes } from './modules/auth/index.js';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware (minimal for OAuth)
app.use(session({
  secret: process.env.JWT_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Initialize authentication module
initializeAuth();

// Mount authentication routes
app.use('/auth', authRoutes);

// Your other routes...
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/auth/health` | Health check | No |
| GET | `/auth/google` | Initiate Google OAuth | No |
| GET | `/auth/google/callback` | Google OAuth callback | No |
| GET | `/auth/azure` | Initiate Azure AD OAuth | No |
| POST | `/auth/azure/callback` | Azure AD OAuth callback | No |
| GET | `/auth/me` | Get current user | Yes |
| GET | `/auth/logout` | Logout user | No |
| POST | `/auth/refresh` | Refresh tokens | No |

### Example Responses

#### Successful Authentication
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "INVESTOR",
    "authProvider": "google",
    "avatarUrl": "https://..."
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  },
  "message": "Authentication successful"
}
```

#### Current User Info
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "INVESTOR",
    "authProvider": "google"
  },
  "message": "User information retrieved successfully"
}
```

## Middleware Usage

### Basic Authentication

```typescript
import { requireAuth } from './modules/auth/index.js';

// Protect a route
app.get('/protected', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
```

### Role-Based Access Control

```typescript
import { requireRole, requireAdmin, requireMinRole } from './modules/auth/index.js';

// Require specific role
app.get('/admin-only', requireAuth, requireAdmin, (req, res) => {
  res.json({ message: 'Admin access granted' });
});

// Require minimum role level
app.get('/client-area', requireAuth, requireMinRole('CLIENT'), (req, res) => {
  res.json({ message: 'Client or higher access' });
});

// Require any of multiple roles
app.get('/multi-role', requireAuth, requireRole(['CLIENT', 'ADMIN']), (req, res) => {
  res.json({ message: 'Multi-role access' });
});
```

### Resource Ownership

```typescript
import { requireOwnershipOrAdmin } from './modules/auth/index.js';

// User can only access their own resources (or admin can access any)
app.get('/users/:userId/profile', requireAuth, requireOwnershipOrAdmin('userId'), (req, res) => {
  res.json({ message: 'Access granted to user resource' });
});
```

## User Roles

The system supports three hierarchical roles:

1. **INVESTOR** (Level 1) - Default role for new users
2. **CLIENT** (Level 2) - Higher privileges than investor
3. **ADMIN** (Level 3) - Full system access

### Role Assignment

- New users are automatically assigned the `INVESTOR` role
- Role upgrades must be handled through separate business logic
- Roles are determined by the presence of `investor` or `client` relationships in the database

## Testing the Authentication Flow

### 1. Start Your Application

```bash
npm run dev
```

### 2. Test Google Authentication

1. Navigate to `http://localhost:3000/auth/google`
2. Complete Google OAuth flow
3. Check that you're redirected with authentication cookies set
4. Test protected route: `http://localhost:3000/auth/me`

### 3. Test Azure Authentication

1. Navigate to `http://localhost:3000/auth/azure`
2. Complete Azure AD OAuth flow
3. Verify authentication works similarly to Google

### 4. Test API Endpoints

```bash
# Health check
curl http://localhost:3000/auth/health

# Get current user (with cookies)
curl -b cookies.txt http://localhost:3000/auth/me

# Logout
curl -b cookies.txt http://localhost:3000/auth/logout
```

## Security Considerations

- **JWT Secrets**: Use strong, unique secrets for JWT signing
- **HTTPS**: Always use HTTPS in production
- **Cookie Security**: HTTP-only cookies prevent XSS attacks
- **CORS**: Configure CORS properly for your frontend domain
- **Rate Limiting**: Consider implementing rate limiting on auth endpoints
- **Session Security**: Secure session configuration for OAuth flows

## Database Schema Requirements

The module expects the following Prisma models:

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  fullName     String
  authProvider String
  providerId   String   @unique
  avatarUrl    String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Relationships for role determination
  investor     Investor?
  client       Client?
}

model Investor {
  id          String  @id @default(cuid())
  userId      String  @unique
  nationality String
  isVerified  Boolean @default(false)
  user        User    @relation(fields: [userId], references: [id])
}

model Client {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
}
```

## Troubleshooting

### Common Issues

1. **"Google OAuth credentials not configured"**
   - Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
   - Verify the credentials are correct

2. **"Redirect URI mismatch"**
   - Check that callback URLs in OAuth provider settings match your environment variables
   - Ensure protocol (http/https) matches

3. **"JWT verification failed"**
   - Verify `JWT_SECRET` is set and consistent
   - Check that tokens aren't expired

4. **"User not found"**
   - Ensure database is properly connected
   - Verify Prisma schema matches expectations

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and logging.

## Future Enhancements

- [ ] Refresh token rotation
- [ ] Apple OAuth integration
- [ ] Multi-factor authentication
- [ ] Session management dashboard
- [ ] Advanced audit logging
- [ ] Rate limiting integration
- [ ] OAuth scope management

## License

This module is part of the real estate tokenization platform and is proprietary software.