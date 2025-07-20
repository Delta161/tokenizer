import { TokenService } from './token.service';
import { safeParseTokenCreate, safeParseTokenUpdate, safeParseBlockchainBalance, safeParseTokenIdParams, safeParseContractAddressParams } from './token.validators';
export class TokenController {
    prisma;
    tokenService;
    constructor(prisma, blockchainService) {
        this.prisma = prisma;
        this.tokenService = new TokenService(prisma, blockchainService);
    }
    /**
     * Create a new token
     */
    create = async (req, res, next) => {
        try {
            const parseResult = safeParseTokenCreate(req.body);
            if (!parseResult.success) {
                res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: parseResult.error.message
                });
                return;
            }
            const token = await this.tokenService.create(parseResult.data);
            res.status(201).json({
                success: true,
                data: token
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            res.status(400).json({
                success: false,
                error: 'Error',
                message: errorMessage
            });
        }
    };
    /**
     * Get all tokens (admin)
     */
    getAll = async (req, res, next) => {
        try {
            const tokens = await this.tokenService.getAll(req.query);
            res.json({
                success: true,
                data: tokens
            });
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Get a token by ID
     */
    getById = async (req, res, next) => {
        try {
            const parseResult = safeParseTokenIdParams(req.params);
            if (!parseResult.success) {
                res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: parseResult.error.message
                });
                return;
            }
            const token = await this.tokenService.getById(parseResult.data.id);
            if (!token) {
                res.status(404).json({
                    success: false,
                    error: 'NotFound',
                    message: 'Token not found'
                });
                return;
            }
            res.json({
                success: true,
                data: token
            });
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Update a token
     */
    update = async (req, res, next) => {
        try {
            const paramsResult = safeParseTokenIdParams(req.params);
            if (!paramsResult.success) {
                res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: paramsResult.error.message
                });
                return;
            }
            const parseResult = safeParseTokenUpdate(req.body);
            if (!parseResult.success) {
                res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: parseResult.error.message
                });
                return;
            }
            const updated = await this.tokenService.update(paramsResult.data.id, parseResult.data);
            if (!updated) {
                res.status(404).json({
                    success: false,
                    error: 'NotFound',
                    message: 'Token not found'
                });
                return;
            }
            res.json({
                success: true,
                data: updated,
                message: 'Token updated'
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(400).json({
                success: false,
                error: 'Error',
                message: errorMessage
            });
        }
    };
    /**
     * Delete a token
     */
    delete = async (req, res, next) => {
        try {
            const parseResult = safeParseTokenIdParams(req.params);
            if (!parseResult.success) {
                res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: parseResult.error.message
                });
                return;
            }
            const deleted = await this.tokenService.delete(parseResult.data.id);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    error: 'NotFound',
                    message: 'Token not found or has investments'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Token deleted'
            });
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Get all public tokens (for investors)
     */
    getAllPublic = async (req, res, next) => {
        try {
            const tokens = await this.tokenService.getAllPublic();
            res.json({
                success: true,
                data: tokens
            });
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Get token balance from blockchain
     */
    getTokenBalance = async (req, res, next) => {
        try {
            const parseResult = safeParseBlockchainBalance(req.query);
            if (!parseResult.success) {
                res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: parseResult.error.message
                });
                return;
            }
            const { contractAddress, walletAddress } = parseResult.data;
            const token = await this.tokenService.getTokenByContractAddress(contractAddress);
            if (token && !token.isActive) {
                res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: 'Token is not active'
                });
                return;
            }
            const balance = await this.tokenService.getTokenBalanceFromBlockchain(contractAddress, walletAddress);
            res.json({
                success: true,
                data: { balance }
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            res.status(400).json({
                success: false,
                error: 'Error',
                message: errorMessage
            });
        }
    };
    /**
     * Get token metadata from blockchain
     */
    getBlockchainMetadata = async (req, res, next) => {
        try {
            const parseResult = safeParseContractAddressParams(req.params);
            if (!parseResult.success) {
                res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: parseResult.error.message
                });
                return;
            }
            const { contractAddress } = parseResult.data;
            const metadata = await this.tokenService.getTokenMetadataFromBlockchain(contractAddress);
            res.json({
                success: true,
                data: metadata
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(400).json({
                success: false,
                error: 'Error',
                message: errorMessage
            });
        }
    };
}
//# sourceMappingURL=token.controller.js.map