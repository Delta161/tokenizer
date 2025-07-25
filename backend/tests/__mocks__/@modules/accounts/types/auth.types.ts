/**
 * Mock Auth Types
 */

export enum UserRole {
  INVESTOR = 'INVESTOR',
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN'
}

export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  authProvider?: string;
  providerId?: string;
  avatarUrl?: string;
  lastLoginAt?: Date;
}

export interface AuthResponseDTO {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}