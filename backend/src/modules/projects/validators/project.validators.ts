/**
 * Project Module Validators (clean)
 */
import { z } from 'zod';
import { PropertyStatus } from '@prisma/client';
import { PROJECT_VALIDATION_RULES } from '../types/project.types';

// Primitives
const titleSchema = z
	.string()
	.min(PROJECT_VALIDATION_RULES.title.minLength)
	.max(PROJECT_VALIDATION_RULES.title.maxLength)
	.trim();

const descriptionSchema = z
	.string()
	.min(PROJECT_VALIDATION_RULES.description.minLength)
	.max(PROJECT_VALIDATION_RULES.description.maxLength)
	.trim();

const tokenSymbolSchema = z
	.string()
	.min(PROJECT_VALIDATION_RULES.tokenSymbol.minLength)
	.max(PROJECT_VALIDATION_RULES.tokenSymbol.maxLength)
	.regex(PROJECT_VALIDATION_RULES.tokenSymbol.pattern)
	.trim()
	.transform((s) => s.toUpperCase());

const financial = (name: string, min: number, max: number): z.ZodNumber =>
	z
		.number()
		.min(min, `${name} must be at least ${min}`)
		.max(max, `${name} must not exceed ${max}`)
		.positive(`${name} must be positive`);

const percent = (name: string, min = 0, max = 100): z.ZodNumber =>
	z.number().min(min, `${name} must be at least ${min}%`).max(max, `${name} must not exceed ${max}%`);

const countrySchema = z.string().min(2).max(50).trim();
const citySchema = z.string().min(2).max(50).trim();
const addressSchema = z.string().min(10).max(200).trim();
const imageUrlsSchema = z.array(z.string().url()).max(10).optional().default([]);

// Core Schemas
export const CreateProjectSchema = z
	.object({
		title: titleSchema,
		description: descriptionSchema,
		country: countrySchema,
		city: citySchema,
		address: addressSchema,
		tokenPrice: financial(
			'Token price',
			PROJECT_VALIDATION_RULES.tokenPrice.min,
			PROJECT_VALIDATION_RULES.tokenPrice.max
		),
		tokenSymbol: tokenSymbolSchema,
		totalPrice: financial(
			'Total price',
			PROJECT_VALIDATION_RULES.totalPrice.min,
			PROJECT_VALIDATION_RULES.totalPrice.max
		),
		minInvestment: financial(
			'Minimum investment',
			PROJECT_VALIDATION_RULES.minInvestment.min,
			PROJECT_VALIDATION_RULES.minInvestment.max
		),
		tokensAvailablePercent: percent(
			'Tokens available percent',
			PROJECT_VALIDATION_RULES.tokensAvailablePercent.min,
			PROJECT_VALIDATION_RULES.tokensAvailablePercent.max
		),
		apr: percent('APR', PROJECT_VALIDATION_RULES.apr.min, PROJECT_VALIDATION_RULES.apr.max),
		irr: percent('IRR', PROJECT_VALIDATION_RULES.irr.min, PROJECT_VALIDATION_RULES.irr.max),
		valueGrowth: percent('Value growth', 0, 1000),
		imageUrls: imageUrlsSchema,
		isFeatured: z.boolean().optional().default(false)
	})
	.refine((d) => d.minInvestment <= d.totalPrice, {
		message: 'Minimum investment cannot exceed total project price',
		path: ['minInvestment']
	})
	.refine((d) => d.tokenPrice <= d.totalPrice, {
		message: 'Token price cannot exceed total project price',
		path: ['tokenPrice']
	})
	.refine((d) => d.apr <= d.irr + 5, {
		message: 'APR should typically not exceed IRR by more than 5%',
		path: ['apr']
	});

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
	status: z.nativeEnum(PropertyStatus).optional()
});

export const UpdateProjectStatusSchema = z.object({
	status: z.nativeEnum(PropertyStatus),
	reason: z.string().min(10).optional()
});

// Query Schemas
export const ProjectParamsSchema = z.object({ id: z.string().uuid('Invalid project ID format') });

export const ProjectPaginationSchema = z.object({
	page: z
		.string()
		.optional()
		.transform((v) => (v ? parseInt(v, 10) : 1))
		.pipe(z.number().min(1).max(10000)),
	limit: z
		.string()
		.optional()
		.transform((v) => (v ? parseInt(v, 10) : 10))
		.pipe(z.number().min(1).max(100)),
	sortBy: z
		.enum(['createdAt', 'updatedAt', 'title', 'totalPrice', 'tokenPrice', 'apr', 'irr', 'status'])
		.optional()
		.default('createdAt'),
	sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export const ProjectFiltersSchema = z.object({
	status: z
		.string()
		.optional()
		.transform((v) => (v ? v.split(',').map((s) => s.trim() as PropertyStatus) : undefined))
		.pipe(z.array(z.nativeEnum(PropertyStatus)).optional()),
	country: z
		.string()
		.optional()
		.transform((v) => (v ? v.split(',').map((s) => s.trim()) : undefined))
		.pipe(z.array(z.string()).optional()),
	city: z
		.string()
		.optional()
		.transform((v) => (v ? v.split(',').map((s) => s.trim()) : undefined))
		.pipe(z.array(z.string()).optional()),
	clientId: z
		.string()
		.optional()
		.transform((v) => (v ? v.split(',').map((s) => s.trim()) : undefined))
		.pipe(z.array(z.string().uuid()).optional()),
	search: z.string().min(2).optional(),
	isFeatured: z
		.string()
		.optional()
		.transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined))
		.pipe(z.boolean().optional()),
	minTokenPrice: z
		.string()
		.optional()
		.transform((v) => (v ? parseFloat(v) : undefined))
		.pipe(z.number().positive().optional()),
	maxTokenPrice: z
		.string()
		.optional()
		.transform((v) => (v ? parseFloat(v) : undefined))
		.pipe(z.number().positive().optional()),
	minTotalPrice: z
		.string()
		.optional()
		.transform((v) => (v ? parseFloat(v) : undefined))
		.pipe(z.number().positive().optional()),
	maxTotalPrice: z
		.string()
		.optional()
		.transform((v) => (v ? parseFloat(v) : undefined))
		.pipe(z.number().positive().optional()),
	minApr: z
		.string()
		.optional()
		.transform((v) => (v ? parseFloat(v) : undefined))
		.pipe(z.number().min(0).max(100).optional()),
	maxApr: z
		.string()
		.optional()
		.transform((v) => (v ? parseFloat(v) : undefined))
		.pipe(z.number().min(0).max(100).optional()),
	minIrr: z
		.string()
		.optional()
		.transform((v) => (v ? parseFloat(v) : undefined))
		.pipe(z.number().min(0).max(100).optional()),
	maxIrr: z
		.string()
		.optional()
		.transform((v) => (v ? parseFloat(v) : undefined))
		.pipe(z.number().min(0).max(100).optional())
});

export const SearchProjectsSchema = ProjectPaginationSchema.merge(
	z.object({ q: z.string().min(2), filters: ProjectFiltersSchema.optional() })
);

// Types
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type ProjectParams = z.infer<typeof ProjectParamsSchema>;
export type ProjectPagination = z.infer<typeof ProjectPaginationSchema>;
export type ProjectFilters = z.infer<typeof ProjectFiltersSchema>;
export type SearchProjects = z.infer<typeof SearchProjectsSchema>;