/**
 * Auth Module Validators
 * Contains Zod schemas for validating auth-related requests
 */

// External packages
import { z } from 'zod';

// Internal modules
import type { UserRole } from '@modules/accounts/types/auth.types';

/**
 * Login, registration, and password reset schemas removed - only OAuth authentication is supported
 */