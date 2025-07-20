import { PrismaClient, ClientStatus } from '@prisma/client';
import { ClientApplicationDTO, ClientUpdateDTO, ClientPublicDTO } from './client.types';
/**
 * Service for client-related operations
 */
export declare class ClientService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Apply as a client
     * Creates a new client record and updates user role
     * @param userId User ID
     * @param data Client application data
     * @returns Created client profile
     */
    applyAsClient(userId: string, data: ClientApplicationDTO): Promise<ClientPublicDTO>;
    /**
     * Get client by user ID
     * @param userId User ID
     * @returns Client profile or null if not found
     */
    getClientByUserId(userId: string): Promise<ClientPublicDTO | null>;
    /**
     * Get client by ID
     * @param id Client ID
     * @returns Client profile or null if not found
     */
    getClientById(id: string): Promise<ClientPublicDTO | null>;
    /**
     * Update client profile
     * @param userId User ID
     * @param data Update data
     * @returns Updated client profile
     */
    updateClient(userId: string, data: ClientUpdateDTO): Promise<ClientPublicDTO | null>;
    /**
     * Get all clients with optional filtering and pagination
     * For admin use
     * @param limit Maximum number of clients to return
     * @param offset Number of clients to skip
     * @param status Optional status filter
     * @returns Array of client profiles
     */
    getAllClients(limit?: number, offset?: number, status?: ClientStatus): Promise<ClientPublicDTO[]>;
    /**
     * Count clients with optional status filtering
     * @param status Optional status filter
     * @returns Total count of clients matching filter
     */
    getClientCount(status?: ClientStatus): Promise<number>;
    /**
     * Update client status (for admin use)
     * @param id Client ID
     * @param status New status
     * @param adminId Admin user ID for audit logging
     * @returns Updated client profile
     */
    updateClientStatus(id: string, status: ClientStatus, adminId?: string): Promise<ClientPublicDTO | null>;
    /**
     * Check if a user can apply as a client
     * @param userId User ID
     * @returns Boolean indicating if user can apply
     */
    canUserApplyAsClient(userId: string): Promise<boolean>;
    /**
     * Get clients by status with pagination
     * @param status Client status
     * @param limit Maximum number of clients to return
     * @param offset Number of clients to skip
     * @returns Array of client profiles
     */
    getClientsByStatus(status: ClientStatus, limit?: number, offset?: number): Promise<ClientPublicDTO[]>;
}
//# sourceMappingURL=client.service.d.ts.map