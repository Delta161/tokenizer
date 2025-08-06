/**
 * Project Service
 * Enterprise-grade business logic for the Projects module
 * 
 * Architecture Layer: Services (Layer 5)
 * Purpose: Business logic, database operations, transaction management
 * 
 * This service implements comprehensive business rules for real estate
 * tokenization projects with optimized performance and data consistency.
 */

import { PrismaClient, PropertyStatus, ClientStatus, Prisma, ActionType } from '@prisma/client';
import { prisma } from '../../../prisma/client';
import {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectWithRelations,
  ProjectSummary,
  ProjectStats,
  ProjectFilters,
  ProjectQueryOptions,
  PaginatedProjectResult,
  ProjectError,
  ProjectNotFoundError,
  ProjectAccessError,
  ProjectValidationError,
  ProjectStatusTransitionError,
  TokenSymbolConflictError,
  PROJECT_STATUS_TRANSITIONS,
  Project,
  ClientSummary,
  TokenMetrics,
  ROIProjection
} from '../types/project.types';

import { 
  mapPropertyToProject, 
  mapClientToSummary, 
  projectWithRelationsToSummary,
  validateProjectDataIntegrity,
  sanitizeProjectData
} from '../utils/mappers';

import {
  calculateProjectTokenomics,
  calculateProjectYieldMetrics,
  generateDetailedROIProjections,
  calculateRiskMetrics,
  calculatePortfolioMetrics
} from '../utils/calculations';

// ==========================================
// CACHE CONFIGURATION
// ==========================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ServiceCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.filter(key => key.includes(pattern)).forEach(key => {
      this.cache.delete(key);
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

// ==========================================
// PROJECT SERVICE CLASS
// ==========================================

export class ProjectService {
  private prisma: PrismaClient;
  private cache: ServiceCache;

  constructor(prismaClient: PrismaClient = prisma) {
    this.prisma = prismaClient;
    this.cache = new ServiceCache();
  }

  // ==========================================
  // CORE CRUD OPERATIONS
  // ==========================================

  /**
   * Create a new project with comprehensive validation and audit
   */
  async createProject(
    input: CreateProjectInput,
    clientId: string
  ): Promise<ProjectWithRelations> {
    try {
      // Sanitize and validate input data
      const sanitizedData = sanitizeProjectData(input);
      
      // Check client exists and is active
      const client = await this.prisma.client.findUnique({
        where: { id: clientId }
      });

      if (!client) {
        throw new ProjectValidationError('Client not found', 'clientId');
      }

      if (client.status !== ClientStatus.APPROVED) {
        throw new ProjectValidationError('Only approved clients can create projects');
      }

      // Validate token symbol uniqueness
      await this.validateTokenSymbolUniqueness(input.tokenSymbol);

      // Perform business rule validation
      this.validateCreateProjectBusinessRules(input);

      // Create project with transaction safety
      const project = await this.prisma.$transaction(async (tx) => {
        const newProject = await tx.property.create({
          data: {
            title: input.title,
            description: input.description,
            country: input.country,
            city: input.city,
            address: input.address,
            tokenPrice: input.tokenPrice,
            tokenSymbol: input.tokenSymbol,
            totalPrice: input.totalPrice,
            minInvestment: input.minInvestment,
            tokensAvailablePercent: input.tokensAvailablePercent,
            apr: input.apr,
            irr: input.irr,
            valueGrowth: input.valueGrowth,
            imageUrls: input.imageUrls || [],
            isFeatured: input.isFeatured || false,
            status: PropertyStatus.DRAFT,
            clientId
          },
          include: {
            client: {
              select: {
                id: true,
                companyName: true,
                contactEmail: true,
                status: true
              }
            },
            token: true,
            _count: {
              select: {
                investments: true,
                visits: true,
                documents: true
              }
            }
          }
        });

        // Create audit log entry
        await tx.auditLogEntry.create({
          data: {
            userId: clientId,
            actionType: ActionType.PROPERTY_CREATED,
            entityType: 'PROJECT',
            entityId: newProject.id,
            metadata: {
              title: input.title,
              tokenSymbol: input.tokenSymbol,
              totalPrice: input.totalPrice.toString(),
              action: 'CREATE'
            }
          }
        });

        // Create initial token record if needed
        await tx.token.create({
          data: {
            propertyId: newProject.id,
            name: `${input.title} Token`,
            symbol: input.tokenSymbol,
            decimals: 18,
            totalSupply: Math.floor((input.totalPrice * input.tokensAvailablePercent / 100) / input.tokenPrice),
            blockchain: 'ETHEREUM' as any, // Default blockchain - will be properly typed later
            isActive: false, // Will be activated when project is approved
            isTransferable: true
          }
        });

        return newProject;
      });

      // Invalidate relevant caches
      this.cache.invalidate(`client:${clientId}`);
      this.cache.invalidate('stats');

      // Transform to domain model
      return this.transformToProjectWithRelations(project);
    } catch (error) {
      if (error instanceof ProjectError) {
        throw error;
      }
      throw new ProjectError('Failed to create project', 'PROJECT_CREATE_FAILED', 500);
    }
  }

