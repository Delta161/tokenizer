import { z } from 'zod';
import { isAddress } from 'ethers';
// Token creation schema
export const tokenCreateSchema = z.object({
    propertyId: z.string().cuid(),
    name: z.string().min(3).max(100),
    symbol: z.string().min(3).max(10).regex(/^[A-Z0-9]+$/),
    decimals: z.number().int().min(0).max(18),
    totalSupply: z.string().refine((val) => {
        try {
            return Number(val) > 0;
        }
        catch {
            return false;
        }
    }, { message: 'totalSupply must be a positive number' }),
    contractAddress: z.string().refine((val) => isAddress(val), { message: 'Invalid Ethereum address' }),
    blockchain: z.enum(['ETHEREUM', 'SEPOLIA', 'POLYGON', 'MUMBAI']).optional().default('SEPOLIA'),
});
// Token update schema
export const tokenUpdateSchema = z.object({
    name: z.string().min(3).max(100).optional(),
    symbol: z.string().min(3).max(10).regex(/^[A-Z0-9]+$/).optional(),
    decimals: z.number().int().min(0).max(18).optional(),
    totalSupply: z.string().refine((val) => {
        if (val === undefined)
            return true;
        try {
            return Number(val) > 0;
        }
        catch {
            return false;
        }
    }, { message: 'totalSupply must be a positive number' }).optional(),
    contractAddress: z.string().refine((val) => isAddress(val), { message: 'Invalid Ethereum address' }).optional(),
    blockchain: z.enum(['ETHEREUM', 'SEPOLIA', 'POLYGON', 'MUMBAI']).optional(),
    isActive: z.boolean().optional(),
    isTransferable: z.boolean().optional(),
});
// Blockchain balance query schema
export const blockchainBalanceSchema = z.object({
    contractAddress: z.string().refine((val) => isAddress(val), {
        message: 'Invalid contract address',
    }),
    walletAddress: z.string().refine((val) => isAddress(val), {
        message: 'Invalid wallet address',
    }),
});
// Token ID parameter schema
export const tokenIdParamsSchema = z.object({
    id: z.string().cuid(),
});
// Contract address parameter schema
export const contractAddressParamsSchema = z.object({
    contractAddress: z.string().refine((val) => isAddress(val), {
        message: 'Invalid contract address',
    }),
});
// Token list query schema
export const tokenListQuerySchema = z.object({
    propertyId: z.string().cuid().optional(),
    symbol: z.string().optional(),
    blockchain: z.enum(['ETHEREUM', 'SEPOLIA', 'POLYGON', 'MUMBAI']).optional(),
    isActive: z.boolean().optional(),
});
// Safe parsing helpers
export const safeParseTokenCreate = (data) => tokenCreateSchema.safeParse(data);
export const safeParseTokenUpdate = (data) => tokenUpdateSchema.safeParse(data);
export const safeParseBlockchainBalance = (data) => blockchainBalanceSchema.safeParse(data);
export const safeParseTokenIdParams = (data) => tokenIdParamsSchema.safeParse(data);
export const safeParseContractAddressParams = (data) => contractAddressParamsSchema.safeParse(data);
export const safeParseTokenListQuery = (data) => tokenListQuerySchema.safeParse(data);
//# sourceMappingURL=token.validators.js.map