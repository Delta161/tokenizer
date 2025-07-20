/**
 * Auth Service
 * Handles authentication business logic
 */
import { PrismaClient, AuthProvider } from '@prisma/client';
import { AuthResponseDTO, LoginCredentialsDTO, RegisterDataDTO, UserDTO, OAuthProfileDTO } from './auth.types';
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Register a new user
     */
    register(data: RegisterDataDTO): Promise<AuthResponseDTO>;
    /**
     * Login a user
     */
    login(credentials: LoginCredentialsDTO): Promise<AuthResponseDTO>;
    /**
     * Verify JWT token and return user
     */
    verifyToken(token: string): Promise<UserDTO>;
    /**
     * Find user by email
     */
    findUserByEmail(email: string): Promise<UserDTO | null>;
    /**
     * Find user by provider ID
     */
    findUserByProviderId(providerId: string, provider: AuthProvider): Promise<UserDTO | null>;
    /**
     * Process OAuth login
     */
    processOAuthLogin(profile: OAuthProfileDTO): Promise<AuthResponseDTO>;
    /**
     * Generate tokens for authentication
     */
    generateTokens(user: UserDTO): {
        accessToken: string;
        refreshToken: string;
    };
    /**
     * Sanitize user object by removing sensitive data
     */
    private sanitizeUser;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map