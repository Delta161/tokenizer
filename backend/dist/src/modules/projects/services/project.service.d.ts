import { PrismaClient } from '@prisma/client';
import { ProjectDTO, ProjectFilterOptions } from '../types';
export declare class ProjectService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * List projects with filtering and pagination
     */
    listProjects(options: ProjectFilterOptions): Promise<{
        projects: ProjectDTO[];
        total: number;
    }>;
    /**
     * Get a project by ID
     */
    getProjectById(id: string): Promise<ProjectDTO | null>;
    /**
     * Get featured projects
     */
    getFeaturedProjects(limit?: number): Promise<ProjectDTO[]>;
}
//# sourceMappingURL=project.service.d.ts.map