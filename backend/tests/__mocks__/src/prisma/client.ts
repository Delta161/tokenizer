/**
 * Mock Prisma Client
 */

import { vi } from 'vitest';

export const prisma = {
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

export default prisma;