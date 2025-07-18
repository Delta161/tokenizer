/**
 * User Module - Barrel Export
 *
 * This module provides user profile management functionality for the tokenized
 * real estate investment platform. It handles user profile operations after
 * OAuth 2.0 authentication.
 *
 * Features:
 * - User profile retrieval and updates
 * - Role-based access control
 * - Admin user management
 * - Soft delete functionality
 * - Input validation and sanitization
 *
 * All routes require authentication via the Auth module.
 */
// Main exports
export { createUserRoutes as userRoutes, default as createUserRoutes } from './user.routes';
export { UserController } from './user.controller';
export { UserService } from './user.service';
// Validation exports
export { updateUserSchema, userIdParamSchema, validateUpdateUserInput, validateUserIdParam } from './validators/updateUserSchema';
// Mapper exports
export { mapUserToPublicDTO, mapUsersToPublicDTOs, isUserDeleted, filterActiveUsers } from './user.mapper';
// Type guards
export { isValidUserRole, isValidAuthProvider } from './user.types';
//# sourceMappingURL=index.js.map