import { PrismaClient, PropertyStatus } from '@prisma/client';
import { Logger } from '../../../utils/logger.js';
const prisma = new PrismaClient();
const logger = new Logger('AdminService');
export class AdminService {
    notificationTrigger;
    constructor(notificationTrigger) {
        this.notificationTrigger = notificationTrigger;
    }
    /**
     * Get all users with optional filtering
     */
    async getUsers(filters) {
        const { role, email, registrationDateFrom, registrationDateTo, limit = 10, offset = 0 } = filters;
        const where = {};
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
                skip: offset,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);
        return { users, total };
    }
    /**
     * Get user by ID
     */
    async getUserById(userId) {
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
    async updateUserRole(userId, data, adminId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role: data.role },
        });
        logger.info('User role updated', {
            userId,
            oldRole: user.role,
            newRole: data.role,
            adminId,
        });
        return updatedUser;
    }
    /**
     * Update user active status
     */
    async updateUserStatus(userId, data, adminId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isActive: data.isActive },
        });
        logger.info('User status updated', {
            userId,
            oldStatus: user.isActive,
            newStatus: data.isActive,
            adminId,
        });
        return updatedUser;
    }
    /**
     * Get all properties with optional filtering
     */
    async getProperties(filters) {
        const { status, limit = 10, offset = 0 } = filters;
        const where = {};
        if (status) {
            where.status = status;
        }
        const [properties, total] = await Promise.all([
            prisma.property.findMany({
                where,
                include: {
                    client: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                skip: offset,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.property.count({ where }),
        ]);
        return { properties, total };
    }
    /**
     * Get property by ID
     */
    async getPropertyById(propertyId) {
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                client: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
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
    async moderateProperty(propertyId, data, adminId) {
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: { client: true },
        });
        if (!property) {
            throw new Error('Property not found');
        }
        if (property.status !== PropertyStatus.SUBMITTED) {
            throw new Error('Only properties in SUBMITTED status can be moderated');
        }
        const updatedProperty = await prisma.property.update({
            where: { id: propertyId },
            data: {
                status: data.status,
                moderationComment: data.comment,
                moderatedAt: new Date(),
                moderatedBy: adminId,
            },
            include: { client: true },
        });
        // Send notification to the property owner
        const notificationTitle = data.status === PropertyStatus.APPROVED
            ? 'Property Approved'
            : 'Property Rejected';
        const notificationMessage = data.status === PropertyStatus.APPROVED
            ? `Your property "${property.name}" has been approved.`
            : `Your property "${property.name}" has been rejected. Reason: ${data.comment}`;
        await this.notificationTrigger.triggerNotification({
            userId: property.clientId,
            title: notificationTitle,
            message: notificationMessage,
            metadata: {
                propertyId: property.id,
                status: data.status,
            },
        });
        logger.info('Property moderated', {
            propertyId,
            status: data.status,
            adminId,
        });
        return updatedProperty;
    }
    /**
     * Get all tokens with optional filtering
     */
    async getTokens(filters) {
        const { symbol, chainId, propertyId, limit = 10, offset = 0 } = filters;
        const where = {};
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
        const [tokens, total] = await Promise.all([
            prisma.token.findMany({
                where,
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true,
                            status: true,
                        },
                    },
                },
                skip: offset,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.token.count({ where }),
        ]);
        return { tokens, total };
    }
    /**
     * Get token by ID
     */
    async getTokenById(tokenId) {
        const token = await prisma.token.findUnique({
            where: { id: tokenId },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        client: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
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
    async getKycRecords(filters) {
        const { status, limit = 10, offset = 0 } = filters;
        const where = {};
        if (status) {
            where.status = status;
        }
        const [kycRecords, total] = await Promise.all([
            prisma.kycRecord.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            role: true,
                        },
                    },
                },
                skip: offset,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.kycRecord.count({ where }),
        ]);
        return { kycRecords, total };
    }
    /**
     * Get KYC record by ID
     */
    async getKycRecordById(kycId) {
        const kycRecord = await prisma.kycRecord.findUnique({
            where: { id: kycId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
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
    async sendBroadcastNotification(data, adminId) {
        const { title, message, targetRoles } = data;
        // Get all users with the specified roles
        const users = await prisma.user.findMany({
            where: {
                role: { in: targetRoles },
                isActive: true,
            },
            select: { id: true },
        });
        if (users.length === 0) {
            throw new Error('No active users found with the specified roles');
        }
        // Send broadcast notification
        await this.notificationTrigger.triggerBroadcast({
            title,
            message,
            metadata: {
                type: 'ADMIN_BROADCAST',
                targetRoles,
            },
            excludeUserId: adminId,
        });
        logger.info('Broadcast notification sent', {
            title,
            targetRoles,
            recipientCount: users.length,
            adminId,
        });
        return { success: true, recipientCount: users.length };
    }
}
//# sourceMappingURL=admin.service.js.map