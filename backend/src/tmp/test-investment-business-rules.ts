import { investmentCreateSchema, investmentUpdateStatusSchema } from '../modules/investment/validators/investment.validators';

// Test cases for business rules
console.log('\n--- Testing Business Rules ---');

// Test 1: Amount must be at least equal to price per token
const test1Data = {
  tokenId: 'clqwertyu123456',
  propertyId: 'clqwertyu123456',
  amount: '5', // Less than tokensBought
  tokensBought: '10',
  walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  paymentMethod: 'CRYPTO',
  currency: 'USD'
};

console.log('Test 1: Amount must be at least equal to price per token');
try {
  investmentCreateSchema.parse(test1Data);
  console.error('❌ Validation should have failed but passed');
} catch (error) {
  console.log('✅ Correctly rejected:', error.message);
}

// Test 2: Tokens requested calculation validation
const test2Data = {
  tokenId: 'clqwertyu123456',
  propertyId: 'clqwertyu123456',
  amount: '100',
  tokensBought: '0', // Will cause division by zero
  walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  paymentMethod: 'CRYPTO',
  currency: 'USD'
};

console.log('\nTest 2: Tokens requested calculation validation');
try {
  investmentCreateSchema.parse(test2Data);
  console.error('❌ Validation should have failed but passed');
} catch (error) {
  console.log('✅ Correctly rejected:', error.message);
}

// Test 3: Transaction hash is required when status is CONFIRMED
const test3Data = {
  status: 'CONFIRMED',
  // Missing txHash
};

console.log('\nTest 3: Transaction hash is required when status is CONFIRMED');
try {
  investmentUpdateStatusSchema.parse(test3Data);
  console.error('❌ Validation should have failed but passed');
} catch (error) {
  console.log('✅ Correctly rejected:', error.message);
}

// Test 4: Transaction hash must start with 0x if provided
const test4Data = {
  status: 'PENDING',
  txHash: 'invalid-hash' // Doesn't start with 0x
};

console.log('\nTest 4: Transaction hash must start with 0x if provided');
try {
  investmentUpdateStatusSchema.parse(test4Data);
  console.error('❌ Validation should have failed but passed');
} catch (error) {
  console.log('✅ Correctly rejected:', error.message);
}

// Test 5: Valid status update with optional txHash
const test5Data = {
  status: 'PENDING',
  // No txHash needed for PENDING
};

console.log('\nTest 5: Valid status update with optional txHash');
try {
  const result = investmentUpdateStatusSchema.parse(test5Data);
  console.log('✅ Valid data passed:', result);
} catch (error) {
  console.error('❌ Validation should have passed but failed:', error);
}