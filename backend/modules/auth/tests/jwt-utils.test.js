import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, extractRefreshTokenFromRequest } from '../jwt.utils.js';

// Mock the environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';

// Mock the logger to avoid console output during tests
jest.mock('../utils/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('JWT Utilities', () => {
  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    roles: ['USER']
  };

  describe('Access Token', () => {
    test('should generate a valid access token', () => {
      const token = generateAccessToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    test('should verify a valid access token', () => {
      const token = generateAccessToken(mockUser);
      const decoded = verifyAccessToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
    });

    test('should reject an invalid access token', () => {
      const invalidToken = 'invalid.token.format';
      
      expect(() => verifyAccessToken(invalidToken)).toThrow();
    });
  });

  describe('Refresh Token', () => {
    test('should generate a valid refresh token', () => {
      const token = generateRefreshToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    test('should verify a valid refresh token', () => {
      const token = generateRefreshToken(mockUser);
      const decoded = verifyRefreshToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
    });

    test('should reject an invalid refresh token', () => {
      const invalidToken = 'invalid.token.format';
      
      expect(() => verifyRefreshToken(invalidToken)).toThrow();
    });

    test('should reject an access token as refresh token', () => {
      // Generate an access token
      const accessToken = generateAccessToken(mockUser);
      
      // Try to verify it as a refresh token
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });

  describe('Extract Refresh Token', () => {
    test('should extract refresh token from cookies', () => {
      const refreshToken = 'valid.refresh.token';
      const mockReq = {
        cookies: {
          refreshToken
        }
      };
      
      const extracted = extractRefreshTokenFromRequest(mockReq);
      expect(extracted).toBe(refreshToken);
    });

    test('should extract refresh token from body', () => {
      const refreshToken = 'valid.refresh.token';
      const mockReq = {
        cookies: {},
        body: {
          refreshToken
        }
      };
      
      const extracted = extractRefreshTokenFromRequest(mockReq);
      expect(extracted).toBe(refreshToken);
    });

    test('should return null if no refresh token is found', () => {
      const mockReq = {
        cookies: {},
        body: {}
      };
      
      const extracted = extractRefreshTokenFromRequest(mockReq);
      expect(extracted).toBeNull();
    });
  });
});