  /**
   * Get project by ID with comprehensive options
   */
  async getProjectById(
    id: string,
    options: {
      includeRelations?: boolean;
      includeCounts?: boolean;
      includeTokenomics?: boolean;
      includeProjections?: boolean;
      clientId?: string;
    } = {}
  ): Promise<ProjectWithRelations | null> {
    try {
      const cacheKey = `project:${id}:${JSON.stringify(options)}`;
      const cached = this.cache.get<ProjectWithRelations>(cacheKey);
      if (cached) return cached;

      const project = await this.prisma.property.findUnique({
        where: { id },
        include: {
          client: options.includeRelations ? {
            select: {
              id: true,
              companyName: true,
              contactEmail: true,
              status: true
            }
          } : false,
          token: options.includeRelations,
          _count: options.includeCounts ? {
            select: {
              investments: true,
              visits: true,
              documents: true
            }
          } : false
        }
      });

      if (!project) {
        return null;
      }

      // Check client access if specified
      if (options.clientId && project.clientId !== options.clientId) {
        throw new ProjectAccessError('You do not have access to this project');
      }

      const result = this.transformToProjectWithRelations(project);

      // Add additional calculated data if requested
      if (options.includeTokenomics || options.includeProjections) {
        const domainProject = mapPropertyToProject(project);
        
        if (options.includeTokenomics) {
          // Add tokenomics data
          const tokenMetrics = calculateProjectTokenomics(domainProject);
          const yieldMetrics = calculateProjectYieldMetrics(domainProject);
          (result as any).tokenomics = { ...tokenMetrics, ...yieldMetrics };
        }

        if (options.includeProjections) {
          // Add ROI projections
          const projections = generateDetailedROIProjections(domainProject, domainProject.minInvestment);
          const riskMetrics = calculateRiskMetrics(domainProject);
          (result as any).analytics = { projections, riskMetrics };
        }
      }

      // Cache the result
      this.cache.set(cacheKey, result, 2 * 60 * 1000); // 2 minutes for individual projects

      return result;
    } catch (error) {
      if (error instanceof ProjectError) {
        throw error;
      }
      throw new ProjectError('Failed to get project', 'PROJECT_GET_FAILED', 500);
    }
  }

