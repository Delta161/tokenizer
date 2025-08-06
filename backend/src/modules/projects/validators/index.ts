/**
 * Projects Module Validators Index
 * Centralized exports for all validation schemas
 * 
 * Architecture Layer: Validators (Layer 2)
 * Purpose: Provide clean imports for validation schemas
 */

// Main project validators
export * from './project.validators';

// Legacy validators for backward compatibility
export * from './project.validator';
export * from './property.validators';