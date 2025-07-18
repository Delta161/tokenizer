import { validateAddress, validateTxHash } from '../utils/contract.utils.js';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';
import { DEFAULT_CHAIN_ID, getNetworkConfig } from '../config/smartContract.config.js';
const TokenMetadataSchema = z.object({
    contractAddress: z.string().refine(validateAddress, {
        message: 'Invalid Ethereum contract address',
    }),
});
const BalanceOfSchema = z.object({
    contractAddress: z.string().refine(validateAddress, {
        message: 'Invalid Ethereum contract address',
    }),
    userWallet: z.string().refine(validateAddress, {
        message: 'Invalid Ethereum wallet address',
    }),
});
const MintTokensSchema = z.object({
    contractAddress: z.string().refine(validateAddress, {
        message: 'Invalid Ethereum contract address',
    }),
    recipient: z.string().refine(validateAddress, {
        message: 'Invalid recipient address',
    }),
    amount: z.string().or(z.number()).transform(val => new Decimal(val.toString())),
});
const TransferTokensSchema = z.object({
    contractAddress: z.string().refine(validateAddress, {
        message: 'Invalid Ethereum contract address',
    }),
    recipient: z.string().refine(validateAddress, {
        message: 'Invalid recipient address',
    }),
    amount: z.string().or(z.number()).transform(val => new Decimal(val.toString())),
});
const TransactionHashSchema = z.object({
    txHash: z.string().refine(validateTxHash, {
        message: 'Invalid transaction hash',
    }),
});
export class SmartContractController {
    smartContractService;
    prisma;
    constructor(smartContractService, prisma) {
        this.smartContractService = smartContractService;
        this.prisma = prisma;
    }
    async validateContract(req, res, next) {
        try {
            const { contractAddress } = TokenMetadataSchema.parse(req.params);
            // Check if contract exists in database
            const token = await this.prisma.token.findFirst({
                where: { contractAddress }
            });
            const validationResult = await this.smartContractService.validateContract(contractAddress);
            return res.json({
                success: true,
                data: {
                    ...validationResult,
                    existsInDatabase: !!token
                }
            });
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ success: false, error: error.errors });
            }
            return res.status(400).json({ success: false, error: error.message });
        }
    }
    async getTokenMetadata(req, res, next) {
        try {
            const { contractAddress } = TokenMetadataSchema.parse(req.params);
            const metadata = await this.smartContractService.getTokenMetadata(contractAddress);
            return res.json({ success: true, data: metadata });
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ success: false, error: error.errors });
            }
            return res.status(400).json({ success: false, error: error.message });
        }
    }
    async getBalanceOf(req, res, next) {
        try {
            const { contractAddress, userWallet } = BalanceOfSchema.parse(req.query);
            const balance = await this.smartContractService.getBalanceOf(contractAddress, userWallet);
            return res.json({ success: true, data: { balance: balance.toString() } });
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ success: false, error: error.errors });
            }
            return res.status(400).json({ success: false, error: error.message });
        }
    }
    async mintTokens(req, res, next) {
        try {
            const { contractAddress, recipient, amount } = MintTokensSchema.parse(req.body);
            // Verify token exists in database
            const token = await this.prisma.token.findUnique({
                where: { contractAddress },
            });
            if (!token) {
                return res.status(404).json({ success: false, error: 'Token not found in database' });
            }
            const txHash = await this.smartContractService.mintTokens(contractAddress, recipient, amount);
            return res.json({ success: true, data: { txHash } });
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ success: false, error: error.errors });
            }
            return res.status(400).json({ success: false, error: error.message });
        }
    }
    async transferTokens(req, res, next) {
        try {
            const { contractAddress, recipient, amount } = TransferTokensSchema.parse(req.body);
            // Verify token exists in database
            const token = await this.prisma.token.findUnique({
                where: { contractAddress },
            });
            if (!token) {
                return res.status(404).json({ success: false, error: 'Token not found in database' });
            }
            const txHash = await this.smartContractService.transferTokens(contractAddress, recipient, amount);
            return res.json({ success: true, data: { txHash } });
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ success: false, error: error.errors });
            }
            return res.status(400).json({ success: false, error: error.message });
        }
    }
    async getTransactionReceipt(req, res, next) {
        try {
            const { txHash } = TransactionHashSchema.parse(req.body);
            const receipt = await this.smartContractService.getTransactionReceipt(txHash);
            return res.json({
                success: true,
                data: receipt
            });
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ success: false, error: error.errors });
            }
            return res.status(400).json({ success: false, error: error.message });
        }
    }
    async getGasPrice(req, res, next) {
        try {
            const gasPrice = await this.smartContractService.getGasPrice();
            return res.json({
                success: true,
                data: { gasPrice }
            });
        }
        catch (error) {
            return res.status(400).json({ success: false, error: error.message });
        }
    }
    async getNetworkConfig(req, res, next) {
        try {
            const chainId = req.query.chainId ? parseInt(req.query.chainId) : DEFAULT_CHAIN_ID;
            const networkConfig = getNetworkConfig(chainId);
            if (!networkConfig) {
                return res.status(404).json({
                    success: false,
                    error: `Network configuration not found for chain ID ${chainId}`
                });
            }
            return res.json({
                success: true,
                data: networkConfig
            });
        }
        catch (error) {
            return res.status(400).json({ success: false, error: error.message });
        }
    }
}
//# sourceMappingURL=smartContract.controller.js.map