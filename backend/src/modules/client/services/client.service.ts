import { PrismaClient, ClientStatus, UserRole, Prisma } from '@prisma/client';
import { ClientApplicationDTO, ClientUpdateDTO, ClientPublicDTO } from '../types/client.types';
import { mapClientToPublicDTO, mapClientsToPublicDTOs } from '../utils/client.mapper';
import { logger } from '../../../utils/logger';
import { prisma as sharedPrisma } from '../utils/prisma';
import { PAGINATION } from '../../../config/constants';
import { PaginationParams, SortingParams, PaginationMeta, calculatePaginationMeta, getSkipValue } from '../../../utils/pagination';

/**
 * Service for client-related operations
 */
export class ClientService {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || sharedPrisma;
  }

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

      return client;
    });

    logger.info('User applied as client', { userId, clientId: result.id });

    return mapClientToPublicDTO(result);
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

    if (!client) {
      return null;
    }

    return mapClientToPublicDTO(client);
  }

  /**
   * Get client by user ID
   * @param userId User ID
   * @returns Client profile or null if not found
   */
  async getClientByUserId(userId: string): Promise<ClientPublicDTO | null> {
    const client = await this.prisma.client.findUnique({
      where: { userId }
    });

    if (!client) {
      return null;
    }

    return mapClientToPublicDTO(client);
  }

  /**
   * Update client profile
   * @param userId User ID
   * @param data Update data
   * @returns Updated client profile or null if not found
   */
  async updateClientProfile(userId: string, data: ClientUpdateDTO): Promise<ClientPublicDTO | null> {
    // Check if client exists
    const existingClient = await this.prisma.client.findUnique({
      where: { userId }
    });

    if (!existingClient) {
      return null;
    }

    // Update client profile
    const updatedClient = await this.prisma.client.update({
      where: { userId },
      data
    });

    logger.info('Client profile updated', { userId, clientId: updatedClient.id });

    return mapClientToPublicDTO(updatedClient);
  }

  /**
   * Update client status (admin only)
   * @param id Client ID
   * @param status New status
   * @returns Updated client profile or null if not found
   */
  async updateClientStatus(id: string, status: ClientStatus): Promise<ClientPublicDTO | null> {
    // Check if client exists
    const existingClient = await this.prisma.client.findUnique({
      where: { id }
    });

    if (!existingClient) {
      return null;
    }

    // Update client status
    const updatedClient = await this.prisma.client.update({
      where: { id },
      data: { status }
    });

    logger.info('Client status updated', { 
      clientId: id, 
      oldStatus: existingClient.status, 
      newStatus: status 
    });

    return mapClientToPublicDTO(updatedClient);
  }

  /**
   * List clients with pagination and filtering
   * @param params Pagination and filter parameters
   * @returns Paginated list of clients
   */
  async listClients(params: {
    skip: number;
    take: number;
    status?: ClientStatus;
    search?: string;
  }): Promise<{ clients: ClientPublicDTO[]; total: number }> {
    const { skip, take, status, search } = params;

    // Build filter conditions
    const where: Prisma.ClientWhereInput = {};

    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    // Add search filter if provided
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get clients with pagination
    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.client.count({ where })
    ]);

    return {
      clients: mapClientsToPublicDTOs(clients),
      total
    };
  }
}

// Create a singleton instance for convenience
export const clientService = new ClientService();