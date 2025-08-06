/**
 * Project Module Mappers
 * Data transformation utilities for the Projects module
 * 
 * Architecture Layer: Utils (Layer 6)
 * Purpose: Pure functions for data mapping, transformation, and serialization
 * 
 * This file contains optimized mapping functions for converting between
 * Prisma models, DTOs, and API responses with proper financial precision.
 */

import { Property, Client, Token, PropertyStatus } from '@prisma/client';
import {
  ProjectDTO,
  ProjectSummary,
  ClientSummary,
  TokenSummary,
  ProjectWithRelations,
  Project,
  ProjectStatsDTO,
  ProjectStats,
  TokenMetrics,
  ROIProjection
} from '../types/project.types';

// ==========================================
// CORE MAPPING FUNCTIONS
// ==========================================

/**
 * Map Prisma Property to Project domain model
 * Converts database representation to clean domain model
 */
export function mapPropertyToProject(property: Property): Project {
  return {
    id: property.id,
    clientId: property.clientId,
    title: property.title,
    description: property.description,
    status: property.status,
    country: property.country,
    city: property.city,
    address: property.address,
    totalPrice: Number(property.totalPrice),
    tokenPrice: Number(property.tokenPrice),
    tokenSymbol: property.tokenSymbol,
    minInvestment: Number(property.minInvestment),
    tokensAvailablePercent: Number(property.tokensAvailablePercent),
    apr: Number(property.apr),
    irr: Number(property.irr),
    valueGrowth: Number(property.valueGrowth),
    imageUrls: Array.isArray(property.imageUrls) ? property.imageUrls : [],
    isFeatured: property.isFeatured,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt
  };
}

/**
 * Map Client to ClientSummary
 * Extract only necessary client information
 */
export function mapClientToSummary(client: Client): ClientSummary {
  return {
    id: client.id,
    companyName: client.companyName,
    contactEmail: client.contactEmail,
    status: String(client.status)
  };
}

/**
 * Map Token to TokenSummary
 * Convert token data for API consumption
 */
export function mapTokenToSummary(token: Token): TokenSummary {
  return {
    id: token.id,
    propertyId: token.propertyId,
    name: token.name,
    symbol: token.symbol,
    totalSupply: String(token.totalSupply),
    contractAddress: token.contractAddress,
    blockchain: token.blockchain,
    isActive: token.isActive
  };
}

// ==========================================
// DTO CONVERSION FUNCTIONS
// ==========================================

/**
 * Convert Project to API DTO with financial precision
 * Serializes financial data as strings to prevent precision loss
 */
export function projectToDTO(
  project: Project,
  client?: ClientSummary,
  tokens?: TokenSummary[],
  stats?: ProjectStatsDTO
): ProjectDTO {
  return {
    id: project.id,
    clientId: project.clientId,
    title: project.title,
    description: project.description,
    status: project.status,
    country: project.country,
    city: project.city,
    address: project.address,
    totalPrice: formatFinancialAmount(project.totalPrice),
    tokenPrice: formatFinancialAmount(project.tokenPrice),
    tokenSymbol: project.tokenSymbol,
    minInvestment: formatFinancialAmount(project.minInvestment),
    tokensAvailablePercent: formatPercentage(project.tokensAvailablePercent),
    apr: formatPercentage(project.apr),
    irr: formatPercentage(project.irr),
    valueGrowth: formatPercentage(project.valueGrowth),
    imageUrls: project.imageUrls,
    isFeatured: project.isFeatured,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    client,
    tokens,
    _stats: stats
  };
}

/**
 * Convert ProjectWithRelations to ProjectSummary
 * Used for list views with essential information
 */
export function projectWithRelationsToSummary(
  projectWithRelations: ProjectWithRelations,
  additionalMetrics?: {
    tokenCount?: number;
    investmentCount?: number;
    totalInvested?: number;
  }
): ProjectSummary {
  return {
    id: projectWithRelations.id,
    title: projectWithRelations.title,
    description: projectWithRelations.description,
    country: projectWithRelations.country,
    city: projectWithRelations.city,
    tokenPrice: projectWithRelations.tokenPrice,
    tokenSymbol: projectWithRelations.tokenSymbol,
    totalPrice: projectWithRelations.totalPrice,
    minInvestment: projectWithRelations.minInvestment,
    status: projectWithRelations.status,
    isFeatured: projectWithRelations.isFeatured,
    apr: projectWithRelations.apr,
    irr: projectWithRelations.irr,
    valueGrowth: projectWithRelations.valueGrowth,
    imageUrls: projectWithRelations.imageUrls,
    createdAt: projectWithRelations.createdAt,
    updatedAt: projectWithRelations.updatedAt,
    client: projectWithRelations.client,
    tokenCount: additionalMetrics?.tokenCount ?? projectWithRelations.tokens?.length ?? 0,
    investmentCount: additionalMetrics?.investmentCount ?? projectWithRelations._count?.investments ?? 0,
    totalInvested: additionalMetrics?.totalInvested ?? 0
  };
}

// ==========================================
// FINANCIAL DATA FORMATTERS
// ==========================================

/**
 * Format financial amounts with proper precision
 * Ensures consistent decimal handling
 */
export function formatFinancialAmount(amount: number): string {
  return Number(amount).toFixed(2);
}

/**
 * Format percentage values
 * Maintains precision for financial calculations
 */
export function formatPercentage(percentage: number): string {
  return Number(percentage).toFixed(2);
}

/**
 * Parse financial string back to number
 * Used when converting from API input
 */
