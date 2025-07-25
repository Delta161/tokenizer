/**
 * Vitest setup file
 */

import { vi } from 'vitest';

// Mock @prisma/client
vi.mock('@prisma/client', () => {
  return {
    UserRole: Object.freeze({
      INVESTOR: 'INVESTOR',
      CLIENT: 'CLIENT',
      ADMIN: 'ADMIN'
    }),
    AuthProvider: Object.freeze({
      GOOGLE: 'GOOGLE',
      AZURE: 'AZURE',
      APPLE: 'APPLE',
      LOCAL: 'LOCAL'
    }),
    PrismaClient: function() {
      return {
        user: {
          findUnique: vi.fn(),
          findMany: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
          count: vi.fn()
        },
        // Add other models as needed
        $connect: vi.fn(),
        $disconnect: vi.fn(),
        $on: vi.fn()
      };
    }
  };
});