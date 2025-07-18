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
export { createUserRoutes as userRoutes, default as createUserRoutes } from './user.routes';
export { UserController } from './user.controller';
export { UserService } from './user.service';
export type { UserPublicDTO, UpdateUserDTO, UpdateUserRequest, GetUserByIdRequest, UserProfileResponse, UpdateUserResponse, DeleteUserResponse, ErrorResponse } from './user.types';
export type { User } from '@prisma/client';
export { updateUserSchema, userIdParamSchema, validateUpdateUserInput, validateUserIdParam } from './validators/updateUserSchema';
export type { UpdateUserInput, UserIdParam } from './validators/updateUserSchema';
export { mapUserToPublicDTO, mapUsersToPublicDTOs, isUserDeleted, filterActiveUsers } from './user.mapper';
export { isValidUserRole, isValidAuthProvider } from './user.types';
//# sourceMappingURL=index.d.ts.map