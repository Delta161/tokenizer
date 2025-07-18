import { PrismaClient, Client, ClientStatus, UserRole } from '@prisma/client';
import { ClientApplicationDTO, ClientUpdateDTO, ClientPublicDTO } from './client.types.js';
import { mapClientToPublicDTO, mapClientsToPublicDTOs } from './client.mapper.js';

export class ClientService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Apply to become a client
   * Creates a new client record and updates user role to CLIENT
   */
  async applyAsClient(userId: string, applicationData: ClientApplicationDTO): Promise<ClientPublicDTO | null> {
    try {
      // Check if user already has a client profile
      const existingClient = await this.prisma.client.findUnique({
        where: { userId }
      });

      if (existingClient) {
        throw new Error('User already has a client profile');
      }

      // Check if user exists and has appropriate role
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.role !== UserRole.INVESTOR) {
        throw new Error('Only users with INVESTOR role can apply to become clients');
      }

      // Create client profile and update user role in a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create client profile
        const newClient = await tx.client.create({
          data: {
            userId,
            companyName: applicationData.companyName,
            contactEmail: applicationData.contactEmail,
            contactPhone: applicationData.contactPhone,
            country: applicationData.country,
            legalEntityNumber: applicationData.legalEntityNumber,
            walletAddress: applicationData.walletAddress,
            status: ClientStatus.PENDING
          }
        });

        // Update user role to CLIENT
        await tx.user.update({
          where: { id: userId },
          data: { role: UserRole.CLIENT }
        });

        return newClient;
      });

      return mapClientToPublicDTO(result);
    } catch (error) {
      console.error('Error applying as client:', error);
      throw error;
    }
  }

  /**
   * Get client profile by user ID
   */
  async getClientByUserId(userId: string): Promise<ClientPublicDTO | null> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { userId }
      });

      if (!client) {
        return null;
      }

      return mapClientToPublicDTO(client);
    } catch (error) {
      console.error('Error fetching client by user ID:', error);
      throw error;
    }
  }

  /**
   * Get client profile by client ID
   */
  async getClientById(clientId: string): Promise<ClientPublicDTO | null> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id: clientId }
      });

      if (!client) {
        return null;
      }

      return mapClientToPublicDTO(client);
    } catch (error) {
      console.error('Error fetching client by ID:', error);
      throw error;
    }
  }

  /**
   * Update client profile
   */
  async updateClient(userId: string, updateData: ClientUpdateDTO): Promise<ClientPublicDTO | null> {
    try {
      // Verify client exists and belongs to user
      const existingClient = await this.prisma.client.findUnique({
        where: { userId }
      });

      if (!existingClient) {
        return null;
      }

      // Filter out undefined values
      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      if (Object.keys(filteredData).length === 0) {
        return mapClientToPublicDTO(existingClient);
      }

      const updatedClient = await this.prisma.client.update({
        where: { userId },
        data: filteredData
      });

      return mapClientToPublicDTO(updatedClient);
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  /**
   * Get all clients (admin only)
   */
  async getAllClients(limit: number = 50, offset: number = 0, status?: ClientStatus): Promise<ClientPublicDTO[]> {
    try {
      const whereClause = status ? { status } : {};

      const clients = await this.prisma.client.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return mapClientsToPublicDTOs(clients);
    } catch (error) {
      console.error('Error fetching all clients:', error);
      throw error;
    }
  }

  /**
   * Get total count of clients
   */
  async getClientCount(status?: ClientStatus): Promise<number> {
    try {
      const whereClause = status ? { status } : {};

      return await this.prisma.client.count({
        where: whereClause
      });
    } catch (error) {
      console.error('Error counting clients:', error);
      throw error;
    }
  }

  /**
   * Update client status (admin only)
   */
  async updateClientStatus(clientId: string, status: ClientStatus): Promise<ClientPublicDTO | null> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id: clientId }
      });

      if (!client) {
        return null;
      }

      const updatedClient = await this.prisma.client.update({
        where: { id: clientId },
        data: { status }
      });

      return mapClientToPublicDTO(updatedClient);
    } catch (error) {
      console.error('Error updating client status:', error);
      throw error;
    }
  }

  /**
   * Check if user can apply as client
   */
  async canUserApplyAsClient(userId: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { client: true }
      });

      if (!user) {
        return false;
      }

      // User must be an INVESTOR and not have an existing client profile
      return user.role === UserRole.INVESTOR && !user.client;
    } catch (error) {
      console.error('Error checking if user can apply as client:', error);
      return false;
    }
  }

  /**
   * Get clients by status
   */
  async getClientsByStatus(status: ClientStatus, limit: number = 50, offset: number = 0): Promise<ClientPublicDTO[]> {
    try {
      const clients = await this.prisma.client.findMany({
        where: { status },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return mapClientsToPublicDTOs(clients);
    } catch (error) {
      console.error('Error fetching clients by status:', error);
      throw error;
    }
  }
}