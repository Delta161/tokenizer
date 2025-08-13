---
applyTo: 'backend/src/modules/accounts/**'
---

# Accounts Module Documentation Requirements

## 📝 JSDoc Documentation Standards

### Required Documentation

- **All public entities** in the accounts module must be documented with JSDoc comments:
  - Classes
  - Methods
  - Functions
  - Interfaces
  - Type definitions
  - Constants with semantic meaning

### JSDoc Format Requirements

JSDoc is the **only accepted** inline documentation format and must include:

1. **Description**: Clear explanation of purpose and functionality
2. **@param tags**: For each parameter with type and description
3. **@returns tag**: Description of return value and type
4. **@throws tag**: Description of potential errors
5. **@example tag**: Where appropriate for complex functionality

### Example Class Documentation

```typescript
/**
 * Service responsible for handling authentication operations
 * Manages OAuth authentication, session creation, and user verification
 */
export class AuthService {
  /**
   * Processes user authentication through OAuth provider
   * 
   * @param provider - The OAuth provider (google, microsoft, apple)
   * @param profile - User profile data from the provider
   * @param accessToken - OAuth provider access token
   * @returns User data with session information
   * @throws HttpError if authentication fails
   */
  async processOAuthLogin(
    provider: OAuthProvider,
    profile: OAuthProfile,
    accessToken: string
  ): Promise<UserDTO> {
    // Implementation
  }
}
```

### Example Interface Documentation

```typescript
/**
 * Data transfer object for user authentication response
 * Contains sanitized user data and session information
 */
export interface AuthResponseDTO {
  /** Unique user identifier */
  id: string;
  
  /** User's email address */
  email: string;
  
  /** User's full name */
  fullName: string;
  
  /** User's assigned role */
  role: UserRole;
  
  /** Authentication provider used */
  provider: string;
}
```

### Example Function Documentation

```typescript
/**
 * Validates and sanitizes an OAuth profile from any provider
 * 
 * @param profile - Raw profile data from OAuth provider
 * @returns Normalized profile data with consistent structure
 * @throws ValidationError if profile missing required fields
 */
export function normalizeOAuthProfile(profile: any): NormalizedProfile {
  // Implementation
}
```

## ✅ Documentation Review Checklist

Before submitting any code to the accounts module, ensure:

1. All public classes have JSDoc class-level documentation
2. All public methods have complete JSDoc with @param, @returns, and @throws
3. All interfaces and types have JSDoc descriptions
4. All utility functions have JSDoc documentation
5. Complex code sections have inline comments for clarity

## ⚠️ Important Notes

- Documentation quality is considered part of code quality
- Missing or incomplete JSDoc documentation will result in PR rejection
- Updates to existing code must include adding missing JSDoc documentation
- Type information should be in TypeScript declarations, not duplicated in JSDoc
