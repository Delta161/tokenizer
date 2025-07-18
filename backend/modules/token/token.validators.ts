import { z } from 'zod';
import { isAddress } from 'ethers';

export const tokenCreateSchema = z.object({
  propertyId: z.string().cuid(),
  name: z.string().min(3).max(100),
  symbol: z.string().min(3).max(10).regex(/^[A-Z0-9]+$/),
  decimals: z.number().int().min(0).max(18),
  totalSupply: z.string().refine((val) => {
    try {
      return Number(val) > 0;
    } catch {
      return false;
    }
  }, { message: 'totalSupply must be a positive number' }),
  contractAddress: z.string().refine((val) => isAddress(val), { message: 'Invalid Ethereum address' }),
  chainId: z.string().min(1),
});

export const tokenUpdateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  symbol: z.string().min(3).max(10).regex(/^[A-Z0-9]+$/).optional(),
  decimals: z.number().int().min(0).max(18).optional(),
  totalSupply: z.string().refine((val) => {
    if (val === undefined) return true;
    try {
      return Number(val) > 0;
    } catch {
      return false;
    }
  }, { message: 'totalSupply must be a positive number' }).optional(),
  contractAddress: z.string().refine((val) => isAddress(val), { message: 'Invalid Ethereum address' }).optional(),
  chainId: z.string().min(1).optional(),
});