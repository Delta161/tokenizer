/**
 * Client Validators
 * Provides validation functions for client-related forms
 */

import { z } from 'zod'
import type { ClientApplicationRequest, ClientUpdateRequest } from '../types/Client'

/**
 * Client application form validation schema
 */
export const clientApplicationSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name cannot exceed 100 characters'),
  contactEmail: z.string().email('Please enter a valid email address'),
  contactPhone: z.string().optional(),
  country: z.string().min(2, 'Please select a valid country'),
  legalEntityNumber: z.string().optional(),
  walletAddress: z.string().optional()
})

/**
 * Client profile update validation schema
 */
export const clientUpdateSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name cannot exceed 100 characters').optional(),
  contactEmail: z.string().email('Please enter a valid email address').optional(),
  contactPhone: z.string().optional(),
  country: z.string().min(2, 'Please select a valid country').optional(),
  legalEntityNumber: z.string().optional(),
  walletAddress: z.string().optional()
})

/**
 * Validate client application data
 * @param data - The data to validate
 * @returns Validation result
 */
export function validateClientApplication(data: any): { success: boolean; data?: ClientApplicationRequest; error?: z.ZodError } {
  try {
    const validatedData = clientApplicationSchema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error }
    }
    throw error
  }
}

/**
 * Validate client update data
 * @param data - The data to validate
 * @returns Validation result
 */
export function validateClientUpdate(data: any): { success: boolean; data?: ClientUpdateRequest; error?: z.ZodError } {
  try {
    const validatedData = clientUpdateSchema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error }
    }
    throw error
  }
}