export function parseFinancialAmount(amountStr: string): number {
  const parsed = parseFloat(amountStr);
  if (isNaN(parsed) || !isFinite(parsed)) {
    throw new Error(`Invalid financial amount: ${amountStr}`);
  }
  return Math.round(parsed * 100) / 100; // Ensure 2 decimal precision
}

/**
 * Parse percentage string back to number
 */
export function parsePercentage(percentageStr: string): number {
  const parsed = parseFloat(percentageStr);
  if (isNaN(parsed) || !isFinite(parsed)) {
    throw new Error(`Invalid percentage: ${percentageStr}`);
  }
  return Math.round(parsed * 100) / 100; // Ensure 2 decimal precision
}

// ==========================================
// STATISTICS MAPPING FUNCTIONS
// ==========================================

/**
 * Convert ProjectStats to DTO with string serialization
 */
export function mapProjectStatsToDTO(stats: ProjectStats): ProjectStatsDTO {
  return {
    totalProjects: String(stats.totalProjects),
    activeProjects: String(stats.activeProjects),
    completedProjects: String(stats.completedProjects),
    draftProjects: String(stats.draftProjects),
    totalValueLocked: formatFinancialAmount(stats.totalValueLocked),
    totalInvestments: String(stats.totalInvestments),
    featuredProjects: String(stats.featuredProjects),
    avgROI: formatPercentage(stats.avgROI),
    totalTokensIssued: String(stats.totalTokensIssued)
  };
}

// ==========================================
// TOKEN METRICS CALCULATION
// ==========================================

/**
 * Calculate token metrics from project data
 */
export function calculateTokenMetrics(
  project: Project,
  soldTokens = 0,
  reservedTokens = 0
): TokenMetrics {
  const totalTokens = Math.floor(
    (project.totalPrice * project.tokensAvailablePercent / 100) / project.tokenPrice
  );
  
  const availableTokens = totalTokens - soldTokens - reservedTokens;
  
  return {
    totalTokens,
    availableTokens: Math.max(0, availableTokens),
    reservedTokens,
    soldTokens,
    tokenPrice: project.tokenPrice,
    minimumPurchase: Math.ceil(project.minInvestment / project.tokenPrice),
    maximumPurchase: undefined, // Can be set based on business rules
    totalSupply: totalTokens,
    circulatingSupply: soldTokens
  };
}

// ==========================================
// ROI PROJECTION UTILITIES
// ==========================================

/**
 * Generate ROI projections for investment analysis
 */
export function generateROIProjections(
  project: Project,
  years = 5
): ROIProjection[] {
  const projections: ROIProjection[] = [];
  let currentValue = project.totalPrice;
  
  for (let year = 1; year <= years; year++) {
    const annualGrowth = project.valueGrowth / 100;
    const annualYield = project.apr / 100;
    
    // Calculate projected value with growth
    currentValue = currentValue * (1 + annualGrowth);
    
    // Calculate returns
    const cumulativeReturn = ((currentValue - project.totalPrice) / project.totalPrice) * 100;
    const totalROI = cumulativeReturn + (annualYield * year * 100);
    
    projections.push({
      year,
      projectedValue: currentValue,
      cumulativeReturn,
      annualYield: annualYield * 100,
      totalROI
    });
  }
  
  return projections;
}

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Validate project data integrity
 */
export function validateProjectDataIntegrity(project: Project): boolean {
  // Basic data validation
  if (!project.id || !project.title || !project.clientId) {
    return false;
  }
  
  // Financial validation
  if (project.totalPrice <= 0 || project.tokenPrice <= 0 || project.minInvestment <= 0) {
    return false;
  }
  
  // Business logic validation
  if (project.minInvestment > project.totalPrice) {
    return false;
  }
  
  if (project.tokensAvailablePercent <= 0 || project.tokensAvailablePercent > 100) {
    return false;
  }
  
  // ROI validation
  if (project.apr < 0 || project.irr < 0 || project.valueGrowth < 0) {
    return false;
  }
  
  return true;
}

/**
 * Sanitize project data for safe storage
 */
export function sanitizeProjectData(input: any): Partial<Project> {
  return {
    title: typeof input.title === 'string' ? input.title.trim() : undefined,
    description: typeof input.description === 'string' ? input.description.trim() : undefined,
    country: typeof input.country === 'string' ? input.country.trim() : undefined,
    city: typeof input.city === 'string' ? input.city.trim() : undefined,
    address: typeof input.address === 'string' ? input.address.trim() : undefined,
    tokenSymbol: typeof input.tokenSymbol === 'string' ? input.tokenSymbol.toUpperCase().trim() : undefined,
    totalPrice: typeof input.totalPrice === 'number' && isFinite(input.totalPrice) ? input.totalPrice : undefined,
    tokenPrice: typeof input.tokenPrice === 'number' && isFinite(input.tokenPrice) ? input.tokenPrice : undefined,
    minInvestment: typeof input.minInvestment === 'number' && isFinite(input.minInvestment) ? input.minInvestment : undefined,
    tokensAvailablePercent: typeof input.tokensAvailablePercent === 'number' && isFinite(input.tokensAvailablePercent) ? input.tokensAvailablePercent : undefined,
    apr: typeof input.apr === 'number' && isFinite(input.apr) ? input.apr : undefined,
    irr: typeof input.irr === 'number' && isFinite(input.irr) ? input.irr : undefined,
    valueGrowth: typeof input.valueGrowth === 'number' && isFinite(input.valueGrowth) ? input.valueGrowth : undefined,
    isFeatured: typeof input.isFeatured === 'boolean' ? input.isFeatured : false,
    imageUrls: Array.isArray(input.imageUrls) ? input.imageUrls.filter((url: any) => typeof url === 'string') : []
  };
}