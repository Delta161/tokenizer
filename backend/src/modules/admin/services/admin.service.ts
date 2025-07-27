import { PrismaClient, UserRole, PropertyStatus } from '@prisma/client';
import { NotificationTrigger } from '../../notifications/services/notification.trigger.js';
import { adminLogger } from '../utils/admin.logger.js';
import { PaginationParams, SortingParams } from '../types/admin.types.js';
import { PAGINATION } from '../../../config/constants.js';

const prisma = new PrismaClient();

export class AdminService {
  private notificationTrigger: NotificationTrigger;

  constructor(notificationTrigger: NotificationTrigger) {
    this.notificationTrigger = notificationTrigger;
  }

  /**
   * Get users with optional filtering
   */
  async getUsers(params: PaginationParams & SortingParams & {
    role?: string;
    isActive?: boolean;
    search?: string;
  }) {
    const {
      page = 1,
      limit = PAGINATION.DEFAULT_LIMIT,
      role,
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Execute query with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          kyc: {
            select: {
              status: true,
              updatedAt: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        }
      }),
      prisma.user.count({ where })
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: users,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: totalCount,
        totalPages
      }
    };
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, newRole: UserRole, adminId: string) {
    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const oldRole = user.role;

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    // Log the role change
    adminLogger.logUserRoleUpdate(userId, adminId, oldRole, newRole);

    // Notify the user about role change
    await this.notificationTrigger.sendRoleChangeNotification(userId, oldRole, newRole);

    return updatedUser;
  }

  /**
   * Update user active status
   */
  async updateUserStatus(userId: string, isActive: boolean, adminId: string) {
    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const oldStatus = user.isActive;

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    // Log the status change
    adminLogger.logUserStatusUpdate(userId, adminId, oldStatus, isActive);

    // Notify the user about status change
    await this.notificationTrigger.sendAccountStatusChangeNotification(userId, isActive);

    return updatedUser;
  }

  /**
   * Moderate property
   */
  async moderateProperty(propertyId: string, status: PropertyStatus, comment: string, adminId: string) {
    // Get current property data
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { status: true, ownerId: true }
    });

    if (!property) {
      throw new Error('Property not found');
    }

    const oldStatus = property.status;

    // Update property status
    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: {
        status,
        moderationComment: comment,
        moderatedAt: new Date(),
        moderatedById: adminId
      },
      select: {
        id: true,
        title: true,
        status: true,
        moderationComment: true,
        moderatedAt: true,
        updatedAt: true
      }
    });

    // Log the moderation action
    adminLogger.logPropertyModeration(propertyId, adminId, oldStatus, status, comment);

    // Notify the property owner about moderation
    await this.notificationTrigger.sendPropertyModerationNotification(
      property.ownerId,
      propertyId,
      status,
      comment
    );

    return updatedProperty;
  }

  /**
   * Send broadcast notification
   */
  async sendBroadcastNotification(title: string, message: string, userRole: UserRole | null, adminId: string) {
    // Determine target users based on role filter
    const where = userRole ? { role: userRole } : {};

    // Get count of target users
    const userCount = await prisma.user.count({ where });

    // Send notification to all target users
    await this.notificationTrigger.sendBroadcastNotification(title, message, where);

    // Log the broadcast action
    adminLogger.logBroadcastNotification(adminId, title, userRole, userCount);

    return { userCount };
  }
}

// Create and export a singleton instance
export const adminService = new AdminService(new NotificationTrigger());