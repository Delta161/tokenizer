/**
 * Project Controller
 *
 * This controller handles operations that combine client, property, and token data
 * into unified project resources.
 */
import { ClientController } from './client.controller';
import { PropertyController } from './property.controller';
import { TokenController } from './token.controller';
import { ProjectListQuerySchema, ProjectIdParamsSchema, FeaturedProjectsQuerySchema } from '../validators';
export class ProjectController {
    prisma;
    clientController;
    propertyController;
    tokenController;
    constructor(prisma) {
        this.prisma = prisma;
        this.clientController = new ClientController(prisma);
        this.propertyController = new PropertyController(prisma);
        this.tokenController = new TokenController(prisma);
    }
    /**
   * Get a list of projects (properties with their associated client and token data)
   */
    listProjects = async (req, res) => {
        try {
            // Validate query parameters
            const validationResult = ProjectListQuerySchema.safeParse(req.query);
            if (!validationResult.success) {
                const errorResponse = {
                    success: false,
                    error: 'VALIDATION_ERROR',
                    message: 'Invalid query parameters',
                };
                res.status(400).json(errorResponse);
                return;
            }
            // Extract validated query parameters
            const options = validationResult.data;
            // Use the service to get projects
            const { projects, total } = await this.projectService.listProjects(options);
            // Prepare and send response
            const response = {
                success: true,
                data: projects,
                pagination: {
                    page: options.page,
                    limit: options.limit,
                    total,
                    hasMore: options.page * options.limit < total,
                },
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error in listProjects:', error);
            const errorResponse = {
                success: false,
                error: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while fetching projects',
            };
            res.status(500).json(errorResponse);
        }
    };
    /**
   * Get a single project by property ID
   */
    getProjectById = async (req, res) => {
        try {
            // Validate ID parameter
            const validationResult = ProjectIdParamsSchema.safeParse(req.params);
            if (!validationResult.success) {
                const errorResponse = {
                    success: false,
                    error: 'VALIDATION_ERROR',
                    message: 'Invalid property ID',
                };
                res.status(400).json(errorResponse);
                return;
            }
            const { id } = validationResult.data;
            // Use the service to get project by ID
            const project = await this.projectService.getProjectById(id);
            // Check if project exists
            if (!project) {
                const errorResponse = {
                    success: false,
                    error: 'NOT_FOUND',
                    message: 'Project not found',
                };
                res.status(404).json(errorResponse);
                return;
            }
            // Prepare and send response
            const response = {
                success: true,
                data: project,
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error in getProjectById:', error);
            const errorResponse = {
                success: false,
                error: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while fetching the project',
            };
            res.status(500).json(errorResponse);
        }
    };
    /**
   * Get featured projects for public display
   */
    getFeaturedProjects = async (req, res) => {
        try {
            // Validate query parameters
            const validationResult = FeaturedProjectsQuerySchema.safeParse(req.query);
            if (!validationResult.success) {
                const errorResponse = {
                    success: false,
                    error: 'VALIDATION_ERROR',
                    message: 'Invalid query parameters',
                };
                res.status(400).json(errorResponse);
                return;
            }
            // Extract validated query parameters
            const { limit } = validationResult.data;
            // Use the service to get featured projects
            const projects = await this.projectService.getFeaturedProjects(limit);
            // Prepare and send response
            const response = {
                success: true,
                data: projects,
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error in getFeaturedProjects:', error);
            const errorResponse = {
                success: false,
                error: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while fetching featured projects',
            };
            res.status(500).json(errorResponse);
        }
    };
}
//# sourceMappingURL=project.controller.js.map