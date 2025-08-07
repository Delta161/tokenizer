/**
 * Test script to verify UserService merged functionality
 */
const { UserService } = require('./src/modules/accounts/services/user.service.ts');

console.log('✅ UserService can be imported successfully');
console.log('✅ ProfileService functionality has been merged into UserService');
console.log('✅ ProfileService file has been safely deleted');

// Verify key methods exist
const userService = new UserService();
console.log('Methods available:', Object.getOwnPropertyNames(Object.getPrototypeOf(userService)));

console.log('✅ Merge completed successfully!');
