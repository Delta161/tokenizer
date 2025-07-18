import { blacklistToken, isTokenBlacklisted, cleanupBlacklist } from '../token.service.js';

// Mock the logger to avoid console output during tests
jest.mock('../utils/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('Token Blacklist Service', () => {
  beforeEach(() => {
    // Clear the blacklist before each test
    cleanupBlacklist(0);
  });

  test('should blacklist a token', () => {
    const token = 'test.jwt.token';
    const expiresIn = 3600; // 1 hour
    
    blacklistToken(token, expiresIn);
    
    expect(isTokenBlacklisted(token)).toBe(true);
  });

  test('should identify non-blacklisted tokens', () => {
    const token = 'test.jwt.token';
    const otherToken = 'other.jwt.token';
    const expiresIn = 3600; // 1 hour
    
    blacklistToken(token, expiresIn);
    
    expect(isTokenBlacklisted(otherToken)).toBe(false);
  });

  test('should clean up expired tokens from blacklist', () => {
    const token1 = 'short.lived.token';
    const token2 = 'long.lived.token';
    
    // Add a token with very short expiry
    blacklistToken(token1, 1); // 1 second
    
    // Add a token with longer expiry
    blacklistToken(token2, 3600); // 1 hour
    
    // Both tokens should be blacklisted initially
    expect(isTokenBlacklisted(token1)).toBe(true);
    expect(isTokenBlacklisted(token2)).toBe(true);
    
    // Wait for the first token to expire
    return new Promise(resolve => {
      setTimeout(() => {
        // Clean up expired tokens
        cleanupBlacklist();
        
        // First token should no longer be blacklisted
        expect(isTokenBlacklisted(token1)).toBe(false);
        
        // Second token should still be blacklisted
        expect(isTokenBlacklisted(token2)).toBe(true);
        
        resolve();
      }, 1100); // Wait just over 1 second
    });
  });

  test('should handle large number of tokens', () => {
    // Add 1000 tokens to the blacklist
    for (let i = 0; i < 1000; i++) {
      blacklistToken(`token.${i}.test`, 3600);
    }
    
    // Verify a sample of tokens are blacklisted
    expect(isTokenBlacklisted('token.0.test')).toBe(true);
    expect(isTokenBlacklisted('token.500.test')).toBe(true);
    expect(isTokenBlacklisted('token.999.test')).toBe(true);
    
    // Verify a non-blacklisted token
    expect(isTokenBlacklisted('token.1000.test')).toBe(false);
  });
});