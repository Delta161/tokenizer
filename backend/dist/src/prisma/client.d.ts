/**
 * Prisma Client Singleton
 * Ensures a single instance of PrismaClient throughout the application
 */
import { PrismaClient } from '@prisma/client';
declare global {
    var prisma: PrismaClient | undefined;
}
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
//# sourceMappingURL=client.d.ts.map