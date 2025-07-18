import { Visit } from '@prisma/client';

/**
 * Visit data transfer object for creating a new visit
 */
export interface CreateVisitDto {
  propertyId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}

/**
 * Response object for visit creation
 */
export interface VisitResponse {
  success: boolean;
  message: string;
  data?: {
    visit: Visit;
  };
  error?: string;
}

/**
 * Extended Express Request with visit data
 */
export interface VisitRequest {
  propertyId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}