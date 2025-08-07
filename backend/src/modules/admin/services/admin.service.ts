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
        fullName: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        authProvider: true,
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
        fullName: true,
        role: true,
        updatedAt: true
      }
    });

    // Log the role change
    adminLogger.logUserRoleUpdate(userId, adminId, oldRole, newRole);

    // TODO: Notify the user about role change when method is available
    // await this.notificationTrigger.sendRoleChangeNotification(userId, oldRole, newRole);

    return updatedUser;
  }

  /**
   * Update user active status
   */
  async updateUserStatus(userId: string, isActive: boolean, adminId: string) {
    // TODO: Implement user status functionality when schema supports isActive field
    // Schema currently missing isActive field on User model
    throw new Error('User status update not implemented - schema missing isActive field');
  }

  /**
   * Moderate property
   */
  async moderateProperty(propertyId: string, status: PropertyStatus, comment: string, adminId: string) {
    // TODO: Implement property moderation when schema supports ownerId and moderationComment
    // Schema currently missing ownerId and moderationComment fields on Property model
    throw new Error('Property moderation not implemented - schema missing required fields');
  }

  /**
   * Send broadcast notification to users
   */
  async sendBroadcastNotification(title: string, message: string, userRole: UserRole | null, adminId: string) {
    // TODO: Implement broadcast notifications when method signature is clarified
    // Current triggerBroadcastNotification expects userIds array, not where clause
    throw new Error('Broadcast notification not implemented - method signature mismatch');
  }
}

// Temporary singleton - will be replaced with proper dependency injection
export const adminService: AdminService = null as any;