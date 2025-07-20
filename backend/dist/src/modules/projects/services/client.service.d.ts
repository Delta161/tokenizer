import { PrismaClient, ClientStatus } from '@prisma/client';
import { ClientApplicationDTO, ClientUpdateDTO, ClientPublicDTO } from '../types';
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
     * Get client by ID
     * @param id Client ID
     * @returns Client profile or null if not found
     */
    getClientById(id: string): Promise<ClientPublicDTO | null>;
    /**
     * Get client by user ID
     * @param userId User ID
     * @returns Client profile or null if not found
     */
    getClientByUserId(userId: string): Promise<ClientPublicDTO | null>;
    /**
     * Update client profile
     * @param id Client ID
     * @param data Update data
     * @returns Updated client profile
     */
    updateClient(id: string, data: ClientUpdateDTO): Promise<ClientPublicDTO>;
    /**
     * Update client status
     * @param id Client ID
     * @param status New status
     * @returns Updated client profile
     */
    updateClientStatus(id: string, status: ClientStatus): Promise<ClientPublicDTO>;
    /**
     * Get all clients with optional filtering
     * @param options Filter options
     * @returns List of clients
     */
    getClients(options?: {
        status?: ClientStatus;
        limit?: number;
        offset?: number;
    }): Promise<{
        clients: ClientPublicDTO[];
        total: number;
    }>;
}
//# sourceMappingURL=client.service.d.ts.map