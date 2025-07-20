import { ClientStatus, UserRole } from '@prisma/client';
import { mapClientToDTO } from '../utils/mappers';
import { logger } from '../../../utils/logger';
/**
 * Service for client-related operations
 */
export class ClientService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Apply as a client
     * Creates a new client record and updates user role
     * @param userId User ID
     * @param data Client application data
     * @returns Created client profile
     */
    async applyAsClient(userId, data) {
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
    async getClientById(id) {
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
    async getClientByUserId(userId) {
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
    async updateClient(id, data) {
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
    async updateClientStatus(id, status) {
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
     * Get all clients with optional filtering
     * @param options Filter options
     * @returns List of clients
     */
    async getClients(options) {
        const { status, limit = 50, offset = 0 } = options || {};
        // Build where clause
        const where = {};
        if (status) {
            where.status = status;
        }
        // Get total count
        const total = await this.prisma.client.count({ where });
        // Get clients with pagination
        const clients = await this.prisma.client.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' }
        });
        return {
            clients: clients.map(mapClientToDTO),
            total
        };
    }
}
//# sourceMappingURL=client.service.js.map