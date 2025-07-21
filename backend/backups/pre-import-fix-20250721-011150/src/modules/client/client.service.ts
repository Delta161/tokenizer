import { PrismaClient, ClientStatus, UserRole, Prisma } from '@prisma/client';
import { ClientApplicationDTO, ClientUpdateDTO, ClientPublicDTO } from './client.types';
import { mapClientToPublicDTO, mapClientsToPublicDTOs } from './client.mapper';
import { logger } from '../../utils/logger';

/**
 * Service for client-related operations
 */
export class ClientService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Apply as a client
   * Creates a new client record and updates user role
   * @param userId User ID
   * @param data Client application data
   * @returns Created client profile
   */
  async applyAsClient(userId: string, data: ClientApplicationDTO): Promise<ClientPublicDTO> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { client: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user already has a client profile
    if (user.client) {
      throw new Error('User already has a client profile');
    }

    // Check if user has the INVESTOR role
    if (user.role !== UserRole.INVESTOR) {
      throw new Error('Only users with INVESTOR role can apply as clients');
    }

    // Create client profile and update user role in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create client profile
      const client = await tx.client.create({
        data: {
          userId,
          companyName: data.companyName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          country: data.country,
          legalEntityNumber: data.legalEntityNumber,
          walletAddress: data.walletAddress,
          status: ClientStatus.PENDING
        }
      });

      // Update user role to CLIENT
      await tx.user.update({
        where: { id: userId },
        data: { role: UserRole.CLIENT }
      });

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          userId,
          action: 'CLIENT_APPLICATION',
          resource: 'client',
          resourceId: client.id,
          details: JSON.stringify({
            status: client.status,
            companyName: client.companyName
          })
        }
      });

      return client;
    });

    logger.info('User applied as client', { userId, clientId: result.id });
    return mapClientToPublicDTO(result);
  }

  /**
   * Get client by user ID
   * @param userId User ID
   * @returns Client profile or null if not found
   */
  async getClientByUserId(userId: string): Promise<ClientPublicDTO | null> {
    const client = await this.prisma.client.findFirst({
      where: { userId }
    });

    return client ? mapClientToPublicDTO(client) : null;
  }

  /**
   * Get client by ID
   * @param id Client ID
   * @returns Client profile or null if not found
   */
  async getClientById(id: string): Promise<ClientPublicDTO | null> {
    const client = await this.prisma.client.findUnique({
      where: { id }
    });

    return client ? mapClientToPublicDTO(client) : null;
  }

  /**
   * Update client profile
   * @param userId User ID
   * @param data Update data
   * @returns Updated client profile
   */
  async updateClient(userId: string, data: ClientUpdateDTO): Promise<ClientPublicDTO | null> {
    // Filter out undefined values
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    // Check if client exists and belongs to user
    const existingClient = await this.prisma.client.findFirst({
      where: { userId }
    });

    if (!existingClient) {
      return null;
    }

    // Update client profile
    const updatedClient = await this.prisma.$transaction(async (tx) => {
      const client = await tx.client.update({
        where: { id: existingClient.id },
        data: updateData
      });

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          userId,
          action: 'CLIENT_UPDATE',
          resource: 'client',
          resourceId: client.id,
          details: JSON.stringify({
            updatedFields: Object.keys(updateData)
          })
        }
      });

      return client;
    });

    logger.info('Client profile updated', { userId, clientId: updatedClient.id });
    return mapClientToPublicDTO(updatedClient);
  }

  /**
   * Get all clients with optional filtering and pagination
   * For admin use
   * @param limit Maximum number of clients to return
   * @param offset Number of clients to skip
   * @param status Optional status filter
   * @returns Array of client profiles
   */
  async getAllClients(
    limit: number = 50,
    offset: number = 0,
    status?: ClientStatus
  ): Promise<ClientPublicDTO[]> {
    const where = status ? { status } : {};

    const clients = await this.prisma.client.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });

    return mapClientsToPublicDTOs(clients);
  }

  /**
   * Count clients with optional status filtering
   * @param status Optional status filter
   * @returns Total count of clients matching filter
   */
  async getClientCount(status?: ClientStatus): Promise<number> {
    const where = status ? { status } : {};
    return this.prisma.client.count({ where });
  }

  /**
   * Update client status (for admin use)
   * @param id Client ID
   * @param status New status
   * @param adminId Admin user ID for audit logging
   * @returns Updated client profile
   */
  async updateClientStatus(
    id: string,
    status: ClientStatus,
    adminId?: string
  ): Promise<ClientPublicDTO | null> {
    // Check if client exists
    const existingClient = await this.prisma.client.findUnique({
      where: { id }
    });

    if (!existingClient) {
      return null;
    }

    // Update client status
    const updatedClient = await this.prisma.$transaction(async (tx) => {
      const client = await tx.client.update({
        where: { id },
        data: { status }
      });

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          userId: adminId || 'system',
          action: 'CLIENT_STATUS_UPDATE',
          resource: 'client',
          resourceId: client.id,
          details: JSON.stringify({
            previousStatus: existingClient.status,
            newStatus: status
          })
        }
      });

      return client;
    });

    logger.info('Client status updated', {
      clientId: id,
      previousStatus: existingClient.status,
      newStatus: status,
      updatedBy: adminId || 'system'
    });

    return mapClientToPublicDTO(updatedClient);
  }

  /**
   * Check if a user can apply as a client
   * @param userId User ID
   * @returns Boolean indicating if user can apply
   */
  async canUserApplyAsClient(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { client: true }
    });

    // User must exist, have INVESTOR role, and not already have a client profile
    return !!user && user.role === UserRole.INVESTOR && !user.client;
  }

  /**
   * Get clients by status with pagination
   * @param status Client status
   * @param limit Maximum number of clients to return
   * @param offset Number of clients to skip
   * @returns Array of client profiles
   */
  async getClientsByStatus(
    status: ClientStatus,
    limit: number = 50,
    offset: number = 0
  ): Promise<ClientPublicDTO[]> {
    const clients = await this.prisma.client.findMany({
      where: { status },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });

    return mapClientsToPublicDTOs(clients);
  }
}