# Centralized Service Layer

## Overview

This directory contains the centralized service layer for the Tokenizer application. The service layer is responsible for handling all API calls to the backend, providing a clean and consistent interface for the rest of the application.

## Structure

```
frontend/
  src/
    services/
      apiClient.ts       # Centralized Axios instance with interceptors
      README.md          # This file
    modules/
      property/
        services/
          property.service.ts  # Property-specific API calls
        types/
          property.types.ts    # Property-related type definitions
      auth/
        services/
          auth.service.ts      # Auth-specific API calls
      ...
```

## Usage

### API Client

The `apiClient.ts` file exports a configured Axios instance that should be used for all API calls. It includes:

- Base URL configuration from environment variables
- Credentials for cookie/session handling
- Request timeout
- Request interceptors for adding auth tokens
- Response interceptors for global error handling

### Module Services

Each module has its own service file that exports functions for that module's API endpoints. These services use the centralized `apiClient` for all requests.

Example:

```typescript
// In a component or store
import { propertyService } from '@/modules/Property/services';

// Using the service
async function loadProperties() {
  try {
    const result = await propertyService.getAllApproved({ limit: 10, offset: 0 });
    // Handle result
  } catch (error) {
    // Handle error
  }
}
```

### Best Practices

1. **Always use the service layer for API calls**
   - Don't make API calls directly from components or stores
   - Don't create new Axios instances or use fetch directly

2. **Handle errors appropriately**
   - Services should log errors and rethrow them
   - Stores should catch errors and update error state
   - Components should display error messages to users

3. **Use TypeScript types**
   - Define interfaces for all request and response data
   - Import types from the module's types directory

4. **Keep services focused**
   - Each service should handle one domain/feature
   - Break large services into smaller, more focused ones