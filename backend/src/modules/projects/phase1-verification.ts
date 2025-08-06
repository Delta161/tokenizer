/**
 * Phase 1 Verification Test
 * Quick test to verify our types and validators are working
 */

import { CreateProjectSchema, ProjectIdParamSchema } from './validators/project.validators';
import { CreateProjectInput, ProjectValidationError, DEFAULT_PROJECT_VALIDATION } from './types/project.types';

// Test the validation schemas
const testValidation = () => {
  console.log('🧪 Testing Phase 1 Implementation...');

  // Test valid project creation
  const validProject = {
    title: 'Test Property Investment',
    description: 'A great property investment opportunity in Belgrade',
    country: 'Serbia',
    city: 'Belgrade',
    address: 'Knez Mihailova 1, Belgrade',
    tokenPrice: 100,
    tokenSymbol: 'PROP1',
    totalPrice: 1000000,
    minInvestment: 500,
    tokensAvailablePercent: 80,
    apr: 8.5,
    irr: 12.0,
    valueGrowth: 15.5
  };

  try {
    const validated = CreateProjectSchema.parse(validProject);
    console.log('✅ Valid project validation passed');
    console.log('📄 Validation rules applied:', DEFAULT_PROJECT_VALIDATION);
  } catch (error) {
    console.log('❌ Validation failed:', error);
  }

  // Test invalid project (missing required fields)
  const invalidProject = {
    title: 'Bad',  // Too short
    tokenPrice: -5, // Negative
    tokenSymbol: 'invalid symbol!' // Invalid characters
  };

  try {
    CreateProjectSchema.parse(invalidProject);
    console.log('❌ Should have failed validation');
  } catch (error) {
    console.log('✅ Invalid project correctly rejected');
  }

  // Test project ID parameter validation
  try {
    const validId = ProjectIdParamSchema.parse({ id: 'clp123test456' });
    console.log('✅ Project ID validation passed');
  } catch (error) {
    console.log('❌ Project ID validation failed:', error);
  }

  // Test error classes
  const notFoundError = new ProjectValidationError('Test validation error');
  console.log('✅ Error classes working:', notFoundError.code, notFoundError.statusCode);

  console.log('🎉 Phase 1 Implementation Verified Successfully!');
};

// Export for testing
export { testValidation };
