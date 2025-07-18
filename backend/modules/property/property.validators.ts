import { z } from 'zod';

// More robust URL regex that validates protocol, domain, path, and query parameters
const urlRegex = /^(https?:\/\/)(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}(\/[-a-zA-Z0-9()@:%_\+.~#?&//=]*)?$/;

// Helper function to validate numeric strings with proper decimal format
const numericString = (errorMessage = 'Must be a valid number') => {
  return z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    { message: errorMessage }
  );
};

export const propertyCreateSchema = z.object({
  title: z.string().min(5).max(100).trim(),
  description: z.string().min(20).max(2000).trim(),
  country: z.string().min(2).max(56).trim(),
  city: z.string().min(1).max(56).trim(),
  address: z.string().min(5).max(200).trim(),
  imageUrls: z.array(z.string().regex(urlRegex, 'Invalid image URL')).max(10),
  totalPrice: numericString('Total price must be a positive number').refine(
    (val) => Number(val) > 0, 
    'Total price must be greater than 0'
  ),
  tokenPrice: numericString('Token price must be a positive number').refine(
    (val) => Number(val) > 0, 
    'Token price must be greater than 0'
  ),
  irr: numericString('IRR must be a positive number').refine(
    (val) => Number(val) > 0, 
    'IRR must be greater than 0'
  ),
  apr: numericString('APR must be a positive number').refine(
    (val) => Number(val) > 0, 
    'APR must be greater than 0'
  ),
  valueGrowth: numericString('Value growth must be a positive number').refine(
    (val) => Number(val) > 0, 
    'Value growth must be greater than 0'
  ),
  minInvestment: numericString('Minimum investment must be a positive number').refine(
    (val) => Number(val) > 0, 
    'Minimum investment must be greater than 0'
  ),
  tokensAvailablePercent: numericString('Tokens available percent must be a number').refine(
    (val) => {
      const n = Number(val);
      return n >= 0 && n <= 100;
    }, 
    'Tokens available percent must be between 0 and 100'
  ),
  tokenSymbol: z.string().toUpperCase().regex(/^[A-Z0-9]{3,10}$/, 'Must be 3-10 uppercase alphanumeric'),
}).strict(); // Strict mode to reject unexpected properties

export const propertyUpdateSchema = propertyCreateSchema.partial();

export const propertyStatusUpdateSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED']),
});