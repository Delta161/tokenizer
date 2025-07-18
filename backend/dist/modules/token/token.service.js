import { PropertyStatus } from '@prisma/client';
import { mapTokenToPublicDTO, mapTokensToPublicDTOs } from './token.mapper.js';
import { isAddress } from 'ethers';
import { SmartContractService } from '../smart-contract/smartContract.service.js';
export class TokenService {
    prisma;
    smartContractService;
    constructor(prisma, smartContractService) {
        this.prisma = prisma;
        // If smartContractService is not provided, we'll initialize it later when needed
        this.smartContractService = smartContractService;
    }
    // Get or initialize the smart contract service
    getSmartContractService() {
        if (!this.smartContractService) {
            // Import dynamically to avoid circular dependencies
            const { getSmartContractConfig } = require('../smart-contract/smartContract.service.js');
            this.smartContractService = new SmartContractService(getSmartContractConfig());
        }
        return this.smartContractService;
    }
    async create(dto) {
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
        // Validate the contract on the blockchain
        const smartContractService = this.getSmartContractService();
        const validationResult = await smartContractService.validateContract(dto.contractAddress);
        if (!validationResult.isValid || !validationResult.supportsERC20) {
            throw new Error('Contract address does not point to a valid ERC20 token');
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
    async getAll(query = {}) {
        const where = {};
        if (query.propertyId)
            where.propertyId = query.propertyId;
        if (query.symbol)
            where.symbol = query.symbol;
        if (query.chainId)
            where.chainId = query.chainId;
        const tokens = await this.prisma.token.findMany({ where, orderBy: { createdAt: 'desc' } });
        return mapTokensToPublicDTOs(tokens);
    }
    async getById(id) {
        const token = await this.prisma.token.findUnique({ where: { id } });
        return token ? mapTokenToPublicDTO(token) : null;
    }
    async getTokenBalanceFromBlockchain(contractAddress, walletAddress) {
        const smartContractService = this.getSmartContractService();
        const balance = await smartContractService.getBalanceOf(contractAddress, walletAddress);
        return balance.toString();
    }
    async getTokenMetadataFromBlockchain(contractAddress) {
        const smartContractService = this.getSmartContractService();
        return smartContractService.getTokenMetadata(contractAddress);
    }
    async update(id, dto) {
        const token = await this.prisma.token.findUnique({ where: { id } });
        if (!token)
            return null;
        if (dto.contractAddress && !isAddress(dto.contractAddress)) {
            throw new Error('Invalid Ethereum contract address');
        }
        const updated = await this.prisma.token.update({ where: { id }, data: dto });
        return mapTokenToPublicDTO(updated);
    }
    async delete(id) {
        // Only allow delete if no investments exist
        const token = await this.prisma.token.findUnique({ where: { id }, include: { property: true } });
        if (!token)
            return false;
        const investments = await this.prisma.investment.findFirst({ where: { tokenId: id } });
        if (investments)
            return false;
        await this.prisma.token.delete({ where: { id } });
        return true;
    }
    async getAllPublic() {
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
//# sourceMappingURL=token.service.js.map