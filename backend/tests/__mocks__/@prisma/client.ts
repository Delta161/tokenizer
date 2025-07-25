/**
 * Mock for @prisma/client
 */

export enum UserRole {
  INVESTOR = 'INVESTOR',
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN'
}

export const PrismaClient = function() {
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
    $disconnect: vi.fn()
  };
};