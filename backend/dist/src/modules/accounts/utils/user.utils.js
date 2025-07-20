/**
 * User Utilities
 * Helper functions for user-related operations
 */
/**
 * Map Prisma User model to UserDTO
 * Removes sensitive fields like password
 * @param user Prisma User model
 * @returns User DTO without sensitive fields
 */
export const mapUserToDTO = (user) => {
    // Destructure to remove password and other sensitive fields
    const { password, ...userDTO } = user;
    return userDTO;
};
/**
 * Generate a random password
 * @param length Password length (default: 12)
 * @returns Random password string
 */
export const generateRandomPassword = (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
};
/**
 * Format user's full name
 * @param firstName User's first name
 * @param lastName User's last name
 * @returns Formatted full name
 */
export const formatFullName = (firstName, lastName) => {
    if (!firstName && !lastName) {
        return '';
    }
    return [firstName, lastName].filter(Boolean).join(' ');
};
//# sourceMappingURL=user.utils.js.map