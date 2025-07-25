import { investmentCreateSchema, investmentUpdateStatusSchema } from '../modules/investment/validators/investment.validators';

// Test valid investment creation data
const validInvestmentData = {
  tokenId: 'clqwertyu123456',
  propertyId: 'clqwertyu123456',
  amount: '100',
  tokensBought: '10',
  walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  paymentMethod: 'CRYPTO',
  currency: 'USD'
};

// Test invalid investment creation data
const invalidInvestmentData = {
  tokenId: 'invalid-id', // Not a CUID
  propertyId: 'clqwertyu123456',
  amount: '-100', // Negative amount
  tokensBought: 'abc', // Not a number
  walletAddress: 'not-an-address',
  paymentMethod: 'INVALID', // Invalid enum value
  currency: ''
};

// Test valid status update data
const validStatusUpdateData = {
  status: 'CONFIRMED',
  txHash: '0x1234567890abcdef'
};

// Test invalid status update data
const invalidStatusUpdateData = {
  status: 'INVALID_STATUS',
  txHash: ''
};

// Run tests
console.log('\n--- Testing Valid Investment Creation ---');
try {
  const result = investmentCreateSchema.parse(validInvestmentData);
  console.log('✅ Valid data passed:', result);
} catch (error) {
  console.error('❌ Validation should have passed but failed:', error);
}

console.log('\n--- Testing Invalid Investment Creation ---');
try {
  investmentCreateSchema.parse(invalidInvestmentData);
  console.error('❌ Validation should have failed but passed');
} catch (error) {
  console.log('✅ Invalid data correctly rejected:', error.message);
}

console.log('\n--- Testing Valid Status Update ---');
try {
  const result = investmentUpdateStatusSchema.parse(validStatusUpdateData);
  console.log('✅ Valid status update passed:', result);
} catch (error) {
  console.error('❌ Validation should have passed but failed:', error);
}

console.log('\n--- Testing Invalid Status Update ---');
try {
  investmentUpdateStatusSchema.parse(invalidStatusUpdateData);
  console.error('❌ Validation should have failed but passed');
} catch (error) {
  console.log('✅ Invalid status update correctly rejected:', error.message);
}