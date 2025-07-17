# User Module

A production-ready User Module for the tokenized real estate investment platform. This module manages user profiles and accounts after OAuth 2.0 authentication.

## Overview

The User Module provides comprehensive user profile management functionality including:

- User profile retrieval and updates
- Role-based access control (INVESTOR, CLIENT, ADMIN)
- Admin user management capabilities
- Soft delete functionality
- Input validation and sanitization
- TypeScript type safety

## Architecture

```
modules/user/
├── user.routes.ts          # Express route definitions
├── user.controller.ts      # Request handlers and validation
├── user.service.ts         # Business logic and database operations
├── user.types.ts           # TypeScript interfaces and types
├── user.mapper.ts          # Data transformation utilities
├── validators/
│   └── updateUserSchema.ts # Zod validation schemas
├── index.ts                # Module exports
└── README.md               # This documentation
```

## API Endpoints

### Authentication
All endpoints require authentication via JWT token (provided by Auth module).

### User Profile Endpoints

#### `GET /users/me`
Retrieve the current user's profile.

**Access:** Any authenticated user

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "role": "INVESTOR",
    "phone": "+1234567890",
    "timezone": "America/New_York",
    "preferredLanguage": "en",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### `PATCH /users/me`
Update the current user's profile.

**Access:** Any authenticated user

**Request Body:**
```json
{
  "fullName": "Jane Doe",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "phone": "+1987654321",
  "timezone": "Europe/London",
  "preferredLanguage": "en"
}
```

**Validation Rules:**
- `fullName`: 2-100 characters, letters/spaces/hyphens/apostrophes only
- `avatarUrl`: Valid URL, max 500 characters
- `phone`: Valid international format (E.164)
- `timezone`: Valid timezone identifier
- `preferredLanguage`: 2-character ISO 639-1 code

**Response:**
```json
{
  "success": true,
  "data": { /* updated user profile */ },
  "message": "Profile updated successfully"
}
```

#### `DELETE /users/me`
Soft delete the current user's account.

**Access:** Any authenticated user

**Response:**
```json
{
  "success": true,
  "message": "User account has been successfully deleted"
}
```

### Admin Endpoints

#### `GET /users/:id`
Retrieve any user's profile by ID.

**Access:** Admin only

**Parameters:**
- `id`: User UUID

**Response:** Same as `GET /users/me`

#### `GET /users`
Retrieve all active users with pagination.

**Access:** Admin only

**Query Parameters:**
- `limit`: Number of users to return (max 100, default 50)
- `offset`: Number of users to skip (default 0)

**Response:**
```json
{
  "success": true,
  "data": [/* array of user profiles */],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 150,
    "hasMore": true
  }
}
```

## Usage

### Integration

```typescript
import { createUserRoutes } from './modules/user';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const userRoutes = createUserRoutes(prisma);

app.use('/api/users', userRoutes);
```

### Service Usage

```typescript
import { UserService } from './modules/user';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const userService = new UserService(prisma);

// Get user profile
const user = await userService.getUserById('user-uuid');

// Update user
const updated = await userService.updateUser('user-uuid', {
  fullName: 'New Name',
  phone: '+1234567890'
});
```

## Database Schema

The module extends the User model with the following fields:

```prisma
model User {
  id                 String        @id @default(uuid())
  email              String        @unique
  fullName           String
  authProvider       AuthProvider
  providerId         String        @unique
  avatarUrl          String?
  role               UserRole      @default(INVESTOR)
  phone              String?
  timezone           String?
  preferredLanguage  String?
  deletedAt          DateTime?     // For soft delete
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt
  
  // Relations
  investor Investor?
  client   Client?
  wallets  Wallet[]
}

enum UserRole {
  INVESTOR
  CLIENT
  ADMIN
}

enum AuthProvider {
  GOOGLE
  AZURE
}
```

## Security Features

- **Authentication Required**: All endpoints require valid JWT tokens
- **Role-Based Access**: Admin endpoints restricted to ADMIN role
- **Input Validation**: Comprehensive validation using Zod schemas
- **Data Sanitization**: Safe data transformation via mappers
- **Soft Delete**: User data preserved for audit purposes
- **No PII Exposure**: Sensitive fields excluded from public responses

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error message"
}
```

Common HTTP status codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (user doesn't exist)
- `500`: Internal Server Error

## Dependencies

- `@prisma/client`: Database ORM
- `express`: Web framework
- `zod`: Schema validation
- `jsonwebtoken`: JWT handling (via Auth module)

## Migration

After updating the Prisma schema, run:

```bash
npx prisma migrate dev --name add-user-profile-fields
npx prisma generate
```

## Testing

Example test scenarios:

1. **Profile Retrieval**: Verify authenticated users can access their profiles
2. **Profile Updates**: Test validation and successful updates
3. **Admin Access**: Ensure only admins can access other users' data
4. **Soft Delete**: Verify deleted users are properly hidden
5. **Input Validation**: Test all validation rules and error responses

## Future Enhancements

- User preferences and settings
- Profile picture upload handling
- User activity logging
- Advanced search and filtering
- Bulk user operations (admin)
- User invitation system