/**
 * Token Validators
 * Defines validation schemas for token-related operations
 */
import { z } from 'zod';
import { isAddress } from 'ethers';
/**
 * Token creation schema
 * Validates data for creating a new token
 */
export const tokenCreateSchema = z.object({
    propertyId: z.string().cuid(),
    name: z.string().min(3, 'Token name must be at least 3 characters').max(100, 'Token name must not exceed 100 characters'),
    symbol: z.string().min(3, 'Symbol must be at least 3 characters').max(10, 'Symbol must not exceed 10 characters')
        .regex(/^[A-Z0-9]+$/, 'Symbol must contain only uppercase letters and numbers'),
    decimals: z.number().int().min(0, 'Decimals must be at least 0').max(18, 'Decimals must not exceed 18'),
    totalSupply: z.string().refine((val) => {
        try {
            return Number(val) > 0;
        }
        catch {
            return false;
        }
    }, { message: 'Total supply must be a positive number' }),
    contractAddress: z.string().refine((val) => isAddress(val), { message: 'Invalid Ethereum address' }),
    blockchain: z.enum(['ETHEREUM', 'SEPOLIA', 'POLYGON', 'MUMBAI']).optional().default('SEPOLIA'),
});
/**
 * Token update schema
 * Validates data for updating an existing token
 */
export const tokenUpdateSchema = z.object({
    name: z.string().min(3, 'Token name must be at least 3 characters').max(100, 'Token name must not exceed 100 characters').optional(),
    symbol: z.string().min(3, 'Symbol must be at least 3 characters').max(10, 'Symbol must not exceed 10 characters')
        .regex(/^[A-Z0-9]+$/, 'Symbol must contain only uppercase letters and numbers').optional(),
    decimals: z.number().int().min(0, 'Decimals must be at least 0').max(18, 'Decimals must not exceed 18').optional(),
    totalSupply: z.string().refine((val) => {
        try {
            return Number(val) > 0;
        }
        catch {
            return false;
        }
    }, { message: 'Total supply must be a positive number' }).optional(),
    contractAddress: z.string().refine((val) => isAddress(val), { message: 'Invalid Ethereum address' }).optional(),
    blockchain: z.enum(['ETHEREUM', 'SEPOLIA', 'POLYGON', 'MUMBAI']).optional(),
    isActive: z.boolean().optional(),
});
/**
 * Token list query schema
 * Validates query parameters for listing tokens
 */
export const tokenListQuerySchema = z.object({
    propertyId: z.string().cuid().optional(),
    symbol: z.string().optional(),
    blockchain: z.enum(['ETHEREUM', 'SEPOLIA', 'POLYGON', 'MUMBAI']).optional(),
    isActive: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
});
/**
 * Token ID parameter schema
 * Validates token ID in route parameters
 */
export const tokenIdParamsSchema = z.object({
    id: z.string().cuid({ message: 'Invalid token ID format' }),
});
/**
 * Contract address parameter schema
 * Validates contract address in route parameters
 */
export const contractAddressParamsSchema = z.object({
    contractAddress: z.string().refine((val) => isAddress(val), { message: 'Invalid Ethereum address' }),
});
/**
 * Wallet address parameter schema
 * Validates wallet address in route parameters
 */
export const walletAddressParamsSchema = z.object({
    walletAddress: z.string().refine((val) => isAddress(val), { message: 'Invalid Ethereum address' }),
});
/**
 * Blockchain balance query schema
 * Validates parameters for getting token balance from blockchain
 */
export const blockchainBalanceSchema = z.object({
    contractAddress: z.string().refine((val) => isAddress(val), { message: 'Invalid contract address' }),
    walletAddress: z.string().refine((val) => isAddress(val), { message: 'Invalid wallet address' }),
});
// Helper functions for safe parsing
export const safeParseTokenCreate = (data) => tokenCreateSchema.safeParse(data);
export const safeParseTokenUpdate = (data) => tokenUpdateSchema.safeParse(data);
export const safeParseTokenListQuery = (data) => tokenListQuerySchema.safeParse(data);
export const safeParseTokenIdParams = (data) => tokenIdParamsSchema.safeParse(data);
export const safeParseContractAddressParams = (data) => contractAddressParamsSchema.safeParse(data);
export const safeParseWalletAddressParams = (data) => walletAddressParamsSchema.safeParse(data);
export const safeParseBlockchainBalance = (data) => blockchainBalanceSchema.safeParse(data);
//# sourceMappingURL=token.validators.js.map