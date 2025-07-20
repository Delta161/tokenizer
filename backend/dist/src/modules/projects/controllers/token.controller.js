import { TokenService } from '../services/token.service';
import { safeParseTokenCreate, safeParseTokenUpdate, safeParseBlockchainBalance, safeParseTokenIdParams, safeParseContractAddressParams, safeParseTokenListQuery } from '../validators/token.validators';
import { validateAddress } from '../../../utils/contract.utils';
export class TokenController {
    prisma;
    tokenService;
    constructor(prisma, smartContractService) {
        this.prisma = prisma;
        this.tokenService = new TokenService(prisma, smartContractService);
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
     * Update a token
     */
    update = async (req, res, next) => {
        try {
            const idParseResult = safeParseTokenIdParams(req.params);
            if (!idParseResult.success) {
                res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: idParseResult.error.message
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
            const token = await this.tokenService.update(idParseResult.data.id, parseResult.data);
            res.status(200).json({
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
            res.status(200).json({
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
     * List tokens with optional filtering
     */
    list = async (req, res, next) => {
        try {
            const parseResult = safeParseTokenListQuery(req.query);
            if (!parseResult.success) {
                res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: parseResult.error.message
                });
                return;
            }
            const tokens = await this.tokenService.list(parseResult.data);
            res.status(200).json({
                success: true,
                data: tokens
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
     * Get token balance for a wallet address
     */
    getBalance = async (req, res, next) => {
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
            // Validate addresses
            if (!validateAddress(contractAddress) || !validateAddress(walletAddress)) {
                res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: 'Invalid Ethereum address format'
                });
                return;
            }
            const balance = await this.tokenService.getTokenBalance(contractAddress, walletAddress);
            res.status(200).json({
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
    getMetadata = async (req, res, next) => {
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
            // Validate address
            if (!validateAddress(contractAddress)) {
                res.status(400).json({
                    success: false,
                    error: 'ValidationError',
                    message: 'Invalid Ethereum address format'
                });
                return;
            }
            const metadata = await this.tokenService.getTokenMetadata(contractAddress);
            res.status(200).json({
                success: true,
                data: metadata
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
}
//# sourceMappingURL=token.controller.js.map