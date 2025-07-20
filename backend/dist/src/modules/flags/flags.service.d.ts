import { FeatureFlagDto, UpdateFlagDto } from './flags.types';
/**
 * Service for managing feature flags
 */
export declare class FlagsService {
    private cache;
    /**
     * Get a feature flag's enabled status
     * @param key The unique key of the feature flag
     * @returns Boolean indicating if the flag is enabled
     */
    getFlag(key: string): Promise<boolean>;
    /**
     * List all feature flags
     * @returns Array of feature flag DTOs
     */
    listFlags(): Promise<FeatureFlagDto[]>;
    /**
     * Create or update a feature flag
     * @param key The unique key of the feature flag
     * @param dto The update data
     * @returns The updated feature flag DTO
     */
    updateFlag(key: string, dto: UpdateFlagDto): Promise<FeatureFlagDto>;
}
export declare const flagsService: FlagsService;
//# sourceMappingURL=flags.service.d.ts.map