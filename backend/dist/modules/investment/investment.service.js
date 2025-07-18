import { PropertyStatus } from '@prisma/client';
import { mapInvestmentToPublicDTO, mapInvestmentsToPublicDTOs } from './investment.mapper.js';
import { isAddress } from 'ethers';
export class InvestmentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(investorId, dto) {
        // Validate token and property
        const token = await this.prisma.token.findUnique({ where: { id: dto.tokenId }, include: { property: true } });
        if (!token || !token.property || token.property.status !== PropertyStatus.APPROVED) {
            throw new Error('Token and property must exist and be APPROVED');
        }
        // Validate supply (tokensBought <= totalSupply)
        if (Number(dto.tokensBought) > Number(token.totalSupply)) {
            throw new Error('Not enough token supply');
        }
        // Validate Ethereum address
        if (!isAddress(dto.walletAddress)) {
            throw new Error('Invalid Ethereum address');
        }
        // Prevent duplicate txHash (future on-chain integration)
        // Not enforced here as txHash is optional on creation
        // Create investment
        const investment = await this.prisma.investment.create({
            data: {
                investorId,
                tokenId: dto.tokenId,
                propertyId: dto.propertyId,
                amount: dto.amount.toString(),
                tokensBought: dto.tokensBought.toString(),
                status: 'PENDING',
                walletAddress: dto.walletAddress,
            },
        });
        return mapInvestmentToPublicDTO(investment);
    }
    async getMyInvestments(investorId) {
        const investments = await this.prisma.investment.findMany({ where: { investorId }, orderBy: { createdAt: 'desc' } });
        return mapInvestmentsToPublicDTOs(investments);
    }
    async getAll(query = {}) {
        const where = {};
        if (query.investorId)
            where.investorId = query.investorId;
        if (query.tokenId)
            where.tokenId = query.tokenId;
        if (query.propertyId)
            where.propertyId = query.propertyId;
        if (query.status)
            where.status = query.status;
        const investments = await this.prisma.investment.findMany({ where, orderBy: { createdAt: 'desc' } });
        return mapInvestmentsToPublicDTOs(investments);
    }
    async getById(id) {
        const investment = await this.prisma.investment.findUnique({ where: { id } });
        return investment ? mapInvestmentToPublicDTO(investment) : null;
    }
    async updateStatus(id, dto) {
        const investment = await this.prisma.investment.findUnique({ where: { id } });
        if (!investment)
            return null;
        // Prevent duplicate txHash
        if (dto.txHash) {
            const exists = await this.prisma.investment.findUnique({ where: { txHash: dto.txHash } });
            if (exists && exists.id !== id) {
                throw new Error('Duplicate txHash');
            }
        }
        const updated = await this.prisma.investment.update({ where: { id }, data: { status: dto.status, txHash: dto.txHash } });
        return mapInvestmentToPublicDTO(updated);
    }
}
//# sourceMappingURL=investment.service.js.map