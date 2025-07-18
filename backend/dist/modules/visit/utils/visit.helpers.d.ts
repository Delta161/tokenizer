import { Request } from 'express';
/**
 * Extracts the IP address from the request
 * Tries multiple sources to get the most accurate IP address
 * @param req - Express request object
 * @returns The IP address or undefined if not found
 */
export declare const extractIpAddress: (req: Request) => string | undefined;
/**
 * Extracts the user agent from the request headers
 * @param req - Express request object
 * @returns The user agent string or undefined if not found
 */
export declare const extractUserAgent: (req: Request) => string | undefined;
/**
 * Extracts the referrer from the request headers
 * @param req - Express request object
 * @returns The referrer URL or undefined if not found
 */
export declare const extractReferrer: (req: Request) => string | undefined;
/**
 * Checks if the given date is within the specified time window from now
 * @param date - The date to check
 * @param minutes - The time window in minutes
 * @returns True if the date is within the time window, false otherwise
 */
export declare const isWithinTimeWindow: (date: Date, minutes: number) => boolean;
//# sourceMappingURL=visit.helpers.d.ts.map