import { z } from 'zod';
import { isAddress } from 'ethers';
export const investmentCreateSchema = z.object({
    tokenId: z.string().cuid(),
    propertyId: z.string().cuid(),
    amount: z.string().refine((val) => {
        try {
            return Number(val) > 0;
        }
        catch {
            return false;
        }
    }, { message: 'amount must be a positive number' }),
    tokensBought: z.string().refine((val) => {
        try {
            return Number(val) > 0;
        }
        catch {
            return false;
        }
    }, { message: 'tokensBought must be a positive number' }),
    walletAddress: z.string().refine((val) => isAddress(val), { message: 'Invalid Ethereum address' }),
    paymentMethod: z.enum(['FIAT', 'CRYPTO']).optional().default('CRYPTO'),
    currency: z.string().optional().default('USD'),
});
export const investmentUpdateStatusSchema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED', 'REFUNDED']),
    txHash: z.string().optional(),
});
export const parseInvestmentCreate = (data) => {
    return investmentCreateSchema.safeParse(data);
};
export const parseInvestmentUpdateStatus = (data) => {
    return investmentUpdateStatusSchema.safeParse(data);
};
//# sourceMappingURL=investment.validators.js.map