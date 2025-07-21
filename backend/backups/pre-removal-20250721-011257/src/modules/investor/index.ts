/**
 * Investor Module
 * 
 * This module handles investor-related functionality including:
 * - Investor profile management
 * - Wallet management
 * - Verification status management
 */

// Export controller
export { InvestorController } from './investor.controller.js';

// Export service
export { InvestorService } from './investor.service.js';

// Export routes
export { createInvestorRoutes, investorRoutes } from './investor.routes.js';

// Export types
export {
  InvestorApplicationDTO,
  InvestorUpdateDTO,
  InvestorVerificationUpdateDTO,
  WalletCreateDTO,
  WalletVerificationUpdateDTO,
  InvestorPublicDTO,
  WalletPublicDTO,
  InvestorProfileResponse,
  InvestorListResponse,
  InvestorApplicationResponse,
  InvestorUpdateResponse,
  InvestorVerificationUpdateResponse,
  WalletCreateResponse,
  WalletVerificationUpdateResponse,
  ErrorResponse,
  InvestorIdParams,
  WalletIdParams,
  InvestorListQuery
} from './investor.types.js';

// Export validators
export {
  investorApplicationSchema,
  investorUpdateSchema,
  investorVerificationUpdateSchema,
  walletCreateSchema,
  walletVerificationUpdateSchema,
  investorIdParamSchema,
  walletIdParamSchema,
  investorListQuerySchema,
  parseInvestorApplication,
  parseInvestorUpdate,
  parseInvestorVerificationUpdate,
  parseWalletCreate,
  parseWalletVerificationUpdate,
  parseInvestorIdParam,
  parseWalletIdParam,
  parseInvestorListQuery
} from './investor.validators.js';

// Export mappers
export {
  mapInvestorToPublicDTO,
  mapInvestorsToPublicDTOs,
  mapWalletToPublicDTO,
  mapWalletsToPublicDTOs,
  isInvestorVerified,
  hasRequiredVerificationFields,
  isWalletVerified
} from './investor.mapper.js';