  /**
   * Update project with comprehensive validation and audit
   */
  async updateProject(
    id: string,
    input: UpdateProjectInput,
    clientId?: string
  ): Promise<ProjectWithRelations> {
    try {
      // Get existing project
      const existingProject = await this.getProjectById(id, { includeRelations: true });
      if (!existingProject) {
        throw new ProjectNotFoundError(id);
      }

      // Check ownership if clientId provided
      if (clientId && existingProject.clientId !== clientId) {
        throw new ProjectAccessError('You can only update your own projects');
      }

      // Sanitize input data
      const sanitizedData = sanitizeProjectData(input);

      // Validate token symbol uniqueness if being changed
      if (input.tokenSymbol && input.tokenSymbol !== existingProject.tokenSymbol) {
        await this.validateTokenSymbolUniqueness(input.tokenSymbol, id);
      }

      // Validate status transition if status is being changed
      if (input.status && input.status !== existingProject.status) {
        this.validateStatusTransition(existingProject.status, input.status);
      }

      // Perform business rule validation
      this.validateUpdateProjectBusinessRules(input, existingProject);

      // Update project using transaction
      const updatedProject = await this.prisma.$transaction(async (tx) => {
        const updateData: Prisma.PropertyUpdateInput = {};

        // Only include fields that are actually changing
        Object.keys(input).forEach(key => {
          const value = (input as any)[key];
          if (value !== undefined && value !== (existingProject as any)[key]) {
            (updateData as any)[key] = value;
          }
        });

        // Skip update if no changes
        if (Object.keys(updateData).length === 0) {
          return existingProject;
        }

        const updated = await tx.property.update({
          where: { id },
          data: updateData,
          include: {
            client: {
              select: {
                id: true,
                companyName: true,
                contactEmail: true,
                status: true
              }
            },
            token: true,
            _count: {
              select: {
                investments: true,
                visits: true,
                documents: true
              }
            }
          }
        });

        // Update related token if tokenSymbol changed
        if (input.tokenSymbol && input.tokenSymbol !== existingProject.tokenSymbol) {
          await tx.token.updateMany({
            where: { propertyId: id },
            data: { symbol: input.tokenSymbol }
          });
        }

        // Create audit log entry
        await tx.auditLogEntry.create({
          data: {
            userId: clientId || null,
            actionType: ActionType.PROPERTY_UPDATED,
            entityType: 'PROJECT',
            entityId: id,
            metadata: {
              changes: JSON.stringify(updateData),
              previousStatus: existingProject.status,
              newStatus: input.status || existingProject.status,
              action: 'UPDATE'
            }
          }
        });

        return updated;
      });

      // Invalidate caches
      this.cache.invalidate(`project:${id}`);
      this.cache.invalidate(`client:${existingProject.clientId}`);
      this.cache.invalidate('stats');
      this.cache.invalidate('featured');

      return this.transformToProjectWithRelations(updatedProject);
    } catch (error) {
      if (error instanceof ProjectError) {
        throw error;
      }
      throw new ProjectError('Failed to update project', 'PROJECT_UPDATE_FAILED', 500);
    }
  }

  /**
   * Delete project with safety checks
   */
  async deleteProject(id: string, clientId?: string): Promise<boolean> {
    try {
      const existingProject = await this.getProjectById(id, { includeRelations: true });
      if (!existingProject) {
        throw new ProjectNotFoundError(id);
      }

      // Check ownership if clientId provided
      if (clientId && existingProject.clientId !== clientId) {
        throw new ProjectAccessError('You can only delete your own projects');
      }

      // Check if project has investments
      const investmentCount = await this.prisma.investment.count({
        where: { token: { propertyId: id } }
      });

      if (investmentCount > 0) {
        throw new ProjectValidationError('Cannot delete project with existing investments');
      }

      // Check if project is approved (may need special handling)
      if (existingProject.status === PropertyStatus.APPROVED) {
        throw new ProjectValidationError('Cannot delete approved projects. Contact support if needed.');
      }

      // Delete project and related data using transaction
      await this.prisma.$transaction(async (tx) => {
        // Delete related tokens
        await tx.token.deleteMany({
          where: { propertyId: id }
        });

        // Note: Document and Visit deletions would need proper schema relationships
        // For now, focusing on core project deletion
        
        // Delete the project
        await tx.property.delete({
          where: { id }
        });

        // Create audit log entry
        await tx.auditLogEntry.create({
          data: {
            userId: clientId || null,
            actionType: ActionType.PROPERTY_UPDATED, // Using UPDATED for delete as no DELETE action exists
            entityType: 'PROJECT',
            entityId: id,
            metadata: {
              action: 'DELETE',
              title: existingProject.title,
              tokenSymbol: existingProject.tokenSymbol,
              totalPrice: existingProject.totalPrice.toString()
            }
          }
        });
      });

      // Invalidate caches
      this.cache.invalidate(`project:${id}`);
      this.cache.invalidate(`client:${existingProject.clientId}`);
      this.cache.invalidate('stats');

      return true;
    } catch (error) {
      if (error instanceof ProjectError) {
        throw error;
      }
      throw new ProjectError('Failed to delete project', 'PROJECT_DELETE_FAILED', 500);
    }
  }

