/**
 * Simple Health Check Service for Accounts Module
 * Provides basic health status for essential accounts module components
 */

import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { accountsLogger } from '../utils/accounts.logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  components: {
    database: ComponentHealth;
    authentication: ComponentHealth;
  };
  details?: string;
}

interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastCheck: string;
  details?: string;
}

class HealthCheckService {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Basic health check
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkAuthentication()
    ]);

    const [database, authentication] = checks.map(result => 
      result.status === 'fulfilled' ? result.value : this.createUnhealthyComponent(result.reason)
    );

    // Determine overall health status
    const components = { database, authentication };
    const overallStatus = this.calculateOverallStatus(components);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      components
    };
  }

  /**
   * Simple liveness check
   */
  async getLivenessStatus(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'alive',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Simple readiness check
   */
  async getReadinessStatus(): Promise<{ status: string; timestamp: string; ready: boolean }> {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        ready: true
      };
    } catch (error) {
      accountsLogger.error('Readiness check failed', (error as Error).message);
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        ready: false
      };
    }
  }

  /**
   * Check database health
   */
  private async checkDatabase(): Promise<ComponentHealth> {
    const startTime = Date.now();
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        lastCheck: new Date().toISOString(),
        details: `Database connection successful (${responseTime}ms)`
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        details: `Database connection failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Check authentication system health
   */
  private async checkAuthentication(): Promise<ComponentHealth> {
    const startTime = Date.now();
    
    try {
      // Basic check - ensure we can access user table
      await prisma.user.findFirst({
        take: 1,
        select: { id: true }
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        lastCheck: new Date().toISOString(),
        details: `Authentication system operational (${responseTime}ms)`
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        details: `Authentication system error: ${(error as Error).message}`
      };
    }
  }

  /**
   * Create unhealthy component from error
   */
  private createUnhealthyComponent(error: any): ComponentHealth {
    return {
      status: 'unhealthy',
      lastCheck: new Date().toISOString(),
      details: (error as any)?.message || 'Unknown error'
    };
  }

  /**
   * Calculate overall status from components
   */
  private calculateOverallStatus(components: Record<string, ComponentHealth>): 'healthy' | 'degraded' | 'unhealthy' {
    const statuses = Object.values(components).map(c => c.status);
    
    if (statuses.every(s => s === 'healthy')) {
      return 'healthy';
    }
    
    if (statuses.some(s => s === 'unhealthy')) {
      return 'unhealthy';
    }
    
    return 'degraded';
  }
}

// Create singleton instance
const healthCheckService = new HealthCheckService();

/**
 * Health check endpoint middleware
 */
export const healthCheckEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const healthStatus = await healthCheckService.getHealthStatus();
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json({
      success: true,
      data: healthStatus
    });
    
    accountsLogger.info('Health check performed', {
      status: healthStatus.status,
      components: Object.keys(healthStatus.components).length
    });
  } catch (error) {
    accountsLogger.error('Health check failed', (error as Error).message);
    res.status(503).json({
      success: false,
      error: {
        message: 'Health check failed',
        timestamp: new Date().toISOString()
      }
    });
  }
};

/**
 * Liveness probe endpoint middleware
 */
export const livenessEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const livenessStatus = await healthCheckService.getLivenessStatus();
    res.status(200).json({
      success: true,
      data: livenessStatus
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        message: 'Liveness check failed',
        timestamp: new Date().toISOString()
      }
    });
  }
};

/**
 * Readiness probe endpoint middleware
 */
export const readinessEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const readinessStatus = await healthCheckService.getReadinessStatus();
    const statusCode = readinessStatus.ready ? 200 : 503;
    
    res.status(statusCode).json({
      success: true,
      data: readinessStatus
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        message: 'Readiness check failed',
        timestamp: new Date().toISOString()
      }
    });
  }
};

export default healthCheckService;
