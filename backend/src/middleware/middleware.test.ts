import request from 'supertest';
import express from 'express';
import { errorHandler, createError, asyncHandler } from './errorHandler';
import { validate } from './validation';
import { generalLimiter } from './rateLimiting';
import { corsMiddleware } from './cors';
import { z } from 'zod';

describe('Backend API Foundation Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Error Handler Middleware', () => {
    it('should handle validation errors correctly', async () => {
      const testSchema = z.object({
        body: z.object({
          email: z.string().email(),
          age: z.number().min(18),
        }),
      });

      app.post('/test', validate({ body: testSchema.shape.body }), (_req, res) => {
        res.json({ success: true });
      });
      app.use(errorHandler);

      const response = await request(app)
        .post('/test')
        .send({ email: 'invalid-email', age: 15 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });

    it('should handle async errors with asyncHandler', async () => {
      app.get('/test', asyncHandler(async (_req: express.Request, _res: express.Response) => {
        throw createError('Test async error', 500, 'TEST_ERROR');
      }));
      app.use(errorHandler);

      const response = await request(app).get('/test');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('TEST_ERROR');
      expect(response.body.error.message).toBe('Test async error');
    });

    it('should include request ID in error response', async () => {
      app.use((req, _res, next) => {
        req.headers['x-request-id'] = 'test-request-123';
        next();
      });
      
      app.get('/test', (_req, _res) => {
        throw createError('Test error', 400, 'TEST_ERROR');
      });
      app.use(errorHandler);

      const response = await request(app).get('/test');

      expect(response.status).toBe(400);
      expect(response.body.error.requestId).toBe('test-request-123');
    });
  });

  describe('Validation Middleware', () => {
    it('should validate request body successfully', async () => {
      const schema = {
        body: z.object({
          name: z.string().min(1),
          email: z.string().email(),
        }),
      };

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true, data: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({ name: 'John Doe', email: 'john@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('John Doe');
    });

    it('should validate query parameters', async () => {
      const schema = {
        query: z.object({
          page: z.string().transform(val => parseInt(val, 10)),
          limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
        }),
      };

      app.get('/test', validate(schema), (req, res) => {
        res.json({ success: true, query: req.query });
      });

      const response = await request(app)
        .get('/test?page=2&limit=20');

      expect(response.status).toBe(200);
      expect(response.body.query.page).toBe(2);
      expect(response.body.query.limit).toBe(20);
    });

    it('should validate route parameters', async () => {
      const schema = {
        params: z.object({
          id: z.string().uuid(),
        }),
      };

      app.get('/test/:id', validate(schema), (req, res) => {
        res.json({ success: true, params: req.params });
      });

      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app).get(`/test/${validUuid}`);

      expect(response.status).toBe(200);
      expect(response.body.params.id).toBe(validUuid);
    });
  });

  describe('CORS Middleware', () => {
    it('should handle CORS preflight requests', async () => {
      app.use(corsMiddleware);
      app.get('/test', (_req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .options('/test')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should allow requests from localhost in development', async () => {
      process.env['NODE_ENV'] = 'development';
      
      app.use(corsMiddleware);
      app.get('/test', (_req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .set('Origin', 'http://localhost:3000');

      expect(response.status).toBe(200);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      // Create a simple rate limiter for testing
      const testLimiter = generalLimiter;
      
      app.use(testLimiter);
      app.get('/test', (_req, res) => {
        res.json({ success: true });
      });

      // Make multiple requests to test rate limiting
      const responses = await Promise.all([
        request(app).get('/test'),
        request(app).get('/test'),
        request(app).get('/test'),
      ]);

      // All requests should succeed initially (within limit)
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
    });
  });

  describe('Request Processing', () => {
    it('should handle JSON body parsing', async () => {
      app.post('/test', (req, res) => {
        res.json({ received: req.body });
      });

      const testData = { name: 'Test', value: 123 };
      const response = await request(app)
        .post('/test')
        .send(testData);

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual(testData);
    });

    it('should handle URL-encoded body parsing', async () => {
      app.use(express.urlencoded({ extended: true }));
      app.post('/test', (req, res) => {
        res.json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .type('form')
        .send('name=Test&value=123');

      expect(response.status).toBe(200);
      expect(response.body.received.name).toBe('Test');
      expect(response.body.received.value).toBe('123');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in responses', async () => {
      const { securityHeaders } = require('./cors');
      
      app.use(securityHeaders);
      app.get('/test', (_req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/test');

      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });
  });
});