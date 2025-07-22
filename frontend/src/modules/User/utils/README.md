# User Mapper Utility

## Overview

This utility provides mapping functions to handle the mismatch between backend and frontend User models. The backend User model stores only a `fullName` field, while the frontend User model uses separate `firstName` and `lastName` fields.

## Key Functions

### `mapBackendUserToFrontend`

Converts a backend user object to the frontend User model format:
- Splits the `fullName` into `firstName` and `lastName`
- First word becomes `firstName`
- Remaining words become `lastName`

### `mapFrontendUserToBackend`

Converts a frontend user object to the backend format:
- Combines `firstName` and `lastName` into a single `fullName` field
- Removes the separate name fields

### `mapBackendUsersToFrontend`

Utility function to map an array of backend users to frontend format.

## Implementation

These mapping functions are used in:

1. **UserService** (`frontend/src/modules/User/services/index.ts`):
   - `getCurrentUser()`
   - `getUserById()`
   - `updateUser()`
   - `searchUsers()`

2. **AuthService** (`frontend/src/modules/Auth/services/index.ts`):
   - `login()`
   - `register()`
   - `getCurrentUser()`

## Usage Example

```typescript
// Import the mapper
import { mapBackendUserToFrontend } from '../utils/userMapper';

// When receiving user data from the API
const response = await fetch('/api/users/me');
const backendUser = await response.json();

// Convert to frontend format
const frontendUser = mapBackendUserToFrontend(backendUser);

// Now frontendUser has firstName and lastName properties
console.log(frontendUser.firstName, frontendUser.lastName);
```