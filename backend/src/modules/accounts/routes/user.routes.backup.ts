/**
 * User Routes
 * Database-integrated user routes using Prisma and real data
 * Now with proper authentication middleware and controller pattern
 */

import { Router } from 'express';
import { prisma } from '../../../prisma/client';
import { requireAuth, authGuard } from '../middleware/auth.middleware';
import { userController } from '../controllers/user.controller';

// Create router
const router = Router();

console.log('📄 User routes module loaded');

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user's profile from database (alias for /profile)
 * @access  Private (requires authentication)
 */
router.get('/me', requireAuth, async (req, res) => {
  console.log('👤 User /me route accessed (alias for /profile)');
  
  try {
    // Try to find an existing user or create a demo user
    let user = await prisma.user.findFirst({
      include: {
        investor: true,
        client: true,
        kycRecord: true
      }
    });

    // If no users exist, create a demo user
    if (!user) {
      console.log('No users found, creating demo user...');
      user = await prisma.user.create({
        data: {
          email: 'john.doe@example.com',
          fullName: 'John Doe',
          providerId: 'google_123456789',
          authProvider: 'GOOGLE',
          role: 'INVESTOR',
          phone: '+1 (555) 123-4567',
          preferredLanguage: 'en',
          timezone: 'America/Los_Angeles',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        include: {
          investor: true,
          client: true,
          kycRecord: true
        }
      });
      console.log('👤 Demo user created:', user.id);
    }

    const profileResponse = {
      id: user.id,
      email: user.email,
      firstName: user.fullName.split(' ')[0] || 'John',
      lastName: user.fullName.split(' ').slice(1).join(' ') || 'Doe',
      fullName: user.fullName,
      role: user.role.toLowerCase(),
      avatar: user.avatarUrl,
      phone: user.phone,
      timezone: user.timezone,
      language: user.preferredLanguage,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      authProvider: user.authProvider.toLowerCase()
    };

    res.json({
      success: true,
      message: 'User profile retrieved successfully',
      data: profileResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user's profile from database
 * @access  Private (requires authentication)
 */
router.get('/profile', requireAuth, async (req, res) => {
  console.log(' User profile route accessed');
  
  try {
    // Try to find an existing user or create a demo user
    let user = await prisma.user.findFirst({
      include: {
        investor: true,
        client: true,
        kycRecord: true
      }
    });

    // If no users exist, create a demo user
    if (!user) {
      console.log('No users found, creating demo user...');
      user = await prisma.user.create({
        data: {
          email: 'john.doe@example.com',
          fullName: 'John Doe',
          providerId: 'google_123456789',
          authProvider: 'GOOGLE',
          role: 'INVESTOR',
          phone: '+1 (555) 123-4567',
          preferredLanguage: 'en',
          timezone: 'America/Los_Angeles',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        include: {
          investor: true,
          client: true,
          kycRecord: true
        }
      });
      console.log(' Demo user created:', user.id);
    }

    const profileResponse = {
      id: user.id,
      email: user.email,
      firstName: user.fullName.split(' ')[0] || 'John',
      lastName: user.fullName.split(' ').slice(1).join(' ') || 'Doe',
      fullName: user.fullName,
      role: user.role.toLowerCase(),
      avatar: user.avatarUrl,
      phone: user.phone,
      timezone: user.timezone,
      language: user.preferredLanguage,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      authProvider: user.authProvider.toLowerCase()
    };

    res.json({
      success: true,
      message: 'User profile retrieved successfully',
      data: profileResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(' Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   PUT /api/v1/users/me
 * @desc    Update current user's profile in database (alias for PATCH /profile)
 * @access  Private (requires authentication)
 */
router.put('/me', requireAuth, async (req, res) => {
  console.log('✅ User /me update route accessed (alias for PATCH /profile)');
  console.log('📝 Update data received:', JSON.stringify(req.body, null, 2));
  
  try {
    // Get the first user (demo mode)
    let user = await prisma.user.findFirst();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Extract updatable fields from request body
    const { firstName, lastName, phone, timezone, language, avatar } = req.body;

    // Prepare update data for Prisma
    const updateData: any = {};
    
    // Combine firstName and lastName into fullName
    if (firstName || lastName) {
      const currentFirstName = firstName || user.fullName.split(' ')[0] || 'User';
      const currentLastName = lastName || user.fullName.split(' ').slice(1).join(' ') || '';
      updateData.fullName = `${currentFirstName} ${currentLastName}`.trim();
    }

    // Map other fields
    if (phone !== undefined) updateData.phone = phone;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (language !== undefined) updateData.preferredLanguage = language;
    if (avatar !== undefined) updateData.avatarUrl = avatar;

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      include: {
        investor: true,
        client: true,
        kycRecord: true
      }
    });

    // Transform updated user to frontend format
    const updatedProfile = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.fullName.split(' ')[0] || 'User',
      lastName: updatedUser.fullName.split(' ').slice(1).join(' ') || '',
      fullName: updatedUser.fullName,
      role: updatedUser.role.toLowerCase(),
      avatar: updatedUser.avatarUrl,
      phone: updatedUser.phone,
      timezone: updatedUser.timezone,
      language: updatedUser.preferredLanguage,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
      authProvider: updatedUser.authProvider.toLowerCase()
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
      timestamp: new Date().toISOString(),
      updatedFields: Object.keys(req.body)
    });

  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   PATCH /api/v1/users/profile
 * @desc    Update current user's profile in database
 * @access  Private (requires authentication)
 */
router.patch('/profile', requireAuth, async (req, res) => {
  console.log('✅ User profile update route accessed');
  console.log('📝 Update data received:', JSON.stringify(req.body, null, 2));
  
  try {
    // Get the first user (demo mode)
    let user = await prisma.user.findFirst();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Extract updatable fields from request body
    const { firstName, lastName, phone, timezone, language, avatar } = req.body;

    // Prepare update data for Prisma
    const updateData: any = {};
    
    // Combine firstName and lastName into fullName
    if (firstName || lastName) {
      const currentFirstName = firstName || user.fullName.split(' ')[0] || 'User';
      const currentLastName = lastName || user.fullName.split(' ').slice(1).join(' ') || '';
      updateData.fullName = `${currentFirstName} ${currentLastName}`.trim();
    }

    // Map other fields
    if (phone !== undefined) updateData.phone = phone;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (language !== undefined) updateData.preferredLanguage = language;
    if (avatar !== undefined) updateData.avatarUrl = avatar;

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      include: {
        investor: true,
        client: true,
        kycRecord: true
      }
    });

    // Transform updated user to frontend format
    const updatedProfile = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.fullName.split(' ')[0] || 'User',
      lastName: updatedUser.fullName.split(' ').slice(1).join(' ') || '',
      fullName: updatedUser.fullName,
      role: updatedUser.role.toLowerCase(),
      avatar: updatedUser.avatarUrl,
      phone: updatedUser.phone,
      timezone: updatedUser.timezone,
      language: updatedUser.preferredLanguage,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
      authProvider: updatedUser.authProvider.toLowerCase()
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
      timestamp: new Date().toISOString(),
      updatedFields: Object.keys(req.body)
    });

  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as userRouter };
console.log(' User routes exported');
