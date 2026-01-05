import express from 'express';
import { dashboardService } from '../services/dashboardService';
import { monitoringService } from '../services/monitoringService';
import { LoggingService } from '../services/loggingService';

const router = express.Router();

/**
 * @swagger
 * /api/monitoring/dashboard:
 *   get:
 *     summary: Get monitoring dashboard data
 *     tags: [Monitoring]
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start time for data range
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End time for data range
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal server error
 */
router.get('/dashboard', async (req, res) => {
  const loggingService: LoggingService = (req as any).loggingService;
  
  try {
    const { start, end } = req.query;
    
    let timeRange;
    if (start && end) {
      timeRange = {
        start: new Date(start as string),
        end: new Date(end as string),
      };
    }

    const dashboardData = await dashboardService.getDashboardData(timeRange);

    loggingService.logBusinessEvent('dashboard_data_requested', true, {
      timeRange,
      dataSize: JSON.stringify(dashboardData).length,
    });

    res.json({
      success: true,
      data: dashboardData,
    });

  } catch (error) {
    loggingService.logError(error as Error, 'dashboard data retrieval');
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard data',
    });
  }
});

/**
 * @swagger
 * /api/monitoring/metrics:
 *   get:
 *     summary: Get current system metrics
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: System metrics retrieved successfully
 */
router.get('/metrics', (req, res) => {
  const loggingService: LoggingService = (req as any).loggingService;
  
  try {
    const metrics = monitoringService.getCurrentMetrics();

    loggingService.info('System metrics requested', {
      metricsTimestamp: metrics.timestamp,
    });

    res.json({
      success: true,
      data: metrics,
    });

  } catch (error) {
    loggingService.logError(error as Error, 'metrics retrieval');
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system metrics',
    });
  }
});

/**
 * @swagger
 * /api/monitoring/alerts:
 *   get:
 *     summary: Get active alerts
 *     tags: [Monitoring]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter for active alerts only
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
 */
router.get('/alerts', (req, res) => {
  const loggingService: LoggingService = (req as any).loggingService;
  
  try {
    const { active } = req.query;
    
    const alerts = active === 'true' 
      ? monitoringService.getActiveAlerts()
      : monitoringService.getAllAlerts();

    loggingService.info('Alerts requested', {
      activeOnly: active === 'true',
      alertCount: alerts.length,
    });

    res.json({
      success: true,
      data: alerts,
    });

  } catch (error) {
    loggingService.logError(error as Error, 'alerts retrieval');
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve alerts',
    });
  }
});

/**
 * @swagger
 * /api/monitoring/alerts/{alertId}/resolve:
 *   post:
 *     summary: Resolve an alert
 *     tags: [Monitoring]
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID to resolve
 *     responses:
 *       200:
 *         description: Alert resolved successfully
 */
router.post('/alerts/:alertId/resolve', (req, res) => {
  const loggingService: LoggingService = (req as any).loggingService;
  
  try {
    const { alertId } = req.params;
    
    monitoringService.resolveAlert(alertId);

    loggingService.logAuditEvent('alert_resolved', 'alert', undefined, {
      alertId,
    });

    res.json({
      success: true,
      message: 'Alert resolved successfully',
    });

  } catch (error) {
    loggingService.logError(error as Error, 'alert resolution');
    
    res.status(500).json({
      success: false,
      error: 'Failed to resolve alert',
    });
  }
});

/**
 * @swagger
 * /api/monitoring/logs/stream:
 *   get:
 *     summary: Get log stream with filters
 *     tags: [Monitoring]
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info, debug]
 *         description: Log level filter
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *         description: Service name filter
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID filter
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of logs to return
 *     responses:
 *       200:
 *         description: Log stream retrieved successfully
 */
router.get('/logs/stream', async (req, res) => {
  const loggingService: LoggingService = (req as any).loggingService;
  
  try {
    const { level, service, userId, limit } = req.query;
    
    const filters: {
      level?: string;
      service?: string;
      userId?: string;
      limit?: number;
    } = {};
    
    if (level) filters.level = level as string;
    if (service) filters.service = service as string;
    if (userId) filters.userId = userId as string;
    if (limit) filters.limit = parseInt(limit as string);

    const logs = await dashboardService.getLogStream(filters);

    loggingService.info('Log stream requested', {
      filters,
      resultCount: logs.length,
    });

    res.json({
      success: true,
      data: logs,
    });

  } catch (error) {
    loggingService.logError(error as Error, 'log stream retrieval');
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve log stream',
    });
  }
});

/**
 * @swagger
 * /api/monitoring/logs/export:
 *   get:
 *     summary: Export logs for a time range
 *     tags: [Monitoring]
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start time for export
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End time for export
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         description: Export format
 *     responses:
 *       200:
 *         description: Logs exported successfully
 */
router.get('/logs/export', async (req, res) => {
  const loggingService: LoggingService = (req as any).loggingService;
  
  try {
    const { start, end, format = 'json' } = req.query;
    
    if (!start || !end) {
      res.status(400).json({
        success: false,
        error: 'Start and end dates are required',
      });
      return;
    }

    const timeRange = {
      start: new Date(start as string),
      end: new Date(end as string),
    };

    const exportData = await dashboardService.exportLogs(timeRange, format as 'json' | 'csv');

    loggingService.logAuditEvent('logs_exported', 'logs', undefined, {
      timeRange,
      format,
      dataSize: exportData.length,
    });

    const contentType = format === 'csv' ? 'text/csv' : 'application/json';
    const filename = `logs-${start}-${end}.${format}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);

  } catch (error) {
    loggingService.logError(error as Error, 'log export');
    
    res.status(500).json({
      success: false,
      error: 'Failed to export logs',
    });
  }
});

/**
 * @swagger
 * /api/monitoring/health:
 *   get:
 *     summary: Get monitoring system health
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Monitoring health retrieved successfully
 */
router.get('/health', (req, res) => {
  const loggingService: LoggingService = (req as any).loggingService;
  
  try {
    const health = monitoringService.getHealthStatus();

    loggingService.logHealthCheck('monitoring-system', health.status as any, {
      alertsCount: health.alerts.total,
      uptime: health.uptime,
    });

    res.json({
      success: true,
      data: health,
    });

  } catch (error) {
    loggingService.logError(error as Error, 'monitoring health check');
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve monitoring health',
    });
  }
});

/**
 * @swagger
 * /api/monitoring/cache/clear:
 *   post:
 *     summary: Clear monitoring cache
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 */
router.post('/cache/clear', (req, res) => {
  const loggingService: LoggingService = (req as any).loggingService;
  
  try {
    dashboardService.clearCache();

    loggingService.logAuditEvent('cache_cleared', 'monitoring-cache', undefined, {
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Monitoring cache cleared successfully',
    });

  } catch (error) {
    loggingService.logError(error as Error, 'cache clearing');
    
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
    });
  }
});

export default router;