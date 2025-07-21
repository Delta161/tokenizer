export interface FeatureFlagDto {
  key: string;
  enabled: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateFlagDto {
  enabled: boolean;
}