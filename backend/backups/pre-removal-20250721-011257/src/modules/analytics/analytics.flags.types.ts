/**
 * Data transfer object for feature flags
 */
export interface FeatureFlagDto {
  key: string;
  enabled: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Data transfer object for updating a feature flag
 */
export interface UpdateFlagDto {
  enabled: boolean;
}

/**
 * Response format for feature flag API endpoints
 */
export interface FlagsResponse {
  success: boolean;
  data?: FeatureFlagDto | FeatureFlagDto[];
  error?: string;
}