import { UserRole, PropertyStatus } from '@prisma/client';
import { UpdateUserRoleDto, UpdateUserStatusDto, ModeratePropertyDto, AdminNotificationDto } from './admin.types.js';
import { NotificationTrigger } from '../notifications/services/notification.trigger.js';
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
            createdAt: Date;
            updatedAt: Date;
            id: string;
            email: string;
            fullName: string;
            providerId: string;
            avatarUrl: string | null;
            deletedAt: Date | null;
            phone: string | null;
            preferredLanguage: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            timezone: string | null;
            authProvider: import(".prisma/client").$Enums.AuthProvider;
        }[];
        total: number;
    }>;
    /**
     * Get user by ID
     */
    getUserById(userId: string): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: string;
        email: string;
        fullName: string;
        providerId: string;
        avatarUrl: string | null;
        deletedAt: Date | null;
        phone: string | null;
        preferredLanguage: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        timezone: string | null;
        authProvider: import(".prisma/client").$Enums.AuthProvider;
    }>;
    /**
     * Update user role
     */
    updateUserRole(userId: string, data: UpdateUserRoleDto, adminId: string): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: string;
        email: string;
        fullName: string;
        providerId: string;
        avatarUrl: string | null;
        deletedAt: Date | null;
        phone: string | null;
        preferredLanguage: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        timezone: string | null;
        authProvider: import(".prisma/client").$Enums.AuthProvider;
    }>;
    /**
     * Update user active status
     */
    updateUserStatus(userId: string, data: UpdateUserStatusDto, adminId: string): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: string;
        email: string;
        fullName: string;
        providerId: string;
        avatarUrl: string | null;
        deletedAt: Date | null;
        phone: string | null;
        preferredLanguage: string | null;
        role: import(".prisma/client").$Enums.UserRole;
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
            createdAt: Date;
            updatedAt: Date;
            title: string;
            tokenPrice: import("@prisma/client/runtime/library.js").Decimal;
            id: string;
            clientId: string;
            description: string;
            country: string;
            city: string;
            status: import(".prisma/client").$Enums.PropertyStatus;
            isFeatured: boolean;
            address: string;
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
        createdAt: Date;
        updatedAt: Date;
        title: string;
        tokenPrice: import("@prisma/client/runtime/library.js").Decimal;
        id: string;
        clientId: string;
        description: string;
        country: string;
        city: string;
        status: import(".prisma/client").$Enums.PropertyStatus;
        isFeatured: boolean;
        address: string;
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
        createdAt: Date;
        updatedAt: Date;
        title: string;
        tokenPrice: import("@prisma/client/runtime/library.js").Decimal;
        id: string;
        clientId: string;
        description: string;
        country: string;
        city: string;
        status: import(".prisma/client").$Enums.PropertyStatus;
        isFeatured: boolean;
        address: string;
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
        chainId?: number;
        propertyId?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        tokens: {
            symbol: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            id: string;
            propertyId: string;
            version: number;
            blockchain: import(".prisma/client").$Enums.Blockchain;
            decimals: number;
            totalSupply: number;
            contractAddress: string | null;
            deploymentTx: string | null;
            deploymentError: string | null;
            isMinted: boolean;
            isActive: boolean;
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
        createdAt: Date;
        updatedAt: Date;
        name: string;
        id: string;
        propertyId: string;
        version: number;
        blockchain: import(".prisma/client").$Enums.Blockchain;
        decimals: number;
        totalSupply: number;
        contractAddress: string | null;
        deploymentTx: string | null;
        deploymentError: string | null;
        isMinted: boolean;
        isActive: boolean;
        isTransferable: boolean;
        tokenUri: string | null;
        vestingStart: Date | null;
        vestingEnd: Date | null;
    }>;
    /**
     * Get all KYC records with optional filtering
     */
    getKycRecords(filters: any): Promise<{
        kycRecords: {
            createdAt: Date;
            updatedAt: Date;
            id: string;
            country: string | null;
            status: string;
            userId: string;
            verifiedAt: Date | null;
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
        createdAt: Date;
        updatedAt: Date;
        id: string;
        country: string | null;
        status: string;
        userId: string;
        verifiedAt: Date | null;
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