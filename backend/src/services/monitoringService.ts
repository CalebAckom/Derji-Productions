import { performanceLogger, securityLogger } from '../config/logger';
import { LoggingService } from './loggingService';

export interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: SystemMetrics) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cooldown: number; // minutes
  enabled: boolean;
}

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number; // percentage
    loadAverage: number[];
  };
  memory: {
    used: number; // bytes
    total: number; // bytes
    percentage: number;
  };
  requests: {
    total: number;
    errors: number;
    averageResponseTime: number;
    slowRequests: number;
  };
  database: {
    connections: number;
    slowQueries: number;
    errors: number;
  };
  errors: {
    total: number;
    critical: number;
    warnings: number;
  };
}

export interface Alert {
  id: string;
  ruleId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

class MonitoringService {
  private metrics!: SystemMetrics;
  private alerts: Alert[] = [];
  private alertRules: AlertRule[] = [];
  private lastAlertTimes: Map<string, Date> = new Map();
  private loggingService: LoggingService;
  private metricsInterval?: NodeJS.Timeout;

  constructor() {
    this.loggingService = new LoggingService({ correlationId: 'monitoring-service' });
    this.initializeMetrics();
    this.setupDefaultAlertRules();
    this.startMetricsCollection();
  }

  private initializeMetrics() {
    this.metrics = {
      timestamp: new Date(),
      cpu: {
        usage: 0,
        loadAverage: [0, 0, 0],
      },
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
      },
      requests: {
        total: 0,
        errors: 0,
        averageResponseTime: 0,
        slowRequests: 0,
      },
      database: {
        connections: 0,
        slowQueries: 0,
        errors: 0,
      },
      errors: {
        total: 0,
        critical: 0,
        warnings: 0,
      },
    };
  }

