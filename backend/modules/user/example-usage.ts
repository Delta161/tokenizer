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
export async function getUserProfileForInvestment(userId: string) {
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
  } catch (error) {
    console.error('Error fetching user for investment:', error);
    throw error;
  }
}

// Example function: Update user preferences
export async function updateUserPreferences(userId: string, preferences: {
  timezone?: string;
  preferredLanguage?: string;
}) {
  try {
    const updatedUser = await userService.updateUser(userId, preferences);
    
    if (!updatedUser) {
      throw new Error('Failed to update user preferences');
    }
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
}

// Example middleware: Check if user is active before processing requests
export async function ensureUserIsActive(userId: string): Promise<boolean> {
  try {
    return await userService.isUserActive(userId);
  } catch (error) {
    console.error('Error checking user status:', error);
    return false;
  }
}

// Example: Integration with existing auth middleware
import { AuthenticatedRequest } from '../auth/requireAuth';
import { Response, NextFunction } from 'express';

export const enrichUserData = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
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
    } catch (error) {
      console.error('Error enriching user data:', error);
      // Continue without enrichment
    }
  }
  
  next();
};

// Example: Error handling for user operations
export class UserOperationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public userFriendlyMessage?: string
  ) {
    super(message);
    this.name = 'UserOperationError';
  }
}

// Example: Utility function for safe user data access
export function getSafeUserData(user: any) {
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