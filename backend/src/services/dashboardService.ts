import fs from 'fs/promises';
import path from 'path';
import { LoggingService } from './loggingService';
import { monitoringService } from './monitoringService';

export interface LogStats {
  totalLogs: number;
  errorLogs: number;
  warnLogs: number;
  infoLogs: number;
  debugLogs: number;
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface PerformanceStats {
  averageResponseTime: number;
  slowRequestsCount: number;
  totalRequests: number;
  errorRate: number;
  topSlowEndpoints: Array<{
    endpoint: string;
    averageTime: number;
    count: number;
  }>;
}

export interface SecurityStats {
  securityEvents: number;
  criticalEvents: number;
  highSeverityEvents: number;
  failedLogins: number;
  suspiciousActivity: number;
}

export interface SystemStats {
  uptime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cpuUsage: number;
  diskUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
}

export interface DashboardData {
  timestamp: Date;
  logStats: LogStats;
  performanceStats: PerformanceStats;
  securityStats: SecurityStats;
  systemStats: SystemStats;
  recentErrors: Array<{
    timestamp: Date;
    level: string;
    message: string;
    requestId?: string;
    userId?: string;
  }>;
  activeAlerts: Array<{
    id: string;
    severity: string;
    message: string;
    timestamp: Date;
  }>;
}

class DashboardService {
  private loggingService: LoggingService;
  private logCache: Map<string, any[]> = new Map();
  private statsCache: DashboardData | null = null;
  private cacheExpiry: Date | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.loggingService = new LoggingService({ correlationId: 'dashboard-service' });
  }

  async getDashboardData(timeRange?: { start: Date; end: Date }): Promise<DashboardData> {
    // Return cached data if still valid
    if (this.statsCache && this.cacheExpiry && new Date() < this.cacheExpiry) {
      return this.statsCache;
    }

    try {
      const now = new Date();
      const defaultTimeRange = {
        start: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
        end: now,
      };

      const range = timeRange || defaultTimeRange;

      const [logStats, performanceStats, securityStats, systemStats, recentErrors] = await Promise.all([
        this.getLogStats(range),
        this.getPerformanceStats(range),
        this.getSecurityStats(range),
        this.getSystemStats(),
        this.getRecentErrors(10), // Last 10 errors
      ]);

      const activeAlerts = monitoringService.getActiveAlerts().map(alert => ({
        id: alert.id,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp,
      }));

      this.statsCache = {
        timestamp: now,
        logStats,
        performanceStats,
        securityStats,
        systemStats,
        recentErrors,
        activeAlerts,
      };

      this.cacheExpiry = new Date(now.getTime() + this.CACHE_DURATION);

      this.loggingService.info('Dashboard data generated', {
        timeRange: range,
        cacheExpiry: this.cacheExpiry,
      });

      return this.statsCache;

    } catch (error) {
      this.loggingService.logError(error as Error, 'dashboard data generation');
      throw error;
    }
  }

  private async getLogStats(timeRange: { start: Date; end: Date }): Promise<LogStats> {
    try {
      // In a real implementation, this would query log files or a log aggregation service
      // For now, we'll simulate with basic stats
      
      const logs = await this.readLogFiles(timeRange);
      
      const stats: LogStats = {
        totalLogs: logs.length,
        errorLogs: logs.filter(log => log.level === 'error').length,
        warnLogs: logs.filter(log => log.level === 'warn').length,
        infoLogs: logs.filter(log => log.level === 'info').length,
        debugLogs: logs.filter(log => log.level === 'debug').length,
        timeRange,
      };

      return stats;

    } catch (error) {
      this.loggingService.logError(error as Error, 'log stats generation');
      return {
        totalLogs: 0,
        errorLogs: 0,
        warnLogs: 0,
        infoLogs: 0,
        debugLogs: 0,
        timeRange,
      };
    }
  }

  private async getPerformanceStats(timeRange: { start: Date; end: Date }): Promise<PerformanceStats> {
    try {
      const logs = await this.readLogFiles(timeRange, 'performance');
      
      const requestLogs = logs.filter(log => log.operation && log.duration);
      const totalRequests = requestLogs.length;
      const errorRequests = logs.filter(log => log.level === 'error').length;
      
      let totalResponseTime = 0;
      let slowRequestsCount = 0;
      const endpointTimes: Map<string, { total: number; count: number }> = new Map();

      requestLogs.forEach(log => {
        const duration = parseInt(log.duration?.replace('ms', '') || '0');
        totalResponseTime += duration;
        
        if (duration > 1000) {
          slowRequestsCount++;
        }

        const endpoint = log.operation || 'unknown';
        const existing = endpointTimes.get(endpoint) || { total: 0, count: 0 };
        endpointTimes.set(endpoint, {
          total: existing.total + duration,
          count: existing.count + 1,
        });
      });

      const topSlowEndpoints = Array.from(endpointTimes.entries())
        .map(([endpoint, stats]) => ({
          endpoint,
          averageTime: stats.total / stats.count,
          count: stats.count,
        }))
        .sort((a, b) => b.averageTime - a.averageTime)
        .slice(0, 5);

      return {
        averageResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
        slowRequestsCount,
        totalRequests,
        errorRate: totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0,
        topSlowEndpoints,
      };

    } catch (error) {
      this.loggingService.logError(error as Error, 'performance stats generation');
      return {
        averageResponseTime: 0,
        slowRequestsCount: 0,
        totalRequests: 0,
        errorRate: 0,
        topSlowEndpoints: [],
      };
    }
  }

