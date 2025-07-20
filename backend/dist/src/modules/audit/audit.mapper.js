/**
 * Maps a Prisma AuditLogEntry to the DTO format
 */
export function mapAuditLogToDto(auditLog) {
    return {
        id: auditLog.id,
        userId: auditLog.userId,
        actionType: auditLog.actionType,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        metadata: auditLog.metadata,
        createdAt: auditLog.createdAt,
        user: auditLog.user ? {
            id: auditLog.user.id,
            email: auditLog.user.email,
            firstName: auditLog.user.firstName,
            lastName: auditLog.user.lastName
        } : null
    };
}
//# sourceMappingURL=audit.mapper.js.map