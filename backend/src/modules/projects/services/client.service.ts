import { PrismaClient, ClientStatus, UserRole, Prisma } from '@prisma/client';
import { ClientApplicationDTO, ClientUpdateDTO, ClientPublicDTO } from '../types';
import { mapClientToDTO } from '../utils/mappers';
import { logger } from '../../../utils/logger';
import { PAGINATION } from '@config/constants';
import { getSkipValue } from '@utils/pagination';

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

      // Update user role
      await tx.user.update({
        where: { id: userId },
        data: { role: UserRole.CLIENT }
      });

      return client;
    });

    logger.info(`User ${userId} applied as client with ID ${result.id}`);
    return mapClientToDTO(result);
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

    return mapClientToDTO(client);
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

    return mapClientToDTO(client);
  }

  /**
   * Update client profile
   * @param id Client ID
   * @param data Update data
   * @returns Updated client profile
   */
  async updateClient(id: string, data: ClientUpdateDTO): Promise<ClientPublicDTO> {
    // Check if client exists
    const existingClient = await this.prisma.client.findUnique({
      where: { id }
    });

    if (!existingClient) {
      throw new Error('Client not found');
    }

    // Update client profile
    const updatedClient = await this.prisma.client.update({
      where: { id },
      data
    });

    logger.info(`Client ${id} profile updated`);
    return mapClientToDTO(updatedClient);
  }

  /**
   * Update client status
   * @param id Client ID
   * @param status New status
   * @returns Updated client profile
   */
  async updateClientStatus(id: string, status: ClientStatus): Promise<ClientPublicDTO> {
    // Check if client exists
    const existingClient = await this.prisma.client.findUnique({
      where: { id }
    });

    if (!existingClient) {
      throw new Error('Client not found');
    }

    // Update client status
    const updatedClient = await this.prisma.client.update({
      where: { id },
      data: { status }
    });

    logger.info(`Client ${id} status updated to ${status}`);
    return mapClientToDTO(updatedClient);
  }

  /**
   * Get all clients with optional filtering and pagination
   * @param options Filter and pagination options
   * @returns List of clients and total count
   */
  async getClients(options?: {
    status?: ClientStatus;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ clients: ClientPublicDTO[]; total: number }> {
    const { 
      status, 
      page = PAGINATION.DEFAULT_PAGE, 
      limit = PAGINATION.DEFAULT_LIMIT, 
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options || {};
    
    const skip = getSkipValue(page, limit);

    // Build where clause
    const where: Prisma.ClientWhereInput = {};
    if (status) {
      where.status = status;
    }

    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get total count and clients in parallel
    const [total, clients] = await Promise.all([
      this.prisma.client.count({ where }),
      this.prisma.client.findMany({
        where,
        take: limit,
        skip,
        orderBy
      })
    ]);

    return {
      clients: clients.map(mapClientToDTO),
      total
    };
  }
}