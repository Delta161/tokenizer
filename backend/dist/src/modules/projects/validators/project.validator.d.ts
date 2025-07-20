/**
 * Project Validators
 *
 * This file contains Zod schemas for validating project-related requests
 */
import { z } from 'zod';
/**
 * Schema for validating project list query parameters
 */
export declare const ProjectListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    status: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        PENDING: "PENDING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
    }>>;
    clientId: z.ZodOptional<z.ZodString>;
    clientStatus: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
    }>>;
    hasToken: z.ZodOptional<z.ZodPipe<z.ZodEnum<{
        true: "true";
        false: "false";
    }>, z.ZodTransform<boolean, "true" | "false">>>;
}, z.core.$strip>;
/**
 * Schema for validating project ID parameters
 */
export declare const ProjectIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
/**
 * Schema for validating featured projects query parameters
 */
export declare const FeaturedProjectsQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
//# sourceMappingURL=project.validator.d.ts.map