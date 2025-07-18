import { PrismaClient } from '@prisma/client';
import { PropertyCreateDTO, PropertyUpdateDTO, PropertyStatusUpdateDTO, PropertyPublicDTO, PropertyListQuery } from './property.types.js';
export declare class PropertyService {
    private prisma;
    constructor(prisma: PrismaClient);
    getAllApproved(query: PropertyListQuery): Promise<PropertyPublicDTO[]>;
    getByIdIfApproved(id: string): Promise<PropertyPublicDTO | null>;
    getMyProperties(clientId: string): Promise<PropertyPublicDTO[]>;
    create(clientId: string, dto: PropertyCreateDTO): Promise<PropertyPublicDTO>;
    update(clientId: string, id: string, dto: PropertyUpdateDTO): Promise<PropertyPublicDTO | null>;
    delete(clientId: string, id: string): Promise<boolean>;
    getAllAdmin(query: PropertyListQuery): Promise<PropertyPublicDTO[]>;
    updateStatus(id: string, dto: PropertyStatusUpdateDTO): Promise<PropertyPublicDTO | null>;
}
//# sourceMappingURL=property.service.d.ts.map