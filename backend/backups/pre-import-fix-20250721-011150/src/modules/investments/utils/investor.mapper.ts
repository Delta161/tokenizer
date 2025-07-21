import { Investor, Wallet } from '@prisma/client';
import { InvestorPublicDTO, WalletPublicDTO } from '../types/investor.types.js';

/**
 * Maps a Wallet database model to a public DTO
 * @param wallet The wallet database model
 * @returns A wallet DTO safe for external consumption
 */
export function mapWalletToPublicDTO(wallet: Wallet): WalletPublicDTO {
  return {
    id: wallet.id,
    investorId: wallet.investorId,
    address: wallet.address,
    blockchain: wallet.blockchain,
    isVerified: wallet.isVerified,
    verifiedAt: wallet.verifiedAt || undefined,
    createdAt: wallet.createdAt,
    updatedAt: wallet.updatedAt,
  };
}

/**
 * Maps an array of Wallet database models to public DTOs
 * @param wallets Array of wallet database models
 * @returns Array of wallet DTOs safe for external consumption
 */
export function mapWalletsToPublicDTOs(wallets: Wallet[]): WalletPublicDTO[] {
  return wallets.map(mapWalletToPublicDTO);
}

/**
 * Maps an Investor database model to a public DTO
 * @param investor The investor database model with optional related wallets
 * @returns An investor DTO safe for external consumption
 */
export function mapInvestorToPublicDTO(investor: Investor & { wallets?: Wallet[] }): InvestorPublicDTO {
  return {
    id: investor.id,
    userId: investor.userId,
    nationality: investor.nationality,
    isVerified: investor.isVerified,
    verifiedAt: investor.verifiedAt || undefined,
    verificationMethod: investor.verificationMethod || undefined,
    dateOfBirth: investor.dateOfBirth || undefined,
    institutionName: investor.institutionName || undefined,
    vatNumber: investor.vatNumber || undefined,
    phoneNumber: investor.phoneNumber || undefined,
    address: investor.address || undefined,
    city: investor.city || undefined,
    country: investor.country,
    postalCode: investor.postalCode || undefined,
    createdAt: investor.createdAt,
    updatedAt: investor.updatedAt,
    wallets: investor.wallets ? mapWalletsToPublicDTOs(investor.wallets) : [],
  };
}

/**
 * Maps an array of Investor database models to public DTOs
 * @param investors Array of investor database models with optional related wallets
 * @returns Array of investor DTOs safe for external consumption
 */
export function mapInvestorsToPublicDTOs(investors: (Investor & { wallets?: Wallet[] })[]): InvestorPublicDTO[] {
  return investors.map(mapInvestorToPublicDTO);
}

/**
 * Checks if an investor is verified
 * @param investor The investor to check
 * @returns True if the investor is verified, false otherwise
 */
export function isInvestorVerified(investor: Investor): boolean {
  return investor.isVerified === true;
}

/**
 * Checks if an investor has all required fields for verification
 * @param investor The investor to check
 * @returns True if the investor has all required fields, false otherwise
 */
export function hasRequiredVerificationFields(investor: Investor): boolean {
  return !!(
    investor.nationality &&
    investor.country &&
    investor.address &&
    investor.city &&
    investor.postalCode &&
    investor.dateOfBirth
  );
}

/**
 * Checks if a wallet is verified
 * @param wallet The wallet to check
 * @returns True if the wallet is verified, false otherwise
 */
export function isWalletVerified(wallet: Wallet): boolean {
  return wallet.isVerified === true;
}