/**
 * User Controller
 * Handles HTTP requests for user management
 */
import { Request, Response } from 'express';
export declare class UserController {
    /**
     * Get all users
     */
    getUsers(req: Request, res: Response): Promise<void>;
    /**
   * Get user by ID
   */
    getUserById(req: Request, res: Response): Promise<void>;
    /**
     * Create a new user
     */
    createUser(req: Request, res: Response): Promise<void>;
    /**
     * Update user
     */
    updateUser(req: Request, res: Response): Promise<void>;
    /**
     * Delete user
     */
    deleteUser(req: Request, res: Response): Promise<void>;
    /**
     * Change user password
     */
    changePassword(req: Request, res: Response): Promise<void>;
}
export declare const userController: UserController;
//# sourceMappingURL=user.controller.d.ts.map