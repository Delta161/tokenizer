/**
 * User Service
 * Handles user-related business logic
 */
import bcrypt from 'bcrypt';
import { prisma } from '../../prisma/client';
import { AppError } from '../../middleware/errorHandler';
import { PAGINATION } from '../../config/constants';
export class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Get all users with pagination and filtering
     */
    async getUsers(page = 1, limit = PAGINATION.DEFAULT_LIMIT, filters, sort) {
        const skip = (page - 1) * limit;
        // Build filter conditions
        const where = {};
        if (filters?.role) {
            where.role = filters.role;
        }
        if (filters?.search) {
            where.OR = [
                { firstName: { contains: filters.search, mode: 'insensitive' } },
                { lastName: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } }
            ];
        }
        if (filters?.createdAfter) {
            where.createdAt = { ...where.createdAt, gte: filters.createdAfter };
        }
        if (filters?.createdBefore) {
            where.createdAt = { ...where.createdAt, lte: filters.createdBefore };
        }
        // Build sort options
        const orderBy = {};
        if (sort) {
            orderBy[sort.field] = sort.direction;
        }
        else {
            orderBy.createdAt = 'desc';
        }
        // Get users and total count
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }
            }),
            this.prisma.user.count({ where })
        ]);
        return { users: users, total };
    }
    /**
     * Get user by ID
     */
    async getUserById(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return user;
    }
    /**
     * Create a new user
     */
    async createUser(data) {
        // Check if user with email already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            throw new AppError('User with this email already exists', 400);
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);
        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role || 'USER'
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return user;
    }
    /**
     * Update user
     */
    async updateUser(userId, data) {
        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!existingUser) {
            throw new AppError('User not found', 404);
        }
        // Check if email is being updated and is already taken
        if (data.email && data.email !== existingUser.email) {
            const emailTaken = await this.prisma.user.findUnique({
                where: { email: data.email }
            });
            if (emailTaken) {
                throw new AppError('Email is already taken', 400);
            }
        }
        // Update user
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return updatedUser;
    }
    /**
     * Delete user
     */
    async deleteUser(userId) {
        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!existingUser) {
            throw new AppError('User not found', 404);
        }
        // Delete user
        await this.prisma.user.delete({
            where: { id: userId }
        });
    }
    /**
     * Change user password
     */
    async changePassword(userId, data) {
        // Get user with password
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new AppError('User not found', 404);
        }
        // Verify current password
        const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new AppError('Current password is incorrect', 400);
        }
        // Hash new password
        const hashedPassword = await bcrypt.hash(data.newPassword, 10);
        // Update password
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
    }
}
// Create singleton instance
export const userService = new UserService(prisma);
//# sourceMappingURL=user.service.js.map