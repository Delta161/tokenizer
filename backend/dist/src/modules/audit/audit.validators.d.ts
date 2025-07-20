import { z } from 'zod';
export declare const AuditLogFilterSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    actionType: z.ZodOptional<z.ZodEnum<{
        [x: string]: string;
    }>>;
    entityType: z.ZodOptional<z.ZodString>;
    entityId: z.ZodOptional<z.ZodString>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodDefault<z.ZodCoercedNumber<unknown>>>;
    offset: z.ZodOptional<z.ZodDefault<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
export declare const CreateAuditLogSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    actionType: z.ZodEnum<{
        [x: string]: string;
    }>;
    entityType: z.ZodString;
    entityId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodAny, z.core.SomeType>>>;
}, z.core.$strip>;
//# sourceMappingURL=audit.validators.d.ts.map