/**
 * Example Usage of User Module
 *
 * This file demonstrates how to integrate and use the User Module
 * in your Express.js application.
 */
declare const app: import("express-serve-static-core").Express;
export declare function getUserProfileForInvestment(userId: string): Promise<{
    userId: string;
    email: string;
    fullName: string;
    role: import(".prisma/client").$Enums.UserRole;
    isEligibleForInvestment: boolean;
}>;
export declare function updateUserPreferences(userId: string, preferences: {
    timezone?: string;
    preferredLanguage?: string;
}): Promise<import("./user.types").UserPublicDTO>;
export declare function ensureUserIsActive(userId: string): Promise<boolean>;
import { AuthenticatedRequest } from '../auth/requireAuth';
import { Response, NextFunction } from 'express';
export declare const enrichUserData: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare class UserOperationError extends Error {
    statusCode: number;
    userFriendlyMessage?: string | undefined;
    constructor(message: string, statusCode?: number, userFriendlyMessage?: string | undefined);
}
export declare function getSafeUserData(user: any): {
    id: any;
    email: any;
    fullName: any;
    role: any;
};
export default app;
//# sourceMappingURL=example-usage.d.ts.map