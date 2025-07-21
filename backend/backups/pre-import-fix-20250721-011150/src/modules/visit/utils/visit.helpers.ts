import { Request } from 'express';

/**
 * Extracts the IP address from the request
 * Tries multiple sources to get the most accurate IP address
 * @param req - Express request object
 * @returns The IP address or undefined if not found
 */
export const extractIpAddress = (req: Request): string | undefined => {
  // Try to get IP from X-Forwarded-For header (common when behind a proxy/load balancer)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor && typeof forwardedFor === 'string') {
    // X-Forwarded-For can contain multiple IPs, take the first one (client IP)
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    if (ips.length > 0 && ips[0]) {
      return ips[0];
    }
  }

  // Fallback to req.ip which Express sets based on various sources
  return req.ip;
};

/**
 * Extracts the user agent from the request headers
 * @param req - Express request object
 * @returns The user agent string or undefined if not found
 */
export const extractUserAgent = (req: Request): string | undefined => {
  return req.headers['user-agent'];
};

/**
 * Extracts the referrer from the request headers
 * @param req - Express request object
 * @returns The referrer URL or undefined if not found
 */
export const extractReferrer = (req: Request): string | undefined => {
  return req.headers.referer || req.headers.referrer as string | undefined;
};

/**
 * Checks if the given date is within the specified time window from now
 * @param date - The date to check
 * @param minutes - The time window in minutes
 * @returns True if the date is within the time window, false otherwise
 */
export const isWithinTimeWindow = (date: Date, minutes: number): boolean => {
  const now = new Date();
  const timeWindow = minutes * 60 * 1000; // Convert minutes to milliseconds
  const timeDifference = now.getTime() - date.getTime();
  
  return timeDifference <= timeWindow;
};