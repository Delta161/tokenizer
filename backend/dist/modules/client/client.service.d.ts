import { PrismaClient, ClientStatus } from '@prisma/client';
import { ClientApplicationDTO, ClientUpdateDTO, ClientPublicDTO } from './client.types.js';
export declare class ClientService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Apply to become a client
     * Creates a new client record and updates user role to CLIENT
     */
    applyAsClient(userId: string, applicationData: ClientApplicationDTO): Promise<ClientPublicDTO | null>;
    /**
     * Get client profile by user ID
     */
    getClientByUserId(userId: string): Promise<ClientPublicDTO | null>;
    /**
     * Get client profile by client ID
     */
    getClientById(clientId: string): Promise<ClientPublicDTO | null>;
    /**
     * Update client profile
     */
    updateClient(userId: string, updateData: ClientUpdateDTO): Promise<ClientPublicDTO | null>;
    /**
     * Get all clients (admin only)
     */
    getAllClients(limit?: number, offset?: number, status?: ClientStatus): Promise<ClientPublicDTO[]>;
    /**
     * Get total count of clients
     */
    getClientCount(status?: ClientStatus): Promise<number>;
    /**
     * Update client status (admin only)
     */
    updateClientStatus(clientId: string, status: ClientStatus): Promise<ClientPublicDTO | null>;
    /**
     * Check if user can apply as client
     */
    canUserApplyAsClient(userId: string): Promise<boolean>;
    /**
     * Get clients by status
     */
    getClientsByStatus(status: ClientStatus, limit?: number, offset?: number): Promise<ClientPublicDTO[]>;
}
//# sourceMappingURL=client.service.d.ts.map