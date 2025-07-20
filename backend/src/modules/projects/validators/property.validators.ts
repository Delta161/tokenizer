/**
 * Property Validators
 * Defines validation schemas for property-related operations
 */

import { z } from 'zod';
import { PropertyStatus } from '@prisma/client';

// More robust URL regex that validates protocol, domain, path, and query parameters
const urlRegex = /^(https?:\/\/)(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}(\/[-a-zA-Z0-9()@:%_\+.~#?&//=]*)?$/;

// Helper function to validate numeric strings with proper decimal format
const numericString = (errorMessage = 'Must be a valid number') => {
  return z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    { message: errorMessage }
  );
};

/**
 * Create Property Schema
 * Validates property creation data
 */
export const createPropertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be at most 100 characters').trim(),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must be at most 2000 characters').trim(),
  country: z.string().min(2, 'Country must be at least 2 characters').max(56, 'Country must be at most 56 characters').trim(),
  city: z.string().min(1, 'City must be at least 1 character').max(56, 'City must be at most 56 characters').trim(),
  address: z.string().min(5, 'Address must be at least 5 characters').max(200, 'Address must be at most 200 characters').trim(),
  imageUrls: z.array(z.string().regex(urlRegex, 'Invalid image URL')).max(10, 'Maximum 10 images allowed'),
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
  tokensAvailablePercent: numericString('Tokens available percent must be a positive number').refine(
    (val) => Number(val) > 0 && Number(val) <= 100, 
    'Tokens available percent must be between 0 and 100'
  ),
  tokenSymbol: z.string().min(2, 'Token symbol must be at least 2 characters').max(10, 'Token symbol must be at most 10 characters').trim()
});

/**
 * Update Property Schema
 * Validates property update data
 */
export const updatePropertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be at most 100 characters').trim().optional(),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must be at most 2000 characters').trim().optional(),
  country: z.string().min(2, 'Country must be at least 2 characters').max(56, 'Country must be at most 56 characters').trim().optional(),
  city: z.string().min(1, 'City must be at least 1 character').max(56, 'City must be at most 56 characters').trim().optional(),
  address: z.string().min(5, 'Address must be at least 5 characters').max(200, 'Address must be at most 200 characters').trim().optional(),
  imageUrls: z.array(z.string().regex(urlRegex, 'Invalid image URL')).max(10, 'Maximum 10 images allowed').optional(),
  totalPrice: numericString('Total price must be a positive number').refine(
    (val) => Number(val) > 0, 
    'Total price must be greater than 0'
  ).optional(),
  tokenPrice: numericString('Token price must be a positive number').refine(
    (val) => Number(val) > 0, 
    'Token price must be greater than 0'
  ).optional(),
  irr: numericString('IRR must be a positive number').refine(
    (val) => Number(val) > 0, 
    'IRR must be greater than 0'
  ).optional(),
  apr: numericString('APR must be a positive number').refine(
    (val) => Number(val) > 0, 
    'APR must be greater than 0'
  ).optional(),
  valueGrowth: numericString('Value growth must be a positive number').refine(
    (val) => Number(val) > 0, 
    'Value growth must be greater than 0'
  ).optional(),
  minInvestment: numericString('Minimum investment must be a positive number').refine(
    (val) => Number(val) > 0, 
    'Minimum investment must be greater than 0'
  ).optional(),
  tokensAvailablePercent: numericString('Tokens available percent must be a positive number').refine(
    (val) => Number(val) > 0 && Number(val) <= 100, 
    'Tokens available percent must be between 0 and 100'
  ).optional(),
  tokenSymbol: z.string().min(2, 'Token symbol must be at least 2 characters').max(10, 'Token symbol must be at most 10 characters').trim().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

/**
 * Update Property Status Schema
 * Validates property status update data
 */
export const updatePropertyStatusSchema = z.object({
  status: z.nativeEnum(PropertyStatus, {
    errorMap: () => ({ message: 'Invalid property status' })
  })
});

/**
 * Property ID Parameter Schema
 * Validates property ID in URL parameters
 */
export const propertyIdParamSchema = z.object({
  id: z.string().uuid('Invalid property ID format')
});

/**
 * Property Filter Schema
 * Validates property filter query parameters
 */
export const propertyFilterSchema = z.object({
  status: z.nativeEnum(PropertyStatus).optional(),
  clientId: z.string().uuid('Invalid client ID format').optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['createdAt', 'title', 'totalPrice']).default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc')
});