  // ==========================================
  // QUERY OPERATIONS
  // ==========================================

  /**
   * Get projects with advanced filtering, pagination, and performance optimization
   */
  async getProjects(options: ProjectQueryOptions = {}): Promise<PaginatedProjectResult> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        filters = {},
        includeRelations = false,
        includeCounts = false
      } = options;

      // Validate pagination parameters
      const validatedPage = Math.max(1, page);
      const validatedLimit = Math.min(Math.max(1, limit), 100); // Max 100 per page
      const skip = (validatedPage - 1) * validatedLimit;

      const cacheKey = `projects:${JSON.stringify(options)}`;
      const cached = this.cache.get<PaginatedProjectResult>(cacheKey);
      if (cached) return cached;

      // Build optimized where clause
      const where = this.buildWhereClause(filters);

      // Build order by clause
      const orderBy = this.buildOrderByClause(sortBy, sortOrder);

      // Execute queries in parallel for performance
      const [properties, total] = await Promise.all([
        this.prisma.property.findMany({
          where,
          orderBy,
          skip,
          take: validatedLimit,
          include: {
            client: includeRelations ? {
              select: {
                id: true,
                companyName: true,
                contactEmail: true,
                status: true
              }
            } : false,
            token: includeRelations ? {
              select: {
                id: true,
                name: true,
                symbol: true,
                totalSupply: true,
                isActive: true
              }
            } : false,
            _count: includeCounts ? {
              select: {
                investments: true,
                visits: true,
                documents: true
              }
            } : false
          }
        }),
        this.prisma.property.count({ where })
      ]);

      // Transform to project summaries
      const projects: ProjectSummary[] = properties.map(property => {
        const client = property.client ? mapClientToSummary(property.client as any) : {
          id: property.clientId,
          companyName: 'N/A',
          contactEmail: 'N/A',
          status: 'UNKNOWN'
        };

        return {
          id: property.id,
          title: property.title,
          description: property.description,
          country: property.country,
          city: property.city,
          tokenPrice: Number(property.tokenPrice),
          tokenSymbol: property.tokenSymbol,
          totalPrice: Number(property.totalPrice),
          minInvestment: Number(property.minInvestment),
          status: property.status,
          isFeatured: property.isFeatured,
          apr: Number(property.apr),
          irr: Number(property.irr),
          valueGrowth: Number(property.valueGrowth),
          imageUrls: Array.isArray(property.imageUrls) ? property.imageUrls : [],
          createdAt: property.createdAt,
          updatedAt: property.updatedAt,
          client,
          tokenCount: Array.isArray(property.token) ? property.token.length : 0,
          investmentCount: property._count?.investments || 0,
          totalInvested: 0 // TODO: Calculate from actual investments
        };
      });

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / validatedLimit);
      const hasNext = validatedPage < totalPages;
      const hasPrev = validatedPage > 1;

      const result: PaginatedProjectResult = {
        projects,
        pagination: {
          page: validatedPage,
          limit: validatedLimit,
          total,
          totalPages,
          hasNext,
          hasPrev
        }
      };

      // Cache results for 1 minute (shorter for dynamic data)
      this.cache.set(cacheKey, result, 60 * 1000);

      return result;
    } catch (error) {
      throw new ProjectError('Failed to get projects', 'PROJECTS_GET_FAILED', 500);
    }
  }

  // ==========================================
  // ANALYTICS AND STATISTICS
  // ==========================================

  /**
   * Get comprehensive project statistics
   */
  async getProjectStats(clientId?: string): Promise<ProjectStats> {
    try {
      const cacheKey = `stats:${clientId || 'global'}`;
      const cached = this.cache.get<ProjectStats>(cacheKey);
      if (cached) return cached;

      const where: Prisma.PropertyWhereInput = {};
      if (clientId) {
        where.clientId = clientId;
      }

      // Execute all queries in parallel for performance
      const [
        totalProjects,
        draftProjects,
        activeProjects,
        completedProjects,
        featuredProjects,
        totalInvestments,
        totalValueResult,
        avgROIResult,
        totalTokensResult
      ] = await Promise.all([
        this.prisma.property.count({ where }),
        this.prisma.property.count({ where: { ...where, status: PropertyStatus.DRAFT } }),
        this.prisma.property.count({ where: { ...where, status: PropertyStatus.APPROVED } }),
        this.prisma.property.count({ where: { ...where, status: PropertyStatus.APPROVED } }), // Using APPROVED as completed
        this.prisma.property.count({ where: { ...where, isFeatured: true } }),
        this.prisma.investment.count({ 
          where: clientId ? { token: { property: { clientId } } } : {}
        }),
        this.prisma.investment.aggregate({
          where: clientId ? { token: { property: { clientId } } } : {},
          _sum: { totalValue: true }
        }),
        this.prisma.property.aggregate({
          where,
          _avg: { apr: true }
        }),
        this.prisma.token.aggregate({
          where: clientId ? { property: { clientId } } : {},
          _sum: { totalSupply: true }
        })
      ]);

      const stats: ProjectStats = {
        totalProjects,
        activeProjects,
        completedProjects,
        draftProjects,
        featuredProjects,
        totalValueLocked: Number(totalValueResult._sum.totalValue) || 0,
        totalInvestments,
        avgROI: Number(avgROIResult._avg.apr) || 0,
        totalTokensIssued: Number(totalTokensResult._sum.totalSupply) || 0
      };

      // Cache statistics for 5 minutes
      this.cache.set(cacheKey, stats, 5 * 60 * 1000);

      return stats;
    } catch (error) {
      throw new ProjectError('Failed to get project statistics', 'PROJECT_STATS_FAILED', 500);
    }
  }

  // ==========================================
  // BUSINESS LOGIC METHODS
  // ==========================================

  /**
   * Update project status with comprehensive validation
   */
  async updateProjectStatus(
    id: string,
    newStatus: PropertyStatus,
    userId: string,
    reason?: string
  ): Promise<ProjectWithRelations> {
    try {
      const project = await this.getProjectById(id, { includeRelations: true });
      if (!project) {
        throw new ProjectNotFoundError(id);
      }

      // Validate status transition
      this.validateStatusTransition(project.status, newStatus);

      // Perform status-specific business logic
      await this.handleStatusTransitionLogic(project, newStatus, userId);

      return await this.updateProject(id, { status: newStatus }, userId);
    } catch (error) {
      if (error instanceof ProjectError) {
        throw error;
      }
      throw new ProjectError('Failed to update project status', 'PROJECT_STATUS_UPDATE_FAILED', 500);
    }
  }

  /**
   * Get featured projects with caching
   */
  async getFeaturedProjects(limit: number = 6): Promise<ProjectSummary[]> {
    try {
      const cacheKey = `featured:${limit}`;
      const cached = this.cache.get<ProjectSummary[]>(cacheKey);
      if (cached) return cached;

      const result = await this.getProjects({
        filters: { 
          isFeatured: true,
          status: [PropertyStatus.APPROVED]
        },
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        includeRelations: true
      });

      // Cache featured projects for 10 minutes
      this.cache.set(cacheKey, result.projects, 10 * 60 * 1000);

      return result.projects;
    } catch (error) {
      throw new ProjectError('Failed to get featured projects', 'FEATURED_PROJECTS_FAILED', 500);
    }
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  /**
   * Transform Prisma property to ProjectWithRelations
   */
  private transformToProjectWithRelations(property: any): ProjectWithRelations {
    const client: ClientSummary = property.client ? {
      id: property.client.id,
      companyName: property.client.companyName,
      contactEmail: property.client.contactEmail,
      status: String(property.client.status)
    } : {
      id: property.clientId,
      companyName: 'Unknown',
      contactEmail: 'Unknown',
      status: 'UNKNOWN'
    };

    return {
      id: property.id,
      clientId: property.clientId,
      title: property.title,
      description: property.description,
      status: property.status,
      country: property.country,
      city: property.city,
      address: property.address,
      totalPrice: Number(property.totalPrice),
      tokenPrice: Number(property.tokenPrice),
      tokenSymbol: property.tokenSymbol,
      minInvestment: Number(property.minInvestment),
      tokensAvailablePercent: Number(property.tokensAvailablePercent),
      apr: Number(property.apr),
      irr: Number(property.irr),
      valueGrowth: Number(property.valueGrowth),
      imageUrls: Array.isArray(property.imageUrls) ? property.imageUrls : [],
      isFeatured: property.isFeatured,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      client,
      tokens: property.token || [],
      _count: property._count
    };
  }

  /**
   * Validate token symbol uniqueness
   */
  private async validateTokenSymbolUniqueness(tokenSymbol: string, excludeId?: string): Promise<void> {
    const existingProject = await this.prisma.property.findFirst({
      where: {
        tokenSymbol,
        id: excludeId ? { not: excludeId } : undefined
      }
    });

    if (existingProject) {
      throw new TokenSymbolConflictError(tokenSymbol);
    }
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(from: PropertyStatus, to: PropertyStatus): void {
    const validTransitions = PROJECT_STATUS_TRANSITIONS[from];
    if (!validTransitions.includes(to)) {
      throw new ProjectStatusTransitionError(from, to);
    }
  }

  /**
   * Validate create project business rules
   */
  private validateCreateProjectBusinessRules(input: CreateProjectInput): void {
    // Token price should allow for reasonable minimum investment
    if (input.minInvestment < input.tokenPrice) {
      throw new ProjectValidationError('Minimum investment must be at least the price of one token');
    }

    // APR should typically not exceed IRR significantly
    if (input.apr > input.irr + 10) {
      throw new ProjectValidationError('APR should not significantly exceed IRR');
    }

    // Total tokenizable value should be reasonable
    const tokenizableValue = input.totalPrice * (input.tokensAvailablePercent / 100);
    if (tokenizableValue < input.minInvestment) {
      throw new ProjectValidationError('Total tokenizable value is too low for minimum investment');
    }
  }

  /**
   * Validate update project business rules
   */
  private validateUpdateProjectBusinessRules(input: UpdateProjectInput, existing: ProjectWithRelations): void {
    // Cannot change certain fields if project has investments
    const hasInvestments = (existing._count?.investments || 0) > 0;
    
    if (hasInvestments) {
      const restrictedFields = ['tokenPrice', 'tokenSymbol', 'totalPrice', 'tokensAvailablePercent'];
      const changedRestrictedFields = restrictedFields.filter(field => 
        input[field as keyof UpdateProjectInput] !== undefined && 
        input[field as keyof UpdateProjectInput] !== (existing as any)[field]
      );

      if (changedRestrictedFields.length > 0) {
        throw new ProjectValidationError(
          `Cannot modify ${changedRestrictedFields.join(', ')} after investments have been made`
        );
      }
    }

    // Validate APR vs IRR relationship if both are being updated
    const newApr = input.apr !== undefined ? input.apr : existing.apr;
    const newIrr = input.irr !== undefined ? input.irr : existing.irr;
    
    if (newApr > newIrr + 10) {
      throw new ProjectValidationError('APR should not significantly exceed IRR');
    }
  }

  /**
   * Handle status transition business logic
   */
  private async handleStatusTransitionLogic(
    project: ProjectWithRelations,
    newStatus: PropertyStatus,
    userId: string
  ): Promise<void> {
    switch (newStatus) {
      case PropertyStatus.APPROVED:
        // When approving, activate associated tokens
        await this.prisma.token.updateMany({
          where: { propertyId: project.id },
          data: { isActive: true }
        });
        break;

      case PropertyStatus.REJECTED:
        // When rejecting, deactivate tokens
        await this.prisma.token.updateMany({
          where: { propertyId: project.id },
          data: { isActive: false }
        });
        break;

      default:
        // No special handling needed for other statuses
        break;
    }
  }

  /**
   * Build optimized where clause for queries
   */
  private buildWhereClause(filters: ProjectFilters): Prisma.PropertyWhereInput {
    const where: Prisma.PropertyWhereInput = {};

    // Status filter
    if (filters.status) {
      where.status = Array.isArray(filters.status) 
        ? { in: filters.status } 
        : { in: [filters.status] };
    }

    // Location filters
    if (filters.country) {
      where.country = Array.isArray(filters.country)
        ? { in: filters.country }
        : filters.country;
    }

    if (filters.city) {
      where.city = Array.isArray(filters.city)
        ? { in: filters.city }
        : filters.city;
    }

    // Client filter
    if (filters.clientId) {
      where.clientId = Array.isArray(filters.clientId)
        ? { in: filters.clientId }
        : filters.clientId;
    }

    // Featured filter
    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    // Price range filters
    if (filters.minTokenPrice !== undefined || filters.maxTokenPrice !== undefined) {
      where.tokenPrice = {};
      if (filters.minTokenPrice !== undefined) {
        where.tokenPrice.gte = filters.minTokenPrice;
      }
      if (filters.maxTokenPrice !== undefined) {
        where.tokenPrice.lte = filters.maxTokenPrice;
      }
    }

    if (filters.minTotalPrice !== undefined || filters.maxTotalPrice !== undefined) {
      where.totalPrice = {};
      if (filters.minTotalPrice !== undefined) {
        where.totalPrice.gte = filters.minTotalPrice;
      }
      if (filters.maxTotalPrice !== undefined) {
        where.totalPrice.lte = filters.maxTotalPrice;
      }
    }

    // ROI filters
    if (filters.minApr !== undefined || filters.maxApr !== undefined) {
      where.apr = {};
      if (filters.minApr !== undefined) {
        where.apr.gte = filters.minApr;
      }
      if (filters.maxApr !== undefined) {
        where.apr.lte = filters.maxApr;
      }
    }

    if (filters.minIrr !== undefined || filters.maxIrr !== undefined) {
      where.irr = {};
      if (filters.minIrr !== undefined) {
        where.irr.gte = filters.minIrr;
      }
      if (filters.maxIrr !== undefined) {
        where.irr.lte = filters.maxIrr;
      }
    }

    // Date range filters
    if (filters.createdAfter || filters.createdBefore) {
      where.createdAt = {};
      if (filters.createdAfter) {
        where.createdAt.gte = filters.createdAfter;
      }
      if (filters.createdBefore) {
        where.createdAt.lte = filters.createdBefore;
      }
    }

    // Text search
    if (filters.search) {
      const searchTerms = filters.search.split(' ').filter(term => term.length > 0);
      where.OR = [
        ...searchTerms.map(term => ({
          title: { contains: term, mode: 'insensitive' as const }
        })),
        ...searchTerms.map(term => ({
          description: { contains: term, mode: 'insensitive' as const }
        })),
        ...searchTerms.map(term => ({
          tokenSymbol: { contains: term, mode: 'insensitive' as const }
        })),
        ...searchTerms.map(term => ({
          city: { contains: term, mode: 'insensitive' as const }
        })),
        ...searchTerms.map(term => ({
          country: { contains: term, mode: 'insensitive' as const }
        }))
      ];
    }

    return where;
  }

  /**
   * Build order by clause
   */
  private buildOrderByClause(
    sortBy: string,
    sortOrder: string
  ): Prisma.PropertyOrderByWithRelationInput {
    const direction = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';
    
    switch (sortBy) {
      case 'title':
        return { title: direction };
      case 'totalPrice':
        return { totalPrice: direction };
      case 'tokenPrice':
        return { tokenPrice: direction };
      case 'apr':
        return { apr: direction };
      case 'irr':
        return { irr: direction };
      case 'status':
        return { status: direction };
      case 'updatedAt':
        return { updatedAt: direction };
      case 'createdAt':
      default:
        return { createdAt: direction };
    }
  }
}

// ==========================================
// SINGLETON EXPORT
// ==========================================

/**
 * Singleton instance of ProjectService for application use
 */
export const projectService = new ProjectService();