  private setupDefaultAlertRules() {
    this.alertRules = [
      {
        id: 'high-cpu-usage',
        name: 'High CPU Usage',
        condition: (metrics) => metrics.cpu.usage > 80,
        severity: 'high',
        cooldown: 5,
        enabled: true,
      },
      {
        id: 'high-memory-usage',
        name: 'High Memory Usage',
        condition: (metrics) => metrics.memory.percentage > 85,
        severity: 'high',
        cooldown: 5,
        enabled: true,
      },
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        condition: (metrics) => {
          const errorRate = metrics.requests.total > 0 ? 
            (metrics.requests.errors / metrics.requests.total) * 100 : 0;
          return errorRate > 5; // 5% error rate
        },
        severity: 'critical',
        cooldown: 2,
        enabled: true,
      },
      {
        id: 'slow-response-time',
        name: 'Slow Response Time',
        condition: (metrics) => metrics.requests.averageResponseTime > 2000,
        severity: 'medium',
        cooldown: 10,
        enabled: true,
      },
      {
        id: 'database-connection-limit',
        name: 'Database Connection Limit',
        condition: (metrics) => metrics.database.connections > 80, // Assuming 100 max connections
        severity: 'high',
        cooldown: 3,
        enabled: true,
      },
      {
        id: 'critical-errors',
        name: 'Critical Errors',
        condition: (metrics) => metrics.errors.critical > 0,
        severity: 'critical',
        cooldown: 1,
        enabled: true,
      },
    ];
  }

  private startMetricsCollection() {
    // Collect metrics every 30 seconds
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
      this.evaluateAlerts();
    }, 30000);

    this.loggingService.info('Monitoring service started', {
      metricsInterval: '30s',
      alertRulesCount: this.alertRules.length,
    });
  }

  private collectMetrics() {
    try {
      // Update timestamp
      this.metrics.timestamp = new Date();

      // Collect CPU metrics
      const cpuUsage = process.cpuUsage();
      this.metrics.cpu.usage = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to percentage approximation
      this.metrics.cpu.loadAverage = require('os').loadavg();

      // Collect memory metrics
      const memUsage = process.memoryUsage();
      const totalMemory = require('os').totalmem();
      this.metrics.memory.used = memUsage.heapUsed;
      this.metrics.memory.total = totalMemory;
      this.metrics.memory.percentage = (memUsage.heapUsed / totalMemory) * 100;

      // Log metrics
      this.loggingService.logMetric('cpu_usage', this.metrics.cpu.usage, 'percentage');
      this.loggingService.logMetric('memory_usage', this.metrics.memory.percentage, 'percentage');
      this.loggingService.logMetric('memory_used', this.metrics.memory.used, 'bytes');

      performanceLogger.debug('System metrics collected', {
        cpu: this.metrics.cpu,
        memory: this.metrics.memory,
        timestamp: this.metrics.timestamp,
      });

    } catch (error) {
      this.loggingService.logError(error as Error, 'metrics collection');
    }
  }

  private evaluateAlerts() {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      try {
        const shouldAlert = rule.condition(this.metrics);
        
        if (shouldAlert) {
          const lastAlertTime = this.lastAlertTimes.get(rule.id);
          const now = new Date();
          
          // Check cooldown period
          if (lastAlertTime) {
            const timeDiff = (now.getTime() - lastAlertTime.getTime()) / (1000 * 60); // minutes
            if (timeDiff < rule.cooldown) {
              continue; // Still in cooldown
            }
          }

          // Create alert
          const alert: Alert = {
            id: `${rule.id}-${Date.now()}`,
            ruleId: rule.id,
            severity: rule.severity,
            message: `Alert: ${rule.name}`,
            timestamp: now,
            resolved: false,
            metadata: {
              metrics: this.metrics,
              rule: rule.name,
            },
          };

          this.alerts.push(alert);
          this.lastAlertTimes.set(rule.id, now);

          // Log alert
          this.loggingService.logSecurityEvent({
            event: 'system_alert_triggered',
            severity: rule.severity,
            metadata: {
              alertId: alert.id,
              ruleName: rule.name,
              metrics: this.metrics,
            },
          });

          // Send alert notification (in production, this would integrate with external services)
          this.sendAlertNotification(alert);
        }
      } catch (error) {
        this.loggingService.logError(error as Error, `alert evaluation for rule ${rule.id}`);
      }
    }
  }

  private sendAlertNotification(alert: Alert) {
    // In production, this would integrate with services like:
    // - Slack
    // - PagerDuty
    // - Email notifications
    // - SMS alerts
    // - Discord webhooks

    const notification = {
      alert: alert.id,
      severity: alert.severity,
      message: alert.message,
      timestamp: alert.timestamp,
      service: 'derji-productions-api',
      environment: process.env['NODE_ENV'] || 'development',
    };

    this.loggingService.warn('Alert notification sent', notification);

    // Log to security logger for critical alerts
    if (alert.severity === 'critical') {
      securityLogger.error('Critical system alert', notification);
    }
  }

  // Public methods for updating metrics from application
  updateRequestMetrics(responseTime: number, isError: boolean = false, isSlow: boolean = false) {
    this.metrics.requests.total++;
    if (isError) this.metrics.requests.errors++;
    if (isSlow) this.metrics.requests.slowRequests++;
    
    // Update average response time (simple moving average)
    this.metrics.requests.averageResponseTime = 
      (this.metrics.requests.averageResponseTime + responseTime) / 2;
  }

  updateDatabaseMetrics(connections: number, slowQuery: boolean = false, error: boolean = false) {
    this.metrics.database.connections = connections;
    if (slowQuery) this.metrics.database.slowQueries++;
    if (error) this.metrics.database.errors++;
  }

  updateErrorMetrics(isCritical: boolean = false, isWarning: boolean = false) {
    this.metrics.errors.total++;
    if (isCritical) this.metrics.errors.critical++;
    if (isWarning) this.metrics.errors.warnings++;
  }

  // Alert management
  addAlertRule(rule: AlertRule) {
    this.alertRules.push(rule);
    this.loggingService.info('Alert rule added', { ruleId: rule.id, ruleName: rule.name });
  }

  removeAlertRule(ruleId: string) {
    this.alertRules = this.alertRules.filter(rule => rule.id !== ruleId);
    this.loggingService.info('Alert rule removed', { ruleId });
  }

  enableAlertRule(ruleId: string) {
    const rule = this.alertRules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = true;
      this.loggingService.info('Alert rule enabled', { ruleId });
    }
  }

  disableAlertRule(ruleId: string) {
    const rule = this.alertRules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = false;
      this.loggingService.info('Alert rule disabled', { ruleId });
    }
  }

  resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      this.loggingService.info('Alert resolved', { alertId });
    }
  }

  // Getters for monitoring data
  getCurrentMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  getAllAlerts(): Alert[] {
    return [...this.alerts];
  }

  getAlertRules(): AlertRule[] {
    return [...this.alertRules];
  }

  // Health check
  getHealthStatus() {
    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
    const highAlerts = activeAlerts.filter(a => a.severity === 'high');

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (criticalAlerts.length > 0) {
      status = 'unhealthy';
    } else if (highAlerts.length > 0) {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      alerts: {
        total: activeAlerts.length,
        critical: criticalAlerts.length,
        high: highAlerts.length,
        medium: activeAlerts.filter(a => a.severity === 'medium').length,
        low: activeAlerts.filter(a => a.severity === 'low').length,
      },
      uptime: process.uptime(),
    };
  }

  // Cleanup and shutdown
  shutdown() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    this.loggingService.info('Monitoring service shutdown');
  }
}

// Singleton instance
export const monitoringService = new MonitoringService();

// Express middleware to update request metrics
export const monitoringMiddleware = (_req: any, res: any, next: Function) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const isError = res.statusCode >= 400;
    const isSlow = responseTime > 1000;

    monitoringService.updateRequestMetrics(responseTime, isError, isSlow);
  });

  next();
};

export default MonitoringService;