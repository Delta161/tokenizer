import { UserRole, PropertyStatus } from '@prisma/client';
import { UpdateUserRoleDto, UpdateUserStatusDto, ModeratePropertyDto, AdminNotificationDto } from '../types/admin.types.js';
import { NotificationTrigger } from '../../notifications/services/notification.trigger.js';
export declare class AdminService {
    private notificationTrigger;
    constructor(notificationTrigger: NotificationTrigger);
    /**
     * Get all users with optional filtering
     */
    getUsers(filters: {
        role?: UserRole;
        email?: string;
        registrationDateFrom?: Date;
        registrationDateTo?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        users: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
            fullName: string;
            providerId: string;
            avatarUrl: string | null;
            deletedAt: Date | null;
            phone: string | null;
            preferredLanguage: string | null;
            timezone: string | null;
            authProvider: import(".prisma/client").$Enums.AuthProvider;
        }[];
        total: number;
    }>;
    /**
     * Get user by ID
     */
    getUserById(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        fullName: string;
        providerId: string;
        avatarUrl: string | null;
        deletedAt: Date | null;
        phone: string | null;
        preferredLanguage: string | null;
        timezone: string | null;
        authProvider: import(".prisma/client").$Enums.AuthProvider;
    }>;
    /**
     * Update user role
     */
    updateUserRole(userId: string, data: UpdateUserRoleDto, adminId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        fullName: string;
        providerId: string;
        avatarUrl: string | null;
        deletedAt: Date | null;
        phone: string | null;
        preferredLanguage: string | null;
        timezone: string | null;
        authProvider: import(".prisma/client").$Enums.AuthProvider;
    }>;
    /**
     * Update user active status
     */
    updateUserStatus(userId: string, data: UpdateUserStatusDto, adminId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        fullName: string;
        providerId: string;
        avatarUrl: string | null;
        deletedAt: Date | null;
        phone: string | null;
        preferredLanguage: string | null;
        timezone: string | null;
        authProvider: import(".prisma/client").$Enums.AuthProvider;
    }>;
    /**
     * Get all properties with optional filtering
     */
    getProperties(filters: {
        status?: PropertyStatus;
        limit?: number;
        offset?: number;
    }): Promise<{
        properties: {
            id: string;
            address: string;
            city: string;
            country: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PropertyStatus;
            clientId: string;
            title: string;
            description: string;
            tokenPrice: import("@prisma/client/runtime/library.js").Decimal;
            isFeatured: boolean;
            apr: import("@prisma/client/runtime/library.js").Decimal;
            imageUrls: string[];
            irr: import("@prisma/client/runtime/library.js").Decimal;
            minInvestment: import("@prisma/client/runtime/library.js").Decimal;
            tokenSymbol: string;
            tokensAvailablePercent: import("@prisma/client/runtime/library.js").Decimal;
            totalPrice: import("@prisma/client/runtime/library.js").Decimal;
            valueGrowth: import("@prisma/client/runtime/library.js").Decimal;
        }[];
        total: number;
    }>;
    /**
     * Get property by ID
     */
    getPropertyById(propertyId: string): Promise<{
        id: string;
        address: string;
        city: string;
        country: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PropertyStatus;
        clientId: string;
        title: string;
        description: string;
        tokenPrice: import("@prisma/client/runtime/library.js").Decimal;
        isFeatured: boolean;
        apr: import("@prisma/client/runtime/library.js").Decimal;
        imageUrls: string[];
        irr: import("@prisma/client/runtime/library.js").Decimal;
        minInvestment: import("@prisma/client/runtime/library.js").Decimal;
        tokenSymbol: string;
        tokensAvailablePercent: import("@prisma/client/runtime/library.js").Decimal;
        totalPrice: import("@prisma/client/runtime/library.js").Decimal;
        valueGrowth: import("@prisma/client/runtime/library.js").Decimal;
    }>;
    /**
     * Moderate a property (approve/reject)
     */
    moderateProperty(propertyId: string, data: ModeratePropertyDto, adminId: string): Promise<{
        id: string;
        address: string;
        city: string;
        country: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PropertyStatus;
        clientId: string;
        title: string;
        description: string;
        tokenPrice: import("@prisma/client/runtime/library.js").Decimal;
        isFeatured: boolean;
        apr: import("@prisma/client/runtime/library.js").Decimal;
        imageUrls: string[];
        irr: import("@prisma/client/runtime/library.js").Decimal;
        minInvestment: import("@prisma/client/runtime/library.js").Decimal;
        tokenSymbol: string;
        tokensAvailablePercent: import("@prisma/client/runtime/library.js").Decimal;
        totalPrice: import("@prisma/client/runtime/library.js").Decimal;
        valueGrowth: import("@prisma/client/runtime/library.js").Decimal;
    }>;
    /**
     * Get all tokens with optional filtering
     */
    getTokens(filters: {
        symbol?: string;
        chainId?: string;
        propertyId?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        tokens: {
            symbol: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            propertyId: string;
            decimals: number;
            totalSupply: number;
            contractAddress: string | null;
            deploymentTx: string | null;
            deploymentError: string | null;
            blockchain: import(".prisma/client").$Enums.Blockchain;
            isMinted: boolean;
            version: number;
            isTransferable: boolean;
            tokenUri: string | null;
            vestingStart: Date | null;
            vestingEnd: Date | null;
        }[];
        total: number;
    }>;
    /**
     * Get token by ID
     */
    getTokenById(tokenId: string): Promise<{
        symbol: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        propertyId: string;
        decimals: number;
        totalSupply: number;
        contractAddress: string | null;
        deploymentTx: string | null;
        deploymentError: string | null;
        blockchain: import(".prisma/client").$Enums.Blockchain;
        isMinted: boolean;
        version: number;
        isTransferable: boolean;
        tokenUri: string | null;
        vestingStart: Date | null;
        vestingEnd: Date | null;
    }>;
    /**
     * Get all KYC records with optional filtering
     */
    getKycRecords(filters: {
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        kycRecords: {
            id: string;
            userId: string;
            verifiedAt: Date | null;
            country: string | null;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            documentType: string | null;
            rejectedAt: Date | null;
            rejectionReason: string | null;
            provider: string | null;
            referenceId: string | null;
            providerData: import("@prisma/client/runtime/library.js").JsonValue | null;
        }[];
        total: number;
    }>;
    /**
     * Get KYC record by ID
     */
    getKycRecordById(kycId: string): Promise<{
        id: string;
        userId: string;
        verifiedAt: Date | null;
        country: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        documentType: string | null;
        rejectedAt: Date | null;
        rejectionReason: string | null;
        provider: string | null;
        referenceId: string | null;
        providerData: import("@prisma/client/runtime/library.js").JsonValue | null;
    }>;
    /**
     * Send broadcast notification to users
     */
    sendBroadcastNotification(data: AdminNotificationDto, adminId: string): Promise<{
        success: boolean;
        recipientCount: number;
    }>;
}
//# sourceMappingURL=admin.service.d.ts.map