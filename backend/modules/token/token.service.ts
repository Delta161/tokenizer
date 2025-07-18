import { PrismaClient, PropertyStatus } from '@prisma/client';
import { TokenCreateDTO, TokenUpdateDTO, TokenPublicDTO, TokenListQuery } from './token.types.js';
import { mapTokenToPublicDTO, mapTokensToPublicDTOs } from './token.mapper.js';
import { isAddress } from 'ethers';

export class TokenService {
  constructor(private prisma: PrismaClient) {}

  async create(dto: TokenCreateDTO): Promise<TokenPublicDTO> {
    // Ensure property exists and is APPROVED
    const property = await this.prisma.property.findUnique({ where: { id: dto.propertyId } });
    if (!property || property.status !== PropertyStatus.APPROVED) {
      throw new Error('Property must exist and be APPROVED');
    }
    // Prevent duplicate token for same property
    const existing = await this.prisma.token.findUnique({ where: { propertyId: dto.propertyId } });
    if (existing) {
      throw new Error('Token already exists for this property');
    }
    // Validate contract address
    if (!isAddress(dto.contractAddress)) {
      throw new Error('Invalid Ethereum contract address');
    }
    // Create token
    const token = await this.prisma.token.create({
      data: {
        propertyId: dto.propertyId,
        name: dto.name,
        symbol: dto.symbol,
        decimals: dto.decimals,
        totalSupply: dto.totalSupply.toString(),
        contractAddress: dto.contractAddress,
        chainId: dto.chainId,
      },
    });
    return mapTokenToPublicDTO(token);
  }

  async getAll(query: TokenListQuery = {}): Promise<TokenPublicDTO[]> {
    const where: any = {};
    if (query.propertyId) where.propertyId = query.propertyId;
    if (query.symbol) where.symbol = query.symbol;
    if (query.chainId) where.chainId = query.chainId;
    const tokens = await this.prisma.token.findMany({ where, orderBy: { createdAt: 'desc' } });
    return mapTokensToPublicDTOs(tokens);
  }

  async getById(id: string): Promise<TokenPublicDTO | null> {
    const token = await this.prisma.token.findUnique({ where: { id } });
    return token ? mapTokenToPublicDTO(token) : null;
  }

  async update(id: string, dto: TokenUpdateDTO): Promise<TokenPublicDTO | null> {
    const token = await this.prisma.token.findUnique({ where: { id } });
    if (!token) return null;
    if (dto.contractAddress && !isAddress(dto.contractAddress)) {
      throw new Error('Invalid Ethereum contract address');
    }
    const updated = await this.prisma.token.update({ where: { id }, data: dto });
    return mapTokenToPublicDTO(updated);
  }

  async delete(id: string): Promise<boolean> {
    // Only allow delete if no investments exist
    const token = await this.prisma.token.findUnique({ where: { id }, include: { property: true } });
    if (!token) return false;
    const investments = await this.prisma.investment.findFirst({ where: { tokenId: id } });
    if (investments) return false;
    await this.prisma.token.delete({ where: { id } });
    return true;
  }

  async getAllPublic(): Promise<TokenPublicDTO[]> {
    // Only tokens linked to APPROVED properties
    const tokens = await this.prisma.token.findMany({
      where: {
        property: { status: PropertyStatus.APPROVED },
      },
      orderBy: { createdAt: 'desc' },
    });
    return mapTokensToPublicDTOs(tokens);
  }
}