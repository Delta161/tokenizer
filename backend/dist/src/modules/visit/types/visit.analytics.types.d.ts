/**
 * Time range options for filtering visit data
 */
export declare enum VisitTimeRange {
    WEEK = "7",
    MONTH = "30",
    QUARTER = "90"
}
/**
 * Daily visit count for time series data
 */
export interface DailyVisitCount {
    date: string;
    visits: number;
}
/**
 * Summary of visits for a property
 */
export interface PropertyVisitSummary {
    propertyId: string;
    totalVisits: number;
    uniqueVisitors: number;
    trend: DailyVisitCount[];
}
/**
 * Visit statistics for a single property
 */
export interface PropertyVisitStats {
    propertyId: string;
    title: string;
    visitCount: number;
}
/**
 * Visit breakdown for a client's properties
 */
export interface ClientVisitBreakdown {
    clientId: string;
    totalVisits: number;
    propertiesCount: number;
    properties: PropertyVisitStats[];
}
/**
 * Trending property with visit count
 */
export interface TrendingProperty {
    propertyId: string;
    title: string;
    visitCount: number;
}
/**
 * Response for property visits endpoint
 */
export interface PropertyVisitsResponse {
    success: boolean;
    data?: PropertyVisitSummary;
    error?: string;
}
/**
 * Response for client visits endpoint
 */
export interface ClientVisitsResponse {
    success: boolean;
    data?: ClientVisitBreakdown;
    error?: string;
}
/**
 * Response for trending properties endpoint
 */
export interface TrendingPropertiesResponse {
    success: boolean;
    data?: TrendingProperty[];
    error?: string;
}
//# sourceMappingURL=visit.analytics.types.d.ts.map