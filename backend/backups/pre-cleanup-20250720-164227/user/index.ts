/**
 * User Module Index
 * Exports all components of the user module
 */

// Export router
export { userRouter } from './user.routes';

// Export controller
export { userController, UserController } from './user.controller';

// Export service
export { userService, UserService } from './user.service';

// Export types
export {
  UserDTO,
  CreateUserDTO,
  UpdateUserDTO,
  ChangePasswordDTO,
  UserFilterOptions,
  UserSortOptions,
  UserSortField
} from './user.types';

// Export validators
export {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  userIdParamSchema,
  userFilterSchema
} from './user.validators';