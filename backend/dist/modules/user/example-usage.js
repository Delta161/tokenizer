/**
 * Example Usage of User Module
 *
 * This file demonstrates how to integrate and use the User Module
 * in your Express.js application.
 */
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createUserRoutes } from './index';
// Initialize Prisma client
const prisma = new PrismaClient();
const app = express();
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Mount user routes
app.use('/api/users', createUserRoutes(prisma));
// Example: Using UserService directly in other parts of your application
import { UserService } from './user.service';
const userService = new UserService(prisma);
// Example function: Get user profile in another service
export async function getUserProfileForInvestment(userId) {
    try {
        const userProfile = await userService.getUserById(userId);
        if (!userProfile) {
            throw new Error('User not found');
        }
        // Use user profile data for investment logic
        return {
            userId: userProfile.id,
            email: userProfile.email,
            fullName: userProfile.fullName,
            role: userProfile.role,
            isEligibleForInvestment: userProfile.role === 'INVESTOR'
        };
    }
    catch (error) {
        console.error('Error fetching user for investment:', error);
        throw error;
    }
}
// Example function: Update user preferences
export async function updateUserPreferences(userId, preferences) {
    try {
        const updatedUser = await userService.updateUser(userId, preferences);
        if (!updatedUser) {
            throw new Error('Failed to update user preferences');
        }
        return updatedUser;
    }
    catch (error) {
        console.error('Error updating user preferences:', error);
        throw error;
    }
}
// Example middleware: Check if user is active before processing requests
export async function ensureUserIsActive(userId) {
    try {
        return await userService.isUserActive(userId);
    }
    catch (error) {
        console.error('Error checking user status:', error);
        return false;
    }
}
export const enrichUserData = async (req, res, next) => {
    if (req.user) {
        try {
            // Get full user profile data
            const fullProfile = await userService.getUserById(req.user.id);
            if (fullProfile) {
                // Add additional user data to request
                req.user = {
                    ...req.user,
                    phone: fullProfile.phone,
                    timezone: fullProfile.timezone,
                    preferredLanguage: fullProfile.preferredLanguage
                };
            }
        }
        catch (error) {
            console.error('Error enriching user data:', error);
            // Continue without enrichment
        }
    }
    next();
};
// Example: Error handling for user operations
export class UserOperationError extends Error {
    statusCode;
    userFriendlyMessage;
    constructor(message, statusCode = 500, userFriendlyMessage) {
        super(message);
        this.statusCode = statusCode;
        this.userFriendlyMessage = userFriendlyMessage;
        this.name = 'UserOperationError';
    }
}
// Example: Utility function for safe user data access
export function getSafeUserData(user) {
    return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        // Never expose sensitive data
        // providerId, authProvider are excluded
    };
}
// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
export default app;
//# sourceMappingURL=example-usage.js.map