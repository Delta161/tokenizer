import { describe, it, expect } from 'vitest';
import { mapBackendUserToFrontend, mapFrontendUserToBackend, mapBackendUsersToFrontend } from './userMapper';

describe('User Mapper Utility', () => {
  // Test data
  const backendUser = {
    id: '123',
    email: 'test@example.com',
    fullName: 'John Doe',
    role: 'CLIENT',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
    profile: { bio: 'Test bio' },
    settings: { theme: 'dark' }
  };

  const frontendUser = {
    id: '123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'CLIENT',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
    profile: { bio: 'Test bio' },
    settings: { theme: 'dark' }
  };

  describe('mapBackendUserToFrontend', () => {
    it('should correctly map a backend user to frontend format', () => {
      const result = mapBackendUserToFrontend(backendUser);
      expect(result).toEqual(frontendUser);
    });

    it('should handle empty fullName', () => {
      const user = { ...backendUser, fullName: '' };
      const result = mapBackendUserToFrontend(user);
      expect(result.firstName).toBe('');
      expect(result.lastName).toBe('');
    });

    it('should handle null fullName', () => {
      const user = { ...backendUser, fullName: null };
      const result = mapBackendUserToFrontend(user);
      expect(result.firstName).toBe('');
      expect(result.lastName).toBe('');
    });

    it('should handle single word fullName', () => {
      const user = { ...backendUser, fullName: 'John' };
      const result = mapBackendUserToFrontend(user);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('');
    });

    it('should handle multi-word lastName', () => {
      const user = { ...backendUser, fullName: 'John van der Doe' };
      const result = mapBackendUserToFrontend(user);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('van der Doe');
    });
  });

  describe('mapFrontendUserToBackend', () => {
    it('should correctly map a frontend user to backend format', () => {
      const result = mapFrontendUserToBackend(frontendUser);
      expect(result).toEqual(backendUser);
    });

    it('should handle empty firstName', () => {
      const user = { ...frontendUser, firstName: '' };
      const result = mapFrontendUserToBackend(user);
      expect(result.fullName).toBe('Doe');
    });

    it('should handle empty lastName', () => {
      const user = { ...frontendUser, lastName: '' };
      const result = mapFrontendUserToBackend(user);
      expect(result.fullName).toBe('John');
    });

    it('should handle both empty firstName and lastName', () => {
      const user = { ...frontendUser, firstName: '', lastName: '' };
      const result = mapFrontendUserToBackend(user);
      expect(result.fullName).toBe('');
    });
  });

  describe('mapBackendUsersToFrontend', () => {
    it('should map an array of backend users to frontend format', () => {
      const backendUsers = [backendUser, { ...backendUser, id: '456' }];
      const result = mapBackendUsersToFrontend(backendUsers);
      expect(result).toEqual([frontendUser, { ...frontendUser, id: '456' }]);
    });

    it('should handle an empty array', () => {
      const result = mapBackendUsersToFrontend([]);
      expect(result).toEqual([]);
    });
  });
});