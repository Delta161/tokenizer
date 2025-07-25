import { investmentCreateSchema, investmentUpdateStatusSchema } from '../modules/investment/validators/investment.validators';
import express from 'express';
import { initInvestmentModule } from '../modules/investment';
import { PrismaClient } from '@prisma/client';

// Part 1: Test Validators
console.log('\n--- Testing Investment Validators ---');

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

// Part 2: Test Routes
console.log('\n--- Testing Investment Routes ---');

// Create a test Express app
const app = express();
app.use(express.json());

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize investment module and mount routes
const investmentModule = initInvestmentModule(prisma);
app.use('/api/v1/investments', investmentModule.routes);

// Start the server
const PORT = 3001;
const server = app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Available routes:');
  
  // Print all registered routes
  console.log('Investment module routes:');
  // Express 5 uses app.router instead of app._router
  const router = app.router || app._router;
  
  if (router && router.stack) {
    router.stack.forEach((layer: any) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods)
          .filter((method: string) => layer.route.methods[method])
          .map((method: string) => method.toUpperCase())
          .join(', ');
        console.log(`${methods} ${layer.route.path}`);
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        console.log(`Router at: ${layer.regexp}`);
        layer.handle.stack.forEach((routeLayer: any) => {
          if (routeLayer.route) {
            const methods = Object.keys(routeLayer.route.methods)
              .filter((method: string) => routeLayer.route.methods[method])
              .map((method: string) => method.toUpperCase())
              .join(', ');
            console.log(`  ${methods} ${routeLayer.route.path}`);
          }
        });
      }
    });
  } else {
    console.log('No routes found or router structure is different');
  }
  
  // Shutdown after 5 seconds
  setTimeout(() => {
    console.log('Shutting down test server...');
    server.close(() => {
      console.log('Test server closed');
      process.exit(0);
    });
  }, 5000);
});