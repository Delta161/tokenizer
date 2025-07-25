import { investmentCreateSchema, investmentUpdateStatusSchema } from '../modules/investment/validators/investment.validators';

console.log('\n--- Final Investment Validator Tests ---');

// Test 1: Valid investment creation
const validInvestment = {
  tokenId: 'clqwertyu123456',
  propertyId: 'clqwertyu123456',
  amount: '100',
  tokensBought: '50', // Amount is greater than tokensBought
  walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  paymentMethod: 'CRYPTO',
  currency: 'USD'
};

console.log('Test 1: Valid investment creation');
try {
  const result = investmentCreateSchema.parse(validInvestment);
  console.log('✅ Valid data passed:', result);
} catch (error) {
  console.error('❌ Validation should have passed but failed:', error);
}

// Test 2: Invalid investment - amount less than tokensBought
const invalidAmount = {
  tokenId: 'clqwertyu123456',
  propertyId: 'clqwertyu123456',
  amount: '40',
  tokensBought: '50', // Amount is less than tokensBought
  walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  paymentMethod: 'CRYPTO',
  currency: 'USD'
};

console.log('\nTest 2: Invalid investment - amount less than tokensBought');
try {
  investmentCreateSchema.parse(invalidAmount);
  console.error('❌ Validation should have failed but passed');
} catch (error) {
  console.log('✅ Correctly rejected:', error.message);
}

// Test 3: Valid status update with txHash for CONFIRMED status
const validStatusUpdate = {
  status: 'CONFIRMED',
  txHash: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
};

console.log('\nTest 3: Valid status update with txHash for CONFIRMED status');
try {
  const result = investmentUpdateStatusSchema.parse(validStatusUpdate);
  console.log('✅ Valid data passed:', result);
} catch (error) {
  console.error('❌ Validation should have passed but failed:', error);
}

// Test 4: Invalid status update - missing txHash for CONFIRMED status
const invalidStatusUpdate = {
  status: 'CONFIRMED'
  // Missing txHash
};

console.log('\nTest 4: Invalid status update - missing txHash for CONFIRMED status');
try {
  investmentUpdateStatusSchema.parse(invalidStatusUpdate);
  console.error('❌ Validation should have failed but passed');
} catch (error) {
  console.log('✅ Correctly rejected:', error.message);
}

// Test 5: Valid status update - PENDING status with no txHash
const validPendingStatus = {
  status: 'PENDING'
  // No txHash needed
};

console.log('\nTest 5: Valid status update - PENDING status with no txHash');
try {
  const result = investmentUpdateStatusSchema.parse(validPendingStatus);
  console.log('✅ Valid data passed:', result);
} catch (error) {
  console.error('❌ Validation should have passed but failed:', error);
}

// Test 6: Invalid status update - invalid txHash format
const invalidTxHash = {
  status: 'CONFIRMED',
  txHash: 'invalid-hash' // Doesn't start with 0x
};

console.log('\nTest 6: Invalid status update - invalid txHash format');
try {
  investmentUpdateStatusSchema.parse(invalidTxHash);
  console.error('❌ Validation should have failed but passed');
} catch (error) {
  console.log('✅ Correctly rejected:', error.message);
}

console.log('\n--- All tests completed ---');