import { z } from 'zod';
import { isAddress } from 'ethers';

// Improved validation for numeric values
const positiveNumberString = (fieldName: string) => 
  z.string().refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0 && isFinite(num);
    }, 
    { message: `${fieldName} must be a valid positive number` }
  );

// Base validation schema for creating investments
const investmentBaseSchema = z.object({
  tokenId: z.string().cuid({ message: 'Invalid token ID format' }),
  propertyId: z.string().cuid({ message: 'Invalid property ID format' }),
  amount: positiveNumberString('Amount'),
  tokensBought: positiveNumberString('Price per token'),
  walletAddress: z.string().refine((val) => isAddress(val), { message: 'Invalid Ethereum address' }),
  paymentMethod: z.enum(['FIAT', 'CRYPTO'], { 
    errorMap: () => ({ message: 'Payment method must be either FIAT or CRYPTO' })
  }).optional().default('CRYPTO'),
  currency: z.string().min(1, { message: 'Currency is required' }).optional().default('USD'),
});

// Business rule validation schema for token calculation
const tokenCalculationSchema = z.object({
  amount: positiveNumberString('Amount'),
  tokensBought: positiveNumberString('Price per token')
}).refine(
  (data) => {
    const amount = Number(data.amount);
    const pricePerToken = Number(data.tokensBought);
    return amount >= pricePerToken; // Ensure amount is at least equal to price per token
  },
  {
    message: 'Investment amount must be at least equal to the price per token',
    path: ['amount']
  }
);

// Status update validation schema
export const investmentUpdateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED', 'REFUNDED'], {
    errorMap: () => ({ message: 'Status must be one of: PENDING, CONFIRMED, FAILED, CANCELLED, REFUNDED' })
  }),
  txHash: z.string().optional()
    .refine(hash => !hash || hash.trim().length > 0, {
      message: 'Transaction hash cannot be empty if provided'
    })
    .refine(hash => !hash || hash.startsWith('0x'), {
      message: 'Transaction hash must start with 0x if provided'
    }),
}).refine(
  (data) => {
    // If status is CONFIRMED, txHash is required
    return data.status !== 'CONFIRMED' || (data.txHash && data.txHash.trim().length > 0);
  },
  {
    message: 'Transaction hash is required when status is CONFIRMED',
    path: ['txHash']
  }
);

// Complete investment creation schema with business rules
export const investmentCreateSchema = investmentBaseSchema
  .refine(
    (data) => {
      const amount = Number(data.amount);
      const pricePerToken = Number(data.tokensBought);
      return amount >= pricePerToken; // Ensure amount is at least equal to price per token
    },
    {
      message: 'Investment amount must be at least equal to the price per token',
      path: ['amount']
    }
  )
  .refine(
    (data) => {
      // Additional business rule: tokens requested calculation validation
      const amount = Number(data.amount);
      const pricePerToken = Number(data.tokensBought);
      const tokensRequested = amount / pricePerToken;
      return tokensRequested > 0 && isFinite(tokensRequested);
    },
    {
      message: 'Invalid token calculation. Please check amount and price per token values.',
      path: ['amount', 'tokensBought']
    }
  );

// Complete investment update schema with business rules
export const investmentUpdateSchema = investmentBaseSchema
  .refine(
    (data) => {
      const amount = Number(data.amount);
      const pricePerToken = Number(data.tokensBought);
      return amount >= pricePerToken; // Ensure amount is at least equal to price per token
    },
    {
      message: 'Investment amount must be at least equal to the price per token',
      path: ['amount']
    }
  )
  .refine(
    (data) => {
      // Additional business rule: tokens requested calculation validation
      const amount = Number(data.amount);
      const pricePerToken = Number(data.tokensBought);
      const tokensRequested = amount / pricePerToken;
      return tokensRequested > 0 && isFinite(tokensRequested);
    },
    {
      message: 'Invalid token calculation. Please check amount and price per token values.',
      path: ['amount', 'tokensBought']
    }
  );