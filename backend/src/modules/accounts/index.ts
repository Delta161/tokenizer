/**
 * Accounts Module Index
 * Exports all components of the accounts module
 * Consolidates user, auth, and kyc functionality
 */

import { Router } from 'express';

// Import and re-export routes
export * from './routes';
export { authRouter } from './routes/auth.routes';
export { userRouter } from './routes/user.routes';
export { kycRouter } from './routes/kyc.routes';

// Import and re-export controllers
export { userController, UserController } from './controllers/user.controller';
export { authController, AuthController } from './controllers/auth.controller';
export { KycController } from './controllers/kyc.controller';

// Import and re-export services
export { userService, UserService } from './services/user.service';
export { authService, AuthService } from './services/auth.service';
export { kycService, KycService } from './services/kyc.service';

// Import and re-export middleware (fix path aliases)
export { 
  authGuard, 
  roleGuard, 
  requireAuth, 
  requireRole, 
  optionalAuth, 
  isAuthenticated, 
  hasRole 
} from './middleware/auth.middleware';
export { requireKycVerified } from './middleware/kyc.middleware';

// Import and re-export validators
export * from './validators';

// Import and re-export utils
export * from './utils';

// Import and re-export strategies
export * from './strategies';

// Import and re-export types explicitly to avoid conflicts
export type { 
  UserDTO, 
  CreateUserDTO, 
  UpdateUserDTO,
  UserFilterOptions,
  UserSortOptions,
  UserSortField 
} from './types/user.types';

export type {
  AuthResponseDTO,
  TokenPayload,
  OAuthProfileDTO
} from './types/auth.types';

export type {
  KycRecordDTO,
  KycRecordWithUser,
  KycResponse,
  KycListResponse
} from './types/kyc.types';

export { KycStatus, KycProvider } from './types/kyc.types';
export { UserRole } from './types/auth.types';

/**
 * Create combined accounts router
 * Improved factory function that combines all account routes
 */
export function createAccountsRouter(): Router {
  const router = Router();
  
  // Use ES6 imports for better type safety
  import('./routes/auth.routes').then(({ authRouter }) => {
    router.use('/auth', authRouter);
  });
  
  import('./routes/user.routes').then(({ userRouter }) => {
    router.use('/users', userRouter);
  });
  
  import('./routes/kyc.routes').then(({ kycRouter }) => {
    router.use('/kyc', kycRouter);
  });
  
  return router;
}

/**
 * Alternative: Direct imports (synchronous)
 * Use this if you prefer synchronous module loading
 */
export function createAccountsRouterSync(): Router {
  const router = Router();
  
  // Direct imports - cleaner but must be imported after routes are defined
  const { authRouter } = require('./routes/auth.routes');
  const { userRouter } = require('./routes/user.routes');
  const { kycRouter } = require('./routes/kyc.routes');
  
  router.use('/auth', authRouter);
  router.use('/users', userRouter);
  router.use('/kyc', kycRouter);
  
  return router;
}

