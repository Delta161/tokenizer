# Data Transformation Layer

## Overview

This directory contains the data transformation layer for the Accounts module. It provides a standardized way to handle mapping between backend and frontend data structures consistently across the application.

## Files

- `index.ts` - Exports all mapper functions from the module
- `userMapper.ts` - Mapper functions for user-related data
- `kycMapper.ts` - Mapper functions for KYC-related data
- `authMapper.ts` - Mapper functions for authentication-related data

## Purpose

The data transformation layer serves several important purposes:

1. **Consistency**: Ensures consistent data transformation across the application
2. **Separation of Concerns**: Isolates data transformation logic from service logic
3. **Type Safety**: Provides type-safe transformations between backend and frontend data structures
4. **Maintainability**: Makes it easier to update data transformations when backend or frontend schemas change
5. **Reusability**: Allows reuse of transformation logic across different parts of the application

## Usage Examples

### User Mappers

```typescript
import { mapBackendUserToFrontend, mapFrontendUserToBackend } from '../utils/mappers';

// In a service method
async function getUser(id: string): Promise<User> {
  const response = await apiClient.get(`/users/${id}`);
  return mapBackendUserToFrontend(response.data);
}

async function updateUser(id: string, userData: UserUpdate): Promise<User> {
  const backendData = mapFrontendUserToBackend(userData);
  const response = await apiClient.patch(`/users/${id}`, backendData);
  return mapBackendUserToFrontend(response.data);
}
```

### KYC Mappers

```typescript
import { mapBackendKycToFrontend, mapKycSubmissionToBackend } from '../utils/mappers';

// In a service method
async function getKycRecord(): Promise<KycRecord | null> {
  const response = await apiClient.get('/kyc/me');
  return mapBackendKycToFrontend(response.data.data);
}

async function submitKyc(data: KycSubmissionData): Promise<KycRecord> {
  const backendData = mapKycSubmissionToBackend(data);
  const response = await apiClient.post('/kyc/submit', backendData);
  return mapBackendKycToFrontend(response.data.data);
}
```

### Auth Mappers

```typescript
import { mapBackendAuthResponseToFrontend, mapLoginCredentialsToBackend } from '../utils/mappers';

// In a service method
async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const backendCredentials = mapLoginCredentialsToBackend(credentials);
  const response = await apiClient.post('/auth/login', backendCredentials);
  return mapBackendAuthResponseToFrontend(response.data);
}
```

## Best Practices

1. **Always use mappers**: When communicating with the backend, always use the appropriate mapper functions to transform data.
2. **Keep mappers pure**: Mapper functions should be pure functions without side effects.
3. **Handle null/undefined**: Ensure mapper functions handle null or undefined values gracefully.
4. **Maintain type safety**: Use TypeScript interfaces to ensure type safety in transformations.
5. **Document transformations**: Add comments to explain non-obvious transformations.
6. **Update both directions**: When adding a new field, update both the frontend-to-backend and backend-to-frontend mappers.