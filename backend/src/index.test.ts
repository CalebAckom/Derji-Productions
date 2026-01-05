import request from 'supertest';
import app from './index';

describe('API Endpoints', () => {
  it('should respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.uptime).toBeDefined();
  });

  it('should respond to API root', async () => {
    const response = await request(app)
      .get('/api')
      .expect(200);
    
    expect(response.body.message).toBe('Derji Productions API');
    expect(response.body.version).toBe('1.0.0');
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/unknown-route')
      .expect(404);
    
    expect(response.body.error.code).toBe('NOT_FOUND');
    expect(response.body.error.status).toBe(404);
    expect(response.body.error.message).toContain('Resource not found');
  });
});