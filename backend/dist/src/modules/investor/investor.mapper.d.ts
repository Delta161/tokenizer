import { Investor, Wallet } from '@prisma/client';
import { InvestorPublicDTO, WalletPublicDTO } from './investor.types.js';
/**
 * Maps a Wallet database model to a public DTO
 * @param wallet The wallet database model
 * @returns A wallet DTO safe for external consumption
 */
export declare function mapWalletToPublicDTO(wallet: Wallet): WalletPublicDTO;
/**
 * Maps an array of Wallet database models to public DTOs
 * @param wallets Array of wallet database models
 * @returns Array of wallet DTOs safe for external consumption
 */
export declare function mapWalletsToPublicDTOs(wallets: Wallet[]): WalletPublicDTO[];
/**
 * Maps an Investor database model to a public DTO
 * @param investor The investor database model with optional related wallets
 * @returns An investor DTO safe for external consumption
 */
export declare function mapInvestorToPublicDTO(investor: Investor & {
    wallets?: Wallet[];
}): InvestorPublicDTO;
/**
 * Maps an array of Investor database models to public DTOs
 * @param investors Array of investor database models with optional related wallets
 * @returns Array of investor DTOs safe for external consumption
 */
export declare function mapInvestorsToPublicDTOs(investors: (Investor & {
    wallets?: Wallet[];
})[]): InvestorPublicDTO[];
/**
 * Checks if an investor is verified
 * @param investor The investor to check
 * @returns True if the investor is verified, false otherwise
 */
export declare function isInvestorVerified(investor: Investor): boolean;
/**
 * Checks if an investor has all required fields for verification
 * @param investor The investor to check
 * @returns True if the investor has all required fields, false otherwise
 */
export declare function hasRequiredVerificationFields(investor: Investor): boolean;
/**
 * Checks if a wallet is verified
 * @param wallet The wallet to check
 * @returns True if the wallet is verified, false otherwise
 */
export declare function isWalletVerified(wallet: Wallet): boolean;
//# sourceMappingURL=investor.mapper.d.ts.map