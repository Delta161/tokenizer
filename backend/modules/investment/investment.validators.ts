import { z } from 'zod';
import { isAddress } from 'ethers';

export const investmentCreateSchema = z.object({
  tokenId: z.string().cuid(),
  propertyId: z.string().cuid(),
  amount: z.string().refine((val) => {
    try {
      return Number(val) > 0;
    } catch {
      return false;
    }
  }, { message: 'amount must be a positive number' }),
  tokensBought: z.string().refine((val) => {
    try {
      return Number(val) > 0;
    } catch {
      return false;
    }
  }, { message: 'tokensBought must be a positive number' }),
  walletAddress: z.string().refine((val) => isAddress(val), { message: 'Invalid Ethereum address' }),
});

export const investmentUpdateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'FAILED']),
  txHash: z.string().optional(),
});