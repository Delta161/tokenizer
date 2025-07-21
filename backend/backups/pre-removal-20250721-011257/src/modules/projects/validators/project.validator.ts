/**
 * Project Validators
 * 
 * This file contains Zod schemas for validating project-related requests
 */

import { z } from 'zod';
import { ClientStatus, PropertyStatus } from '@prisma/client';

/**
 * Schema for validating project list query parameters
 */
export const ProjectListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  status: z.nativeEnum(PropertyStatus).optional(),
  clientId: z.string().uuid().optional(),
  clientStatus: z.nativeEnum(ClientStatus).optional(),
  hasToken: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
});

/**
 * Schema for validating project ID parameters
 */
export const ProjectIdParamsSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Schema for validating featured projects query parameters
 */
export const FeaturedProjectsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(20).optional().default(6),
});