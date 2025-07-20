import { PrismaClient, PropertyStatus, ClientStatus } from '@prisma/client';
import { ProjectDTO, ProjectFilterOptions } from '../types';
import { mapToProjectDTO } from '../utils';

export class ProjectService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * List projects with filtering and pagination
   */
  async listProjects(options: ProjectFilterOptions) {
    const {
      page = 1,
      limit = 10,
      status,
      clientId,
      clientStatus,
      hasToken
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause for property filtering
    const propertyWhere: any = {};
    if (status) {
      propertyWhere.status = status;
    }
    if (clientId) {
      propertyWhere.clientId = clientId;
    }

    // Build where clause for client filtering
    const clientWhere: any = {};
    if (clientStatus) {
      clientWhere.status = clientStatus;
    }

    // Query properties with related client and token data
    const properties = await this.prisma.property.findMany({
      where: propertyWhere,
      include: {
        client: {
          where: clientWhere
        },
        tokens: {
          where: {
            isActive: true
          },
          take: 1
        }
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter out properties where client doesn't match the filter
    // (needed because Prisma include with where doesn't exclude records)
    const filteredProperties = properties.filter(property => {
      if (clientStatus && property.client.status !== clientStatus) {
        return false;
      }
      if (hasToken !== undefined) {
        const hasTokenValue = property.tokens && property.tokens.length > 0;
        return hasToken ? hasTokenValue : !hasTokenValue;
      }
      return true;
    });

    // Map to ProjectDTO format using the mapper utility
    const projects: ProjectDTO[] = filteredProperties.map(property => {
      return mapToProjectDTO(
        property, 
        property.client, 
        property.tokens && property.tokens.length > 0 ? property.tokens[0] : undefined
      );
    });

    // Get total count for pagination
    const totalCount = await this.prisma.property.count({
      where: propertyWhere
    });

    return {
      projects,
      total: totalCount
    };
  }

  /**
   * Get a project by ID
   */
  async getProjectById(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        client: true,
        tokens: {
          where: {
            isActive: true
          },
          take: 1
        }
      }
    });

    if (!property) {
      return null;
    }

    // Map to ProjectDTO format using the mapper utility
    const project: ProjectDTO = mapToProjectDTO(
      property,
      property.client,
      property.tokens && property.tokens.length > 0 ? property.tokens[0] : undefined
    );

    return project;
  }

  /**
   * Get featured projects
   */
  async getFeaturedProjects(limit: number = 3) {
    const properties = await this.prisma.property.findMany({
      where: {
        isFeatured: true,
        status: PropertyStatus.ACTIVE
      },
      include: {
        client: {
          where: {
            status: ClientStatus.APPROVED
          }
        },
        tokens: {
          where: {
            isActive: true
          },
          take: 1
        }
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter out properties where client doesn't match the filter
    const filteredProperties = properties.filter(property => 
      property.client && property.client.status === ClientStatus.APPROVED
    );

    // Map to ProjectDTO format using the mapper utility
    const projects: ProjectDTO[] = filteredProperties.map(property => {
      return mapToProjectDTO(
        property, 
        property.client, 
        property.tokens && property.tokens.length > 0 ? property.tokens[0] : undefined
      );
    });

    return projects;
  }
}