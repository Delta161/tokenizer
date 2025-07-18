import { UserRole, AuthProvider } from '@prisma/client';
// Type guards
export function isValidUserRole(role) {
    return Object.values(UserRole).includes(role);
}
export function isValidAuthProvider(provider) {
    return Object.values(AuthProvider).includes(provider);
}
//# sourceMappingURL=user.types.js.map