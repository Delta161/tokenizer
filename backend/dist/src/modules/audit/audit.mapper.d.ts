import { AuditLogEntry as PrismaAuditLogEntry } from '@prisma/client';
import { AuditLogEntry } from './audit.types';
type AuditLogWithUser = PrismaAuditLogEntry & {
    user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
    } | null;
};
/**
 * Maps a Prisma AuditLogEntry to the DTO format
 */
export declare function mapAuditLogToDto(auditLog: AuditLogWithUser): AuditLogEntry;
export {};
//# sourceMappingURL=audit.mapper.d.ts.map