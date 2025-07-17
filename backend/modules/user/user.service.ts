import { PrismaClient, User, UserRole } from '@prisma/client';
import { UpdateUserDTO, UserPublicDTO } from './user.types';
import { mapUserToPublicDTO, isUserDeleted } from './user.mapper';

export class UserService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get user profile by ID
   * Returns null if user doesn't exist or is soft deleted
   */
  async getUserById(userId: string): Promise<UserPublicDTO | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || isUserDeleted(user)) {
        return null;
      }

      return mapUserToPublicDTO(user);
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Get user profile by email
   * Returns null if user doesn't exist or is soft deleted
   */
  async getUserByEmail(email: string): Promise<UserPublicDTO | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user || isUserDeleted(user)) {
        return null;
      }

      return mapUserToPublicDTO(user);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Update user profile
   * Only allows updating specific fields, prevents role/provider changes
   */
  async updateUser(userId: string, updateData: UpdateUserDTO): Promise<UserPublicDTO | null> {
    try {
      // First check if user exists and is not deleted
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser || isUserDeleted(existingUser)) {
        return null;
      }

      // Update user with only allowed fields
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      return mapUserToPublicDTO(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user profile');
    }
  }

  /**
   * Soft delete user account
   * Sets deletedAt timestamp instead of physically removing the record
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      // Check if user exists and is not already deleted
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser || isUserDeleted(existingUser)) {
        return false;
      }

      // Soft delete by setting deletedAt timestamp
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user account');
    }
  }

  /**
   * Check if user exists and is active (not soft deleted)
   */
  async isUserActive(userId: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, deletedAt: true },
      });

      return user !== null && user.deletedAt === null;
    } catch (error) {
      console.error('Error checking user status:', error);
      return false;
    }
  }

  /**
   * Check if user has specific role
   */
  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, deletedAt: true },
      });

      return user !== null && user.deletedAt === null && user.role === role;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }

  /**
   * Get all active users (admin only)
   * Returns users that are not soft deleted
   */
  async getAllActiveUsers(limit: number = 50, offset: number = 0): Promise<UserPublicDTO[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });

      return users.map(mapUserToPublicDTO);
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Get user count (admin only)
   */
  async getUserCount(): Promise<number> {
    try {
      return await this.prisma.user.count({
        where: {
          deletedAt: null,
        },
      });
    } catch (error) {
      console.error('Error counting users:', error);
      throw new Error('Failed to count users');
    }
  }
}