import { FeatureFlagDto, UpdateFlagDto } from '../types/flags.types';
export declare class FlagsService {
    private cache;
    getFlag(key: string): Promise<boolean>;
    listFlags(): Promise<FeatureFlagDto[]>;
    updateFlag(key: string, dto: UpdateFlagDto): Promise<FeatureFlagDto>;
}
export declare const flagsService: FlagsService;
//# sourceMappingURL=flags.service.d.ts.map