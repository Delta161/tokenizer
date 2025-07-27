import { PropertyStatus } from '@prisma/client';

/**
 * Analytics date range parameters
 */
export interface AnalyticsDateRangeParams {
  startDate: Date;
  endDate: Date;
}

/**
 * User registration analytics parameters
 */
export interface UserRegistrationParams extends AnalyticsDateRangeParams {
  interval?: 'day' | 'week' | 'month';
}

/**
 * Property submission analytics parameters
 */
export interface PropertySubmissionParams extends AnalyticsDateRangeParams {
  status?: PropertyStatus;
}

/**
 * User registration data point
 */
export interface UserRegistrationDataPoint {
  date: string;
  count: number;
}

/**
 * Property submission data point
 */
export interface PropertySubmissionDataPoint {
  status: PropertyStatus;
  count: number;
}

/**
 * Visit analytics data
 */
export interface VisitAnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}