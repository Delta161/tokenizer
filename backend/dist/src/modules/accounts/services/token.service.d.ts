/**
 * Token Service
 * Handles token blacklisting and cleanup
 */
/**
 * Add a token to the blacklist
 */
export declare const blacklistToken: (token: string, userId: string, expiryDate: Date, reason?: string) => Promise<void>;
/**
 * Check if a token is blacklisted
 */
export declare const isTokenBlacklisted: (token: string) => boolean;
/**
 * Clean up expired tokens from the blacklist
 */
export declare const cleanupBlacklist: () => Promise<void>;
/**
 * Load active blacklisted tokens from database into memory
 */
export declare const loadBlacklistedTokens: () => Promise<void>;
/**
 * Schedule periodic cleanup of expired tokens
 */
export declare const scheduleBlacklistCleanup: () => void;
/**
 * Stop the scheduled cleanup
 */
export declare const stopBlacklistCleanup: () => void;
//# sourceMappingURL=token.service.d.ts.map