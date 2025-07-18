import { PrismaClient, PropertyStatus } from '@prisma/client';
import {
  PropertyCreateDTO,
  PropertyUpdateDTO,
  PropertyStatusUpdateDTO,
  PropertyPublicDTO,
  PropertyListQuery
} from './property.types.js';
import { mapPropertyToPublicDTO, mapPropertiesToPublicDTOs } from './property.mapper.js';

export class PropertyService {
  constructor(private prisma: PrismaClient) {}

  async getAllApproved(query: PropertyListQuery): Promise<PropertyPublicDTO[]> {
    const where = { status: PropertyStatus.APPROVED };
    const properties = await this.prisma.property.findMany({ where, orderBy: { createdAt: 'desc' } });
    return mapPropertiesToPublicDTOs(properties);
  }

  async getByIdIfApproved(id: string): Promise<PropertyPublicDTO | null> {
    const property = await this.prisma.property.findFirst({ where: { id, status: PropertyStatus.APPROVED } });
    return property ? mapPropertyToPublicDTO(property) : null;
  }

  async getMyProperties(clientId: string): Promise<PropertyPublicDTO[]> {
    const properties = await this.prisma.property.findMany({ where: { clientId }, orderBy: { createdAt: 'desc' } });
    return mapPropertiesToPublicDTOs(properties);
  }

  async create(clientId: string, dto: PropertyCreateDTO): Promise<PropertyPublicDTO> {
    const property = await this.prisma.property.create({
      data: {
        ...dto,
        clientId,
        status: PropertyStatus.DRAFT,
        imageUrls: dto.imageUrls,
        totalPrice: dto.totalPrice,
        tokenPrice: dto.tokenPrice,
        irr: dto.irr,
        apr: dto.apr,
        valueGrowth: dto.valueGrowth,
        minInvestment: dto.minInvestment,
        tokensAvailablePercent: dto.tokensAvailablePercent,
        tokenSymbol: dto.tokenSymbol,
      },
    });
    return mapPropertyToPublicDTO(property);
  }

  async update(clientId: string, id: string, dto: PropertyUpdateDTO): Promise<PropertyPublicDTO | null> {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property || property.clientId !== clientId || property.status === PropertyStatus.APPROVED) return null;
    const updated = await this.prisma.property.update({ where: { id }, data: dto });
    return mapPropertyToPublicDTO(updated);
  }

  async delete(clientId: string, id: string): Promise<boolean> {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property || property.clientId !== clientId || property.status === PropertyStatus.APPROVED) return false;
    await this.prisma.property.delete({ where: { id } });
    return true;
  }

  async getAllAdmin(query: PropertyListQuery): Promise<PropertyPublicDTO[]> {
    const where: any = {};
    if (query.status) where.status = query.status;
    const properties = await this.prisma.property.findMany({ where, orderBy: { createdAt: 'desc' } });
    return mapPropertiesToPublicDTOs(properties);
  }

  async updateStatus(id: string, dto: PropertyStatusUpdateDTO): Promise<PropertyPublicDTO | null> {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) return null;
    const updated = await this.prisma.property.update({ where: { id }, data: { status: dto.status } });
    return mapPropertyToPublicDTO(updated);
  }
}