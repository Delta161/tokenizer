import { z } from 'zod';
const urlRegex = /^(https?:\/\/)[\w.-]+(?:\.[\w\.-]+)+(?:[\w\-\._~:\/?#\[\]@!$&'()*+,;=]+)?$/;
export const propertyCreateSchema = z.object({
    title: z.string().min(5).max(100),
    description: z.string().min(20).max(2000),
    country: z.string().min(2).max(56),
    city: z.string().min(1).max(56),
    address: z.string().min(5).max(200),
    imageUrls: z.array(z.string().regex(urlRegex, 'Invalid image URL')).max(10),
    totalPrice: z.string().refine((val) => Number(val) > 0, 'Must be > 0'),
    tokenPrice: z.string().refine((val) => Number(val) > 0, 'Must be > 0'),
    irr: z.string().refine((val) => Number(val) > 0, 'Must be > 0'),
    apr: z.string().refine((val) => Number(val) > 0, 'Must be > 0'),
    valueGrowth: z.string().refine((val) => Number(val) > 0, 'Must be > 0'),
    minInvestment: z.string().refine((val) => Number(val) > 0, 'Must be > 0'),
    tokensAvailablePercent: z.string().refine((val) => {
        const n = Number(val);
        return n >= 0 && n <= 100;
    }, 'Must be between 0 and 100'),
    tokenSymbol: z.string().toUpperCase().regex(/^[A-Z0-9]{3,10}$/, 'Must be 3-10 uppercase alphanumeric'),
});
export const propertyUpdateSchema = propertyCreateSchema.partial();
export const propertyStatusUpdateSchema = z.object({
    status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED']),
});
//# sourceMappingURL=property.validators.js.map