  private async getSecurityStats(timeRange: { start: Date; end: Date }): Promise<SecurityStats> {
    try {
      const logs = await this.readLogFiles(timeRange, 'security');
      
      const securityEvents = logs.length;
      const criticalEvents = logs.filter(log => log.severity === 'critical').length;
      const highSeverityEvents = logs.filter(log => log.severity === 'high').length;
      const failedLogins = logs.filter(log => log.event?.includes('login') && log.success === false).length;
      const suspiciousActivity = logs.filter(log => 
        log.event?.includes('suspicious') || 
        log.event?.includes('brute_force') ||
        log.event?.includes('unauthorized')
      ).length;

      return {
        securityEvents,
        criticalEvents,
        highSeverityEvents,
        failedLogins,
        suspiciousActivity,
      };

    } catch (error) {
      this.loggingService.logError(error as Error, 'security stats generation');
      return {
        securityEvents: 0,
        criticalEvents: 0,
        highSeverityEvents: 0,
        failedLogins: 0,
        suspiciousActivity: 0,
      };
    }
  }

  private async getSystemStats(): Promise<SystemStats> {
    try {
      const memUsage = process.memoryUsage();
      const totalMemory = require('os').totalmem();

      return {
        uptime: process.uptime(),
        memoryUsage: {
          used: memUsage.heapUsed,
          total: totalMemory,
          percentage: (memUsage.heapUsed / totalMemory) * 100,
        },
        cpuUsage: process.cpuUsage().user / 1000000, // Approximate CPU usage
      };

    } catch (error) {
      this.loggingService.logError(error as Error, 'system stats generation');
      return {
        uptime: 0,
        memoryUsage: {
          used: 0,
          total: 0,
          percentage: 0,
        },
        cpuUsage: 0,
      };
    }
  }

  private async getRecentErrors(limit: number = 10): Promise<Array<{
    timestamp: Date;
    level: string;
    message: string;
    requestId?: string;
    userId?: string;
  }>> {
    try {
      const logs = await this.readLogFiles({
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        end: new Date(),
      }, 'error');

      return logs
        .filter(log => log.level === 'error')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
        .map(log => ({
          timestamp: new Date(log.timestamp),
          level: log.level,
          message: log.message || 'Unknown error',
          requestId: log.requestId,
          userId: log.userId,
        }));

    } catch (error) {
      this.loggingService.logError(error as Error, 'recent errors retrieval');
      return [];
    }
  }

  private async readLogFiles(timeRange: { start: Date; end: Date }, logType?: string): Promise<any[]> {
    try {
      const logsDir = path.join(__dirname, '../../logs');
      const cacheKey = `${logType || 'all'}-${timeRange.start.toISOString()}-${timeRange.end.toISOString()}`;
      
      // Check cache first
      if (this.logCache.has(cacheKey)) {
        return this.logCache.get(cacheKey) || [];
      }

      // Check if logs directory exists
      try {
        await fs.access(logsDir);
      } catch {
        // Logs directory doesn't exist yet, return empty array
        return [];
      }

      const files = await fs.readdir(logsDir);
      const logFiles = files.filter(file => {
        if (logType) {
          return file.includes(logType) && file.endsWith('.log');
        }
        return file.endsWith('.log');
      });

      const allLogs: any[] = [];

      for (const file of logFiles) {
        try {
          const filePath = path.join(logsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const lines = content.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const logEntry = JSON.parse(line);
              const logTime = new Date(logEntry.timestamp);
              
              if (logTime >= timeRange.start && logTime <= timeRange.end) {
                allLogs.push(logEntry);
              }
            } catch {
              // Skip invalid JSON lines
            }
          }
        } catch (error) {
          this.loggingService.logError(error as Error, `reading log file ${file}`);
        }
      }

      // Cache the results
      this.logCache.set(cacheKey, allLogs);
      
      // Clean up old cache entries
      if (this.logCache.size > 100) {
        const keys = Array.from(this.logCache.keys());
        const oldestKey = keys[0];
        if (oldestKey) {
          this.logCache.delete(oldestKey);
        }
      }

      return allLogs;

    } catch (error) {
      this.loggingService.logError(error as Error, 'log file reading');
      return [];
    }
  }

  // Real-time log streaming (for WebSocket connections)
  async getLogStream(filters?: {
    level?: string;
    service?: string;
    userId?: string;
    limit?: number;
  }): Promise<any[]> {
    try {
      const logs = await this.readLogFiles({
        start: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        end: new Date(),
      });

      let filteredLogs = logs;

      if (filters?.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level);
      }

      if (filters?.service) {
        filteredLogs = filteredLogs.filter(log => log.service === filters.service);
      }

      if (filters?.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }

      return filteredLogs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, filters?.limit || 100);

    } catch (error) {
      this.loggingService.logError(error as Error, 'log stream generation');
      return [];
    }
  }

  // Export logs for external analysis
  async exportLogs(timeRange: { start: Date; end: Date }, format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const logs = await this.readLogFiles(timeRange);

      if (format === 'csv') {
        const headers = ['timestamp', 'level', 'message', 'service', 'requestId', 'userId'];
        const csvLines = [headers.join(',')];
        
        logs.forEach(log => {
          const row = headers.map(header => {
            const value = log[header] || '';
            return `"${String(value).replace(/"/g, '""')}"`;
          });
          csvLines.push(row.join(','));
        });

        return csvLines.join('\n');
      }

      return JSON.stringify(logs, null, 2);

    } catch (error) {
      this.loggingService.logError(error as Error, 'log export');
      throw error;
    }
  }

  // Clear cache
  clearCache() {
    this.logCache.clear();
    this.statsCache = null;
    this.cacheExpiry = null;
    this.loggingService.info('Dashboard cache cleared');
  }
}

export const dashboardService = new DashboardService();
export default DashboardService;