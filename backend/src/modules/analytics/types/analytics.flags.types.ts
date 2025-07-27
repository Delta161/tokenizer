/**
 * Feature flag data transfer object
 */
export interface FeatureFlagDto {
  key: string;
  enabled: boolean;
}

/**
 * Data for updating a flag's enabled status
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