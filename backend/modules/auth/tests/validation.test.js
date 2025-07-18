import { validateRequest, validateParams, validateQuery } from '../middleware/validateRequest.js';
import { RefreshTokenSchema, LogoutSchema } from '../auth.validator.js';
import { z } from 'zod';

// Mock Express next function
const mockNext = jest.fn();

// Mock Express response
const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis()
};

// Mock the logger to avoid console output during tests
jest.mock('../utils/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('Validation Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateRequest', () => {
    test('should pass validation with valid refresh token in body', () => {
      const mockReq = {
        body: {
          refreshToken: 'valid.refresh.token'
        }
      };

      const middleware = validateRequest(RefreshTokenSchema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should fail validation with missing refresh token', () => {
      const mockReq = {
        body: {}
      };

      const middleware = validateRequest(RefreshTokenSchema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('required')
      }));
    });

    test('should pass validation with valid logout request', () => {
      const mockReq = {
        body: {},
        cookies: {
          refreshToken: 'valid.refresh.token'
        }
      };

      const middleware = validateRequest(LogoutSchema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should fail validation with invalid logout request (no token)', () => {
      const mockReq = {
        body: {},
        cookies: {}
      };

      const middleware = validateRequest(LogoutSchema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateParams', () => {
    test('should pass validation with valid params', () => {
      const ParamsSchema = z.object({
        id: z.string().uuid()
      });

      const mockReq = {
        params: {
          id: '123e4567-e89b-12d3-a456-426614174000'
        }
      };

      const middleware = validateParams(ParamsSchema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should fail validation with invalid params', () => {
      const ParamsSchema = z.object({
        id: z.string().uuid()
      });

      const mockReq = {
        params: {
          id: 'not-a-uuid'
        }
      };

      const middleware = validateParams(ParamsSchema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateQuery', () => {
    test('should pass validation with valid query params', () => {
      const QuerySchema = z.object({
        page: z.string().transform(Number).optional(),
        limit: z.string().transform(Number).optional()
      });

      const mockReq = {
        query: {
          page: '1',
          limit: '10'
        }
      };

      const middleware = validateQuery(QuerySchema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should fail validation with invalid query params', () => {
      const QuerySchema = z.object({
        page: z.string().transform(Number).refine(n => n > 0, 'Page must be positive')
      });

      const mockReq = {
        query: {
          page: '-1'
        }
      };

      const middleware = validateQuery(QuerySchema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});