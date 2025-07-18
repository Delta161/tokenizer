import { UserRole, AuthProvider } from '@prisma/client';
export interface UserPublicDTO {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    role: UserRole;
    phone: string | null;
    timezone: string | null;
    preferredLanguage: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface UpdateUserDTO {
    fullName?: string;
    avatarUrl?: string | null;
    phone?: string | null;
    timezone?: string | null;
    preferredLanguage?: string | null;
}
export interface UpdateUserRequest {
    fullName?: string;
    avatarUrl?: string;
    phone?: string;
    timezone?: string;
    preferredLanguage?: string;
}
export interface GetUserByIdRequest {
    id: string;
}
export interface UserProfileResponse {
    success: boolean;
    data: UserPublicDTO;
}
export interface UpdateUserResponse {
    success: boolean;
    data: UserPublicDTO;
    message: string;
}
export interface DeleteUserResponse {
    success: boolean;
    message: string;
}
export interface ErrorResponse {
    success: false;
    error: string;
    message: string;
}
export declare function isValidUserRole(role: string): role is UserRole;
export declare function isValidAuthProvider(provider: string): provider is AuthProvider;
//# sourceMappingURL=user.types.d.ts.map