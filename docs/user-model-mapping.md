# User Model Mapping Documentation

## Overview

This document describes the implementation of mapping between backend and frontend User models to handle a structural mismatch. The backend User model stores a single `fullName` field, while the frontend User model uses separate `firstName` and `lastName` fields.

## Implementation Details

### 1. User Mapper Utility

A new utility module has been created at `frontend/src/modules/User/utils/userMapper.ts` that provides mapping functions:

```typescript
// Maps a backend user object to the frontend User model
export const mapBackendUserToFrontend = (backendUser: any): User => {
  // Extract first and last name from fullName
  const nameParts = backendUser.fullName ? backendUser.fullName.split(' ') : ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  
  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName,
    lastName,
    // ... other properties
  };
};

// Maps a frontend user object to the backend format
export const mapFrontendUserToBackend = (frontendUser: User): any => {
  // Combine firstName and lastName into fullName
  const fullName = [frontendUser.firstName, frontendUser.lastName]
    .filter(Boolean)
    .join(' ');
  
  return {
    id: frontendUser.id,
    email: frontendUser.email,
    fullName,
    // ... other properties
  };
};

// Maps an array of backend users to frontend format
export const mapBackendUsersToFrontend = (backendUsers: any[]): User[] => {
  return backendUsers.map(mapBackendUserToFrontend);
};
```

### 2. Service Layer Updates

The service layer has been updated to use these mapping functions when communicating with the backend API:

#### UserService (`frontend/src/modules/User/services/index.ts`)

- `getCurrentUser()`: Maps the backend response to frontend format
- `getUserById()`: Maps the backend response to frontend format
- `updateUser()`: Converts frontend data to backend format before sending, then maps the response
- `searchUsers()`: Maps the users array in the search results to frontend format

#### AuthService (`frontend/src/modules/Auth/services/index.ts`)

- `login()`: Maps the user in the response to frontend format
- `register()`: Converts frontend data to backend format before sending, then maps the response
- `getCurrentUser()`: Maps the user in the response to frontend format

### 3. User Composable Updates

The `useUser` composable has been updated to handle potential missing name fields:

#### `getFullName` function

```typescript
const getFullName = (user: User) => {
  if (!user.firstName && !user.lastName) return 'User';
  return [user.firstName, user.lastName].filter(Boolean).join(' ');
};
```

#### `getUserInitials` function

```typescript
const getUserInitials = (user: User) => {
  if (!user.firstName && !user.lastName) return 'U';
  
  const firstInitial = user.firstName ? user.firstName.charAt(0) : '';
  const lastInitial = user.lastName ? user.lastName.charAt(0) : '';
  
  // If we have both initials, use them
  if (firstInitial && lastInitial) {
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }
  
  // If we only have one name, use the first two letters of that name
  const singleName = user.firstName || user.lastName || '';
  return singleName.substring(0, 2).toUpperCase() || 'U';
};
```

## Testing

A comprehensive test suite has been created at `frontend/src/modules/User/utils/userMapper.test.ts` to verify the mapping functions work correctly in various scenarios:

- Mapping a standard user with both first and last name
- Handling empty or null fullName
- Handling single-word fullName
- Handling multi-word lastName
- Mapping from frontend to backend format
- Mapping arrays of users

## Benefits

1. **Separation of Concerns**: The mapping logic is isolated in dedicated utility functions
2. **Consistency**: All user data is consistently formatted throughout the frontend
3. **Robustness**: Proper handling of edge cases (missing names, etc.)
4. **Maintainability**: Changes to the mapping logic only need to be made in one place

## Future Considerations

1. If the backend model changes to include separate firstName and lastName fields, the mapper can be updated or removed
2. Consider adding more robust validation for edge cases in the mapping functions
3. Consider implementing similar mapping patterns for other models with structural mismatches