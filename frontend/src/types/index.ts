export interface User {
  id: number;
  email: string;
  name: string;
  isAdmin: boolean;
  kycVerified: boolean;
}

export interface Property {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  tokenAddress: string;
}

export interface Investment {
  id: number;
  userId: number;
  propertyId: number;
  amount: number;
  tokens: number;
  date: Date;
}

export interface TokenMetadata {
  symbol: string;
  decimals: number;
  totalSupply: number;
}