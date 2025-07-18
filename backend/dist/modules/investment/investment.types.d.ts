import { Decimal } from '@prisma/client/runtime/library';
export type InvestmentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';
export interface InvestmentCreateDTO {
    tokenId: string;
    propertyId: string;
    amount: string | Decimal;
    tokensBought: string | Decimal;
    walletAddress: string;
}
export interface InvestmentUpdateStatusDTO {
    status: InvestmentStatus;
    txHash?: string;
}
export interface InvestmentPublicDTO {
    id: string;
    investorId: string;
    tokenId: string;
    propertyId: string;
    amount: string;
    tokensBought: string;
    status: InvestmentStatus;
    txHash?: string;
    walletAddress: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface InvestmentListQuery {
    investorId?: string;
    tokenId?: string;
    propertyId?: string;
    status?: InvestmentStatus;
}
export interface InvestmentResponse {
    success: boolean;
    data?: InvestmentPublicDTO;
    error?: string;
    message?: string;
}
export interface InvestmentListResponse {
    success: boolean;
    data: InvestmentPublicDTO[];
    error?: string;
    message?: string;
}
//# sourceMappingURL=investment.types.d.ts.map