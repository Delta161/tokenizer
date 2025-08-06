/**
 * Project Module Financial Calculations
 * Mathematical utilities for real estate tokenization
 * 
 * Architecture Layer: Utils (Layer 6)
 * Purpose: Pure functions for financial calculations, ROI analysis, and tokenomics
 * 
 * This file contains enterprise-grade financial calculation functions
 * for real estate tokenization projects with precision handling.
 */

import { Project, TokenMetrics, ROIProjection } from '../types/project.types';

// ==========================================
// FINANCIAL CONSTANTS
// ==========================================

/**
 * Financial calculation constants
 */
export const FINANCIAL_CONSTANTS = {
  DAYS_PER_YEAR: 365,
  MONTHS_PER_YEAR: 12,
  WEEKS_PER_YEAR: 52,
  DEFAULT_COMPOUND_FREQUENCY: 12, // Monthly compounding
  MIN_IRR_ITERATIONS: 50,
  MAX_IRR_ITERATIONS: 1000,
  IRR_PRECISION: 0.0001
} as const;

// ==========================================
// CORE FINANCIAL CALCULATIONS
// ==========================================

/**
 * Calculate Net Present Value (NPV)
 * Used for investment analysis and project valuation
 */
export function calculateNPV(
  initialInvestment: number,
  cashFlows: number[],
  discountRate: number
): number {
  if (initialInvestment <= 0 || discountRate < 0) {
    throw new Error('Invalid input parameters for NPV calculation');
  }

  let npv = -initialInvestment; // Initial investment is negative cash flow
  
  for (let i = 0; i < cashFlows.length; i++) {
    const discountFactor = Math.pow(1 + discountRate / 100, i + 1);
    npv += cashFlows[i] / discountFactor;
  }
  
  return Math.round(npv * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate Internal Rate of Return (IRR)
 * Uses Newton-Raphson method for accurate IRR calculation
 */
export function calculateIRR(
  initialInvestment: number,
  cashFlows: number[],
  guess = 0.1
): number {
  if (initialInvestment <= 0 || cashFlows.length === 0) {
    throw new Error('Invalid input parameters for IRR calculation');
  }

  const allCashFlows = [-initialInvestment, ...cashFlows];
  let rate = guess;
  
  for (let iteration = 0; iteration < FINANCIAL_CONSTANTS.MAX_IRR_ITERATIONS; iteration++) {
    let npv = 0;
    let npvDerivative = 0;
    
    // Calculate NPV and its derivative
    for (let i = 0; i < allCashFlows.length; i++) {
      const discountFactor = Math.pow(1 + rate, i);
      npv += allCashFlows[i] / discountFactor;
      
      if (i > 0) {
        npvDerivative -= (i * allCashFlows[i]) / Math.pow(1 + rate, i + 1);
      }
    }
    
    // Check for convergence
    if (Math.abs(npv) < FINANCIAL_CONSTANTS.IRR_PRECISION) {
      return Math.round(rate * 10000) / 100; // Return as percentage with 2 decimal places
    }
    
    // Newton-Raphson iteration
    if (Math.abs(npvDerivative) < FINANCIAL_CONSTANTS.IRR_PRECISION) {
      throw new Error('IRR calculation did not converge');
    }
    
    rate = rate - npv / npvDerivative;
    
    // Prevent negative rates
    if (rate < -0.99) {
      rate = -0.99;
    }
  }
  
  throw new Error('IRR calculation exceeded maximum iterations');
}

/**
 * Calculate compound annual growth rate (CAGR)
 */
export function calculateCAGR(
  initialValue: number,
  finalValue: number,
  years: number
): number {
  if (initialValue <= 0 || finalValue <= 0 || years <= 0) {
    throw new Error('Invalid input parameters for CAGR calculation');
  }
  
  const cagr = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
  return Math.round(cagr * 100) / 100;
}

/**
 * Calculate present value of future cash flows
 */
export function calculatePresentValue(
  futureValue: number,
  discountRate: number,
  periods: number
): number {
  if (futureValue <= 0 || discountRate < 0 || periods <= 0) {
    throw new Error('Invalid input parameters for present value calculation');
  }
  
  const presentValue = futureValue / Math.pow(1 + discountRate / 100, periods);
  return Math.round(presentValue * 100) / 100;
}

/**
 * Calculate future value with compound interest
 */
export function calculateFutureValue(
  presentValue: number,
  interestRate: number,
  periods: number,
  compoundingFrequency = FINANCIAL_CONSTANTS.DEFAULT_COMPOUND_FREQUENCY
): number {
  if (presentValue <= 0 || interestRate < 0 || periods <= 0 || compoundingFrequency <= 0) {
    throw new Error('Invalid input parameters for future value calculation');
  }
  
  const rate = interestRate / 100 / compoundingFrequency;
  const totalPeriods = periods * compoundingFrequency;
  
  const futureValue = presentValue * Math.pow(1 + rate, totalPeriods);
  return Math.round(futureValue * 100) / 100;
}

// ==========================================
// PROJECT-SPECIFIC CALCULATIONS
// ==========================================

/**
 * Calculate total project tokenomics
 */
export function calculateProjectTokenomics(project: Project): TokenMetrics {
  const tokenValue = project.totalPrice * (project.tokensAvailablePercent / 100);
  const totalTokens = Math.floor(tokenValue / project.tokenPrice);
  const minimumPurchase = Math.ceil(project.minInvestment / project.tokenPrice);
  
  return {
    totalTokens,
    availableTokens: totalTokens,
    reservedTokens: 0,
    soldTokens: 0,
    tokenPrice: project.tokenPrice,
    minimumPurchase,
    maximumPurchase: undefined,
    totalSupply: totalTokens,
    circulatingSupply: 0
  };
}

/**
 * Calculate project yield metrics
 */
export function calculateProjectYieldMetrics(project: Project) {
  const annualRent = project.totalPrice * (project.apr / 100);
  const monthlyRent = annualRent / FINANCIAL_CONSTANTS.MONTHS_PER_YEAR;
  const dailyYield = annualRent / FINANCIAL_CONSTANTS.DAYS_PER_YEAR;
  
  return {
    annualRent: Math.round(annualRent * 100) / 100,
    monthlyRent: Math.round(monthlyRent * 100) / 100,
    dailyYield: Math.round(dailyYield * 100) / 100,
    yieldPerToken: Math.round((annualRent / calculateProjectTokenomics(project).totalTokens) * 100) / 100
  };
}

/**
 * Calculate investment breakdown for a specific token amount
 */
export function calculateInvestmentBreakdown(
  project: Project,
  tokenAmount: number
) {
  if (tokenAmount <= 0) {
    throw new Error('Token amount must be positive');
  }
  
  const tokenomics = calculateProjectTokenomics(project);
  const yieldMetrics = calculateProjectYieldMetrics(project);
  
  if (tokenAmount < tokenomics.minimumPurchase) {
    throw new Error(`Minimum purchase is ${tokenomics.minimumPurchase} tokens`);
  }
  
  if (tokenAmount > tokenomics.availableTokens) {
    throw new Error(`Only ${tokenomics.availableTokens} tokens available`);
  }
  
  const totalInvestment = tokenAmount * project.tokenPrice;
  const annualYield = yieldMetrics.yieldPerToken * tokenAmount;
  const monthlyYield = annualYield / FINANCIAL_CONSTANTS.MONTHS_PER_YEAR;
  
  return {
    tokenAmount,
    totalInvestment: Math.round(totalInvestment * 100) / 100,
    annualYield: Math.round(annualYield * 100) / 100,
    monthlyYield: Math.round(monthlyYield * 100) / 100,
    yieldPercentage: project.apr,
    projectedValue: Math.round(totalInvestment * (1 + project.valueGrowth / 100) * 100) / 100
  };
}

/**
 * Generate detailed ROI projections with cash flows
 */
export function generateDetailedROIProjections(
  project: Project,
  investmentAmount: number,
  years = 5
): ROIProjection[] {
  if (investmentAmount <= 0 || years <= 0) {
    throw new Error('Invalid input parameters for ROI projections');
  }
  
  const projections: ROIProjection[] = [];
  const annualYield = investmentAmount * (project.apr / 100);
  const annualGrowthRate = project.valueGrowth / 100;
  
  let currentValue = investmentAmount;
  
  for (let year = 1; year <= years; year++) {
    // Apply value growth
    currentValue = currentValue * (1 + annualGrowthRate);
    
    // Calculate cumulative return from value appreciation
    const valueAppreciation = ((currentValue - investmentAmount) / investmentAmount) * 100;
    
    // Calculate cumulative yield received
    const cumulativeYield = (annualYield * year / investmentAmount) * 100;
    
    // Total ROI includes both value appreciation and yield
    const totalROI = valueAppreciation + cumulativeYield;
    
    projections.push({
      year,
      projectedValue: Math.round(currentValue * 100) / 100,
      cumulativeReturn: Math.round(valueAppreciation * 100) / 100,
      annualYield: Math.round((annualYield / investmentAmount * 100) * 100) / 100,
      totalROI: Math.round(totalROI * 100) / 100
    });
  }
  
  return projections;
}

// ==========================================
// RISK ASSESSMENT CALCULATIONS
// ==========================================

/**
 * Calculate investment risk metrics
 */
export function calculateRiskMetrics(project: Project) {
  // Simple risk assessment based on project characteristics
  let riskScore = 0;
  
  // APR risk (higher APR = higher risk)
  if (project.apr > 15) riskScore += 3;
  else if (project.apr > 10) riskScore += 2;
  else if (project.apr > 5) riskScore += 1;
  
  // IRR vs APR spread risk
  const spread = project.irr - project.apr;
  if (spread > 10) riskScore += 2;
  else if (spread > 5) riskScore += 1;
  
  // Value growth expectations risk
  if (project.valueGrowth > 10) riskScore += 2;
  else if (project.valueGrowth > 5) riskScore += 1;
  
  // Project size risk (very large or very small projects)
  if (project.totalPrice > 10000000 || project.totalPrice < 100000) {
    riskScore += 1;
  }
  
  // Determine risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  if (riskScore <= 2) riskLevel = 'LOW';
  else if (riskScore <= 4) riskLevel = 'MEDIUM';
  else if (riskScore <= 6) riskLevel = 'HIGH';
  else riskLevel = 'VERY_HIGH';
  
  return {
    riskScore,
    riskLevel,
    factors: {
      aprRisk: project.apr > 10 ? 'HIGH' : project.apr > 5 ? 'MEDIUM' : 'LOW',
      spreadRisk: spread > 10 ? 'HIGH' : spread > 5 ? 'MEDIUM' : 'LOW',
      growthRisk: project.valueGrowth > 10 ? 'HIGH' : project.valueGrowth > 5 ? 'MEDIUM' : 'LOW',
      sizeRisk: project.totalPrice > 10000000 || project.totalPrice < 100000 ? 'HIGH' : 'LOW'
    }
  };
}

// ==========================================
// PORTFOLIO CALCULATIONS
// ==========================================

/**
 * Calculate portfolio metrics for multiple projects
 */
export function calculatePortfolioMetrics(investments: Array<{
  project: Project;
  investment: number;
}>) {
  if (investments.length === 0) {
    throw new Error('No investments provided');
  }
  
  const totalInvestment = investments.reduce((sum, inv) => sum + inv.investment, 0);
  const weightedAPR = investments.reduce((sum, inv) => {
    const weight = inv.investment / totalInvestment;
    return sum + (inv.project.apr * weight);
  }, 0);
  
  const weightedIRR = investments.reduce((sum, inv) => {
    const weight = inv.investment / totalInvestment;
    return sum + (inv.project.irr * weight);
  }, 0);
  
  const weightedValueGrowth = investments.reduce((sum, inv) => {
    const weight = inv.investment / totalInvestment;
    return sum + (inv.project.valueGrowth * weight);
  }, 0);
  
  return {
    totalInvestment: Math.round(totalInvestment * 100) / 100,
    numberOfProjects: investments.length,
    averageAPR: Math.round(weightedAPR * 100) / 100,
    averageIRR: Math.round(weightedIRR * 100) / 100,
    averageValueGrowth: Math.round(weightedValueGrowth * 100) / 100,
    projectedAnnualYield: Math.round((totalInvestment * weightedAPR / 100) * 100) / 100
  };
}

// ==========================================
// VALIDATION UTILITIES
// ==========================================

/**
 * Validate financial calculation inputs
 */
export function validateFinancialInputs(
  amount: number,
  rate?: number,
  periods?: number
): boolean {
  if (!Number.isFinite(amount) || amount <= 0) {
    return false;
  }
  
  if (rate !== undefined && (!Number.isFinite(rate) || rate < 0)) {
    return false;
  }
  
  if (periods !== undefined && (!Number.isFinite(periods) || periods <= 0)) {
    return false;
  }
  
  return true;
}

/**
 * Round financial amount to appropriate precision
 */
export function roundFinancialAmount(amount: number, decimals = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(amount * multiplier) / multiplier;
}
