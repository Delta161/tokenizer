import { PrismaClient, UserRole, PropertyStatus } from '@prisma/client';
import { 
  UpdateUserRoleDto, 
  UpdateUserStatusDto, 
  ModeratePropertyDto, 
  AdminNotificationDto,
  PaginationParams,
  SortingParams,
  PaginationMeta
} from './admin.types.js';
import { logger } from '@utils/logger';
import { NotificationTrigger } from '../notifications/services/notification.trigger.js';
import { PAGINATION } from '@/config/constants';

const prisma = new PrismaClient();

export class AdminService {
  private notificationTrigger: NotificationTrigger;

  constructor(notificationTrigger: NotificationTrigger) {
    this.notificationTrigger = notificationTrigger;
  }

  /**
   * Helper function to calculate pagination metadata
   */
  private calculatePaginationMeta(page: number, limit: number, totalItems: number): PaginationMeta {
    const totalPages = Math.ceil(totalItems / limit);
    
    return {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit
    };
  }

  /**
   * Helper function to get skip value from page and limit
   */
  private getSkipValue(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Get all users with optional filtering
   */
  async getUsers(filters: {
    role?: UserRole;
    email?: string;
    registrationDateFrom?: Date;
    registrationDateTo?: Date;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { 
      role, 
      email, 
      registrationDateFrom, 
      registrationDateTo, 
      page = PAGINATION.DEFAULT_PAGE, 
      limit = PAGINATION.DEFAULT_LIMIT,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    if (email) {
      where.email = {
        contains: email,
        mode: 'insensitive',
      };
    }
    
    if (registrationDateFrom || registrationDateTo) {
      where.createdAt = {};
      
      if (registrationDateFrom) {
        where.createdAt.gte = registrationDateFrom;
      }
      
      if (registrationDateTo) {
        where.createdAt.lte = registrationDateTo;
      }
    }

    const skip = this.getSkipValue(page, limit);
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [users, total] = await Promise.all([
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
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.user.count({ where }),
    ]);

    const meta = this.calculatePaginationMeta(page, limit, total);

    return { 
      success: true, 
      users, 
      meta,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        kycRecords: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, data: UpdateUserRoleDto, adminId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: data.role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Log the role change in the audit log
    await prisma.auditLog.create({
      data: {
        action: 'USER_ROLE_UPDATE',
        userId: adminId,
        targetId: userId,
        details: JSON.stringify({
          oldRole: user.role,
          newRole: data.role,
        }),
      },
    });

    return updatedUser;
  }

  /**
   * Update user active status
   */
  async updateUserStatus(userId: string, data: UpdateUserStatusDto, adminId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: data.isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Log the status change in the audit log
    await prisma.auditLog.create({
      data: {
        action: 'USER_STATUS_UPDATE',
        userId: adminId,
        targetId: userId,
        details: JSON.stringify({
          oldStatus: user.isActive,
          newStatus: data.isActive,
        }),
      },
    });

    return updatedUser;
  }

  /**
   * Get all properties with optional filtering
   */
  async getProperties(filters: {
    status?: PropertyStatus;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { 
      status, 
      page = PAGINATION.DEFAULT_PAGE, 
      limit = PAGINATION.DEFAULT_LIMIT,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const skip = this.getSkipValue(page, limit);
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          address: true,
          price: true,
          createdAt: true,
          updatedAt: true,
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.property.count({ where }),
    ]);

    const meta = this.calculatePaginationMeta(page, limit, total);

    return { 
      success: true, 
      properties, 
      meta 
    };
  }

  /**
   * Get property by ID
   */
  async getPropertyById(propertyId: string) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        token: {
          select: {
            id: true,
            symbol: true,
            contractAddress: true,
            chainId: true,
          },
        },
      },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    return property;
  }

  /**
   * Moderate a property (approve/reject)
   */
  async moderateProperty(propertyId: string, data: ModeratePropertyDto, adminId: string) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    if (property.status !== PropertyStatus.SUBMITTED) {
      throw new Error('Property is not in SUBMITTED status');
    }

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: {
        status: data.status,
        moderationComment: data.comment,
        moderatedAt: new Date(),
        moderatedById: adminId,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Log the moderation in the audit log
    await prisma.auditLog.create({
      data: {
        action: 'PROPERTY_MODERATION',
        userId: adminId,
        targetId: propertyId,
        details: JSON.stringify({
          status: data.status,
          comment: data.comment,
        }),
      },
    });

    // Send notification to the property owner
    await this.notificationTrigger.sendPropertyModerationNotification({
      propertyId,
      propertyTitle: updatedProperty.title,
      status: data.status,
      comment: data.comment,
      userId: updatedProperty.client.id,
      userEmail: updatedProperty.client.email,
      userName: `${updatedProperty.client.firstName} ${updatedProperty.client.lastName}`,
    });

    return updatedProperty;
  }

  /**
   * Get all tokens with optional filtering
   */
  async getTokens(filters: {
    symbol?: string;
    chainId?: number;
    propertyId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { 
      symbol, 
      chainId, 
      propertyId, 
      page = PAGINATION.DEFAULT_PAGE, 
      limit = PAGINATION.DEFAULT_LIMIT,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const where: any = {};
    
    if (symbol) {
      where.symbol = {
        contains: symbol,
        mode: 'insensitive',
      };
    }
    
    if (chainId) {
      where.chainId = chainId;
    }
    
    if (propertyId) {
      where.propertyId = propertyId;
    }

    const skip = this.getSkipValue(page, limit);
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [tokens, total] = await Promise.all([
      prisma.token.findMany({
        where,
        select: {
          id: true,
          symbol: true,
          name: true,
          contractAddress: true,
          chainId: true,
          totalSupply: true,
          createdAt: true,
          property: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.token.count({ where }),
    ]);

    const meta = this.calculatePaginationMeta(page, limit, total);

    return { 
      success: true, 
      tokens, 
      meta 
    };
  }

  /**
   * Get token by ID
   */
  async getTokenById(tokenId: string) {
    const token = await prisma.token.findUnique({
      where: { id: tokenId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!token) {
      throw new Error('Token not found');
    }

    return token;
  }

  /**
   * Get all KYC records with optional filtering
   */
  async getKycRecords(filters: {
    status?: string;
    userId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { 
      status, 
      userId, 
      page = PAGINATION.DEFAULT_PAGE, 
      limit = PAGINATION.DEFAULT_LIMIT,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }

    const skip = this.getSkipValue(page, limit);
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [kycRecords, total] = await Promise.all([
      prisma.kycRecord.findMany({
        where,
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.kycRecord.count({ where }),
    ]);

    const meta = this.calculatePaginationMeta(page, limit, total);

    return { 
      success: true, 
      kycRecords, 
      meta 
    };
  }

  /**
   * Get KYC record by ID
   */
  async getKycRecordById(kycId: string) {
    const kycRecord = await prisma.kycRecord.findUnique({
      where: { id: kycId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!kycRecord) {
      throw new Error('KYC record not found');
    }

    return kycRecord;
  }

  /**
   * Send broadcast notification to users
   */
  async sendBroadcastNotification(data: AdminNotificationDto, adminId: string) {
    // Find users with the specified roles
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: data.targetRoles,
        },
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    // Send notification to each user
    for (const user of users) {
      await this.notificationTrigger.sendAdminBroadcastNotification({
        title: data.title,
        message: data.message,
        userId: user.id,
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
      });
    }

    // Log the broadcast in the audit log
    await prisma.auditLog.create({
      data: {
        action: 'ADMIN_BROADCAST_NOTIFICATION',
        userId: adminId,
        details: JSON.stringify({
          title: data.title,
          targetRoles: data.targetRoles,
          recipientCount: users.length,
        }),
      },
    });

    return {
      success: true,
      recipientCount: users.length,
    };
  }
}