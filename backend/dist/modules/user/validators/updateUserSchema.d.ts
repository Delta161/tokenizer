import { z } from 'zod';
export declare const updateUserSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    timezone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    preferredLanguage: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strict>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export declare const userIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export declare const validateUpdateUserInput: (data: unknown) => z.ZodSafeParseResult<{
    fullName?: string | undefined;
    avatarUrl?: string | null | undefined;
    phone?: string | null | undefined;
    timezone?: string | null | undefined;
    preferredLanguage?: string | null | undefined;
}>;
export declare const validateUserIdParam: (data: unknown) => z.ZodSafeParseResult<{
    id: string;
}>;
//# sourceMappingURL=updateUserSchema.d.ts.map