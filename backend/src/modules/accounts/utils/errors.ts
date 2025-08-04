/**
 * Accounts Module Errors
 * Standardized error handling for the accounts module
 */

export class AccountsError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AccountsError';
  }
}

export class AuthenticationError extends AccountsError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_REQUIRED', 401);
  }
}

export class AuthorizationError extends AccountsError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'INSUFFICIENT_PERMISSIONS', 403);
  }
}

export class TokenError extends AccountsError {
  constructor(message: string = 'Invalid or expired token') {
    super(message, 'TOKEN_ERROR', 401);
  }
}

export class UserNotFoundError extends AccountsError {
  constructor(userId?: string) {
    const message = userId ? `User ${userId} not found` : 'User not found';
    super(message, 'USER_NOT_FOUND', 404);
  }
}

export class UserAlreadyExistsError extends AccountsError {
  constructor(email: string) {
    super(`User with email ${email} already exists`, 'USER_ALREADY_EXISTS', 409);
  }
}

export class KycNotVerifiedError extends AccountsError {
  constructor(message: string = 'KYC verification required') {
    super(message, 'KYC_NOT_VERIFIED', 403);
  }
}

export class KycAlreadyVerifiedError extends AccountsError {
  constructor(message: string = 'KYC already verified') {
    super(message, 'KYC_ALREADY_VERIFIED', 409);
  }
}

export class ValidationError extends AccountsError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class OAuthError extends AccountsError {
  constructor(provider: string, message: string = 'OAuth authentication failed') {
    super(`${provider} OAuth error: ${message}`, 'OAUTH_ERROR', 400, { provider });
  }
}

/**
 * Error handler utility for consistent error responses
 */
export function handleAccountsError(error: unknown): AccountsError {
  if (error instanceof AccountsError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AccountsError(error.message, 'INTERNAL_ERROR', 500);
  }
  
  return new AccountsError('An unexpected error occurred', 'UNKNOWN_ERROR', 500);
}
