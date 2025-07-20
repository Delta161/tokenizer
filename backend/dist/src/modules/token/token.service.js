import { PropertyStatus } from '@prisma/client';
import { mapTokenToPublicDTO, mapTokensToPublicDTOs } from './token.mapper';
import { isAddress } from 'ethers';
import { BlockchainService, getBlockchainConfig } from '../../modules/blockchain/index.js';
import { logger } from '../../utils/logger';
export class TokenService {
    prisma;
    blockchainService;
    constructor(prisma, blockchainService) {
        this.prisma = prisma;
        // If blockchainService is not provided, we'll initialize it later when needed
        this.blockchainService = blockchainService;
    }
    // Get or initialize the blockchain service
    getBlockchainService() {
        if (!this.blockchainService) {
            this.blockchainService = new BlockchainService(getBlockchainConfig());
        }
        return this.blockchainService;
    }
    /**
     * Create a new token
     * @param dto Token creation data
     * @returns The created token
     */
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
        const blockchainService = this.getBlockchainService();
        const validationResult = await blockchainService.validateContract(dto.contractAddress);
        if (!validationResult.isValid || !validationResult.isERC20) {
            throw new Error('Contract address does not point to a valid ERC20 token');
        }
        // Create token
        const token = await this.prisma.token.create({
            data: {
                propertyId: dto.propertyId,
                name: dto.name,
                symbol: dto.symbol,
                decimals: dto.decimals,
                totalSupply: parseInt(dto.totalSupply, 10),
                contractAddress: dto.contractAddress,
                blockchain: dto.blockchain || 'SEPOLIA', // Default to SEPOLIA blockchain
            },
        });
        // Log token creation
        logger.info('Token created', { tokenId: token.id, propertyId: dto.propertyId });
        return mapTokenToPublicDTO(token);
    }
    /**
     * Get all tokens with optional filtering
     * @param query Optional query parameters
     * @returns List of tokens
     */
    async getAll(query = {}) {
        const where = {};
        if (query.propertyId)
            where.propertyId = query.propertyId;
        if (query.symbol)
            where.symbol = query.symbol;
        if (query.blockchain)
            where.blockchain = query.blockchain;
        if (query.isActive !== undefined)
            where.isActive = query.isActive;
        const tokens = await this.prisma.token.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        return mapTokensToPublicDTOs(tokens);
    }
    /**
     * Get a token by ID
     * @param id Token ID
     * @returns Token or null if not found
     */
    async getById(id) {
        const token = await this.prisma.token.findUnique({ where: { id } });
        return token ? mapTokenToPublicDTO(token) : null;
    }
    /**
     * Get a token by contract address
     * @param contractAddress Blockchain contract address
     * @returns Token or null if not found
     */
    async getTokenByContractAddress(contractAddress) {
        return this.prisma.token.findFirst({ where: { contractAddress } });
    }
    /**
     * Get token balance from blockchain
     * @param contractAddress Token contract address
     * @param walletAddress Wallet address to check balance for
     * @returns Balance as string
     */
    async getTokenBalanceFromBlockchain(contractAddress, walletAddress) {
        const blockchainService = this.getBlockchainService();
        const balance = await blockchainService.getBalanceOf(contractAddress, walletAddress);
        return balance.toString();
    }
    /**
     * Get token metadata from blockchain
     * @param contractAddress Token contract address
     * @returns Token metadata
     */
    async getTokenMetadataFromBlockchain(contractAddress) {
        const blockchainService = this.getBlockchainService();
        return blockchainService.getTokenMetadata(contractAddress);
    }
    /**
     * Update a token
     * @param id Token ID
     * @param dto Update data
     * @returns Updated token or null if not found
     */
    async update(id, dto) {
        const token = await this.prisma.token.findUnique({ where: { id } });
        if (!token)
            return null;
        if (dto.contractAddress && !isAddress(dto.contractAddress)) {
            throw new Error('Invalid Ethereum contract address');
        }
        const updated = await this.prisma.token.update({ where: { id }, data: dto });
        // Log token update
        logger.info('Token updated', { tokenId: id, updates: Object.keys(dto) });
        return mapTokenToPublicDTO(updated);
    }
    /**
     * Delete a token
     * @param id Token ID
     * @returns true if deleted, false if not found or has investments
     */
    async delete(id) {
        // Only allow delete if no investments exist
        const token = await this.prisma.token.findUnique({
            where: { id },
            include: { property: true }
        });
        if (!token)
            return false;
        const investments = await this.prisma.investment.findFirst({ where: { tokenId: id } });
        if (investments)
            return false;
        await this.prisma.token.delete({ where: { id } });
        // Log token deletion
        logger.info('Token deleted', { tokenId: id, propertyId: token.propertyId });
        return true;
    }
    /**
     * Get all public tokens (linked to approved properties)
     * @returns List of public tokens
     */
    async getAllPublic() {
        // Only tokens linked to APPROVED properties
        const tokens = await this.prisma.token.findMany({
            where: {
                property: { status: PropertyStatus.APPROVED },
                isActive: true
            },
            orderBy: { createdAt: 'desc' },
        });
        return mapTokensToPublicDTOs(tokens);
    }
}
//# sourceMappingURL=token.service.js.map