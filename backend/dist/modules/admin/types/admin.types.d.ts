import { UserRole, PropertyStatus } from '@prisma/client';
/**
 * DTO for updating a user's role
 */
export interface UpdateUserRoleDto {
    role: UserRole;
}
/**
 * DTO for updating a user's active status
 */
export interface UpdateUserStatusDto {
    isActive: boolean;
}
/**
 * DTO for moderating a property (approve/reject)
 */
export interface ModeratePropertyDto {
    status: PropertyStatus;
    comment?: string;
}
/**
 * DTO for sending admin broadcast notifications
 */
export interface AdminNotificationDto {
    title: string;
    message: string;
    targetRoles: UserRole[];
}
/**
 * Query parameters for user listing
 */
export interface UserListQuery {
    role?: UserRole;
    email?: string;
    registrationDateFrom?: string;
    registrationDateTo?: string;
    limit?: string;
    offset?: string;
}
/**
 * Query parameters for property listing
 */
export interface PropertyListQuery {
    status?: PropertyStatus;
    limit?: string;
    offset?: string;
}
/**
 * Query parameters for token listing
 */
export interface TokenListQuery {
    symbol?: string;
    chainId?: string;
    propertyId?: string;
    limit?: string;
    offset?: string;
}
//# sourceMappingURL=admin.types.d.ts.map