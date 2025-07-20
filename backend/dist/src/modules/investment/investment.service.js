import { PropertyStatus } from '@prisma/client';
import { mapInvestmentToPublicDTO, mapInvestmentsToPublicDTOs } from './investment.mapper';
import { isAddress } from 'ethers';
export class InvestmentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(investorId, dto) {
        // Validate token and property
        const token = await this.prisma.token.findUnique({ where: { id: dto.tokenId }, include: { property: true } });
        if (!token) {
            throw new Error('Token not found');
        }
        if (!token.isActive) {
            throw new Error('Token is not active');
        }
        if (!token.property) {
            throw new Error('Property not found');
        }
        if (token.property.status !== PropertyStatus.APPROVED) {
            throw new Error('Property must be APPROVED');
        }
        // Validate supply (tokensBought <= totalSupply)
        const tokensRequested = parseFloat(dto.amount) / parseFloat(dto.tokensBought);
        if (tokensRequested > token.totalSupply) {
            throw new Error(`Not enough token supply. Requested: ${tokensRequested}, Available: ${token.totalSupply}`);
        }
        // Validate Ethereum address
        if (!isAddress(dto.walletAddress)) {
            throw new Error('Invalid Ethereum address');
        }
        // Create investment
        try {
            const investment = await this.prisma.investment.create({
                data: {
                    investorId,
                    tokenId: dto.tokenId,
                    propertyId: dto.propertyId,
                    amount: parseInt(dto.amount),
                    pricePerToken: dto.tokensBought,
                    totalValue: (parseFloat(dto.amount) * parseFloat(dto.tokensBought)).toString(),
                    currency: dto.currency || 'USD',
                    paymentMethod: dto.paymentMethod || 'CRYPTO',
                    status: 'PENDING',
                    walletAddress: dto.walletAddress,
                },
            });
            return mapInvestmentToPublicDTO(investment);
        }
        catch (error) {
            const errorObj = error;
            throw new Error(`Failed to create investment: ${errorObj.message}`);
        }
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
        try {
            const investment = await this.prisma.investment.findUnique({ where: { id } });
            if (!investment) {
                throw new Error(`Investment with ID ${id} not found`);
            }
            return mapInvestmentToPublicDTO(investment);
        }
        catch (error) {
            const errorObj = error;
            throw new Error(`Failed to retrieve investment: ${errorObj.message}`);
        }
    }
    async updateStatus(id, dto) {
        // Validate investment exists
        const investment = await this.prisma.investment.findUnique({ where: { id } });
        if (!investment) {
            throw new Error(`Investment with ID ${id} not found`);
        }
        // Prevent duplicate txHash if provided
        if (dto.txHash) {
            const existingWithTxHash = await this.prisma.investment.findFirst({
                where: { txHash: dto.txHash, id: { not: id } },
            });
            if (existingWithTxHash) {
                throw new Error('Transaction hash already exists');
            }
        }
        // Validate status transition
        if (investment.status === 'CONFIRMED' && dto.status !== 'CONFIRMED') {
            throw new Error('Cannot change status from CONFIRMED');
        }
        if (investment.status === 'CANCELLED' || investment.status === 'REFUNDED') {
            throw new Error(`Cannot update investment with status ${investment.status}`);
        }
        // Update investment
        try {
            const updated = await this.prisma.investment.update({
                where: { id },
                data: { status: dto.status, txHash: dto.txHash }
            });
            return mapInvestmentToPublicDTO(updated);
        }
        catch (error) {
            const errorObj = error;
            throw new Error(`Failed to update investment status: ${errorObj.message}`);
        }
    }
}
//# sourceMappingURL=investment.service.js.map