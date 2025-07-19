/**
 * Response DTO for platform summary
 */
export interface SummaryResponse {
  users: {
    total: number;
    investors: number;
    clients: number;
    admins: number;
  };
  properties: {
    total: number;
    submitted: number;
    approved: number;
    rejected: number;
    tokenized: number;
  };
  tokens: {
    total: number;
  };
  investments: {
    total: number;
    totalAmount: number;
  };
}

/**
 * DTO for user registration trends
 */
export interface RegistrationsTrendDto {
  date: string; // ISO date string (YYYY-MM-DD)
  total: number;
  investors: number;
  clients: number;
}

/**
 * DTO for property submission trends
 */
export interface PropertySubmissionDto {
  date: string; // ISO date string (YYYY-MM-DD)
  total: number;
  approved: number;
  rejected: number;
  tokenized: number;
}

/**
 * DTO for visit statistics
 */
export interface VisitSummaryDto {
  totalVisits: number;
  uniqueVisitors: number;
  topPages: Array<{
    page: string;
    count: number;
  }>;
  visitsByDate: Array<{
    date: string; // ISO date string (YYYY-MM-DD)
    count: number;
  }>;
}

/**
 * DTO for KYC status distribution
 */
export interface KycDistributionDto {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

/**
 * Query parameters for date range
 */
export interface DateRangeQuery {
  dateFrom?: string; // ISO date string (YYYY-MM-DD)
  dateTo?: string; // ISO date string (YYYY-MM-DD)
}