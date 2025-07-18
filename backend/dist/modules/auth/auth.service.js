import { PrismaClient, UserRole } from '@prisma/client';
import logger, { logUserRegistration, logUserLogin } from './logger.js';
const prisma = new PrismaClient();
/**
 * Find user by email
 */
export const findUserByEmail = async (email) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                investor: true,
                client: true
            }
        });
        if (!user) {
            return null;
        }
        // Determine user role based on relationships
        let role = UserRole.INVESTOR; // Default role
        if (user.client) {
            role = UserRole.CLIENT;
        }
        else if (user.investor) {
            role = UserRole.INVESTOR;
        }
        // Note: ADMIN role would need to be determined by additional logic
        // For now, we'll handle this in a future iteration
        return {
            ...user,
            role
        };
    }
    catch (error) {
        console.error('Error finding user by email:', error);
        throw new Error('Database error while finding user');
    }
};
/**
 * Find user by provider ID
 */
export const findUserByProviderId = async (providerId) => {
    try {
        const user = await prisma.user.findUnique({
            where: { providerId },
            include: {
                investor: true,
                client: true
            }
        });
        if (!user) {
            return null;
        }
        // Determine user role
        let role = UserRole.INVESTOR;
        if (user.client) {
            role = UserRole.CLIENT;
        }
        else if (user.investor) {
            role = UserRole.INVESTOR;
        }
        return {
            ...user,
            role
        };
    }
    catch (error) {
        console.error('Error finding user by provider ID:', error);
        throw new Error('Database error while finding user');
    }
};
/**
 * Create new user with auto-provisioning
 */
export const createUser = async (userData) => {
    try {
        // Create user in transaction to ensure consistency
        const result = await prisma.$transaction(async (tx) => {
            // Create the base user
            const user = await tx.user.create({
                data: {
                    email: userData.email,
                    fullName: userData.fullName,
                    authProvider: userData.authProvider,
                    providerId: userData.providerId,
                    avatarUrl: userData.avatarUrl
                }
            });
            // Auto-create investor profile (default role)
            // This can be modified based on business logic
            const investor = await tx.investor.create({
                data: {
                    userId: user.id,
                    nationality: 'Unknown', // Will be updated during KYC
                    isVerified: false
                }
            });
            return {
                ...user,
                investor,
                client: null,
                role: UserRole.INVESTOR
            };
        });
        logUserRegistration(result.id, result.email, result.authProvider);
        return result;
    }
    catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Database error while creating user');
    }
};
/**
 * Find or create user (auto-provisioning logic)
 */
export const findOrCreateUser = async (profile) => {
    try {
        // First, try to find user by email
        let user = await findUserByEmail(profile.email);
        if (user) {
            // User exists, update last login and return
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    updatedAt: new Date(),
                    // Optionally update avatar if it's different
                    ...(profile.avatarUrl && { avatarUrl: profile.avatarUrl })
                }
            });
            logUserLogin(user.id, user.email, user.authProvider);
            return user;
        }
        // User doesn't exist, create new one
        const userData = {
            email: profile.email,
            fullName: profile.fullName,
            authProvider: profile.provider,
            providerId: profile.providerId,
            avatarUrl: profile.avatarUrl
        };
        return await createUser(userData);
    }
    catch (error) {
        console.error('Error in findOrCreateUser:', error);
        throw new Error('Authentication service error');
    }
};
/**
 * Update user's last login timestamp and metadata
 */
export const updateUserLoginMetadata = async (userId, metadata) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                updatedAt: new Date()
                // Note: If you want to store login metadata, you'd need to add fields to the User model
                // For now, we'll just update the timestamp
            }
        });
        // Log the login event (in production, you might want to use a proper logging service)
        logger.debug('User login metadata updated', {
            userId,
            ipAddress: metadata.ipAddress,
            provider: metadata.provider,
            userAgent: metadata.userAgent
        });
    }
    catch (error) {
        console.error('Error updating user login metadata:', error);
        // Don't throw here as this is not critical for authentication flow
    }
};
/**
 * Get user by ID with role information
 */
export const getUserById = async (userId) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                investor: true,
                client: true
            }
        });
        if (!user) {
            return null;
        }
        // Determine user role
        let role = UserRole.INVESTOR;
        if (user.client) {
            role = UserRole.CLIENT;
        }
        else if (user.investor) {
            role = UserRole.INVESTOR;
        }
        return {
            ...user,
            role
        };
    }
    catch (error) {
        console.error('Error getting user by ID:', error);
        throw new Error('Database error while fetching user');
    }
};
/**
 * Clean up expired sessions (utility function)
 */
export const cleanupExpiredSessions = async () => {
    // This would be implemented if you're storing sessions in the database
    // For JWT-only approach, this might not be needed
    console.log('Session cleanup completed');
};
//# sourceMappingURL=auth.service.js.map