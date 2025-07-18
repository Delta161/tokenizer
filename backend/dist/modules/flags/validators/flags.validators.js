import { z } from 'zod';
export const UpdateFlagSchema = z.object({ enabled: z.boolean() });
export const FlagKeyParamSchema = z.object({ key: z.string().min(1) });
//# sourceMappingURL=flags.validators.js.map