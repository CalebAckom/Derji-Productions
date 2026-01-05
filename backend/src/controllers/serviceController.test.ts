import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Service Controller', () => {
  let authToken: string;
  let testServiceId: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.service.deleteMany({
      where: { name: { contains: 'Test' } }
    });
    
    // Create test admin user
    const hashedPassword = await bcrypt.hash('testpassword', 12);
    await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        passwordHash: hashedPassword,
        role: 'admin',
        firstName: 'Test',
        lastName: 'User',
      },
    });

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword',
      });

    authToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.service.deleteMany({
      where: { name: { contains: 'Test' } }
    });
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' }
    });
    await prisma.$disconnect();
  });

  describe('GET /api/services', () => {
    it('should get all services with pagination', async () => {
      const response = await request(app)
        .get('/api/services')
        .expect(200);

      expect(response.body.message).toBe('Services retrieved successfully');
      expect(response.body.data).toHaveProperty('services');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.services)).toBe(true);
      expect(response.body.data.pagination).toHaveProperty('currentPage');
      expect(response.body.data.pagination).toHaveProperty('totalCount');
    });

    it('should filter services by category', async () => {
      const response = await request(app)
        .get('/api/services?categorySlug=photography')
        .expect(200);

      expect(response.body.data.services).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ 
            category: expect.objectContaining({ slug: 'photography' })
          })
        ])
      );
    });

    it('should search services by name', async () => {
      const response = await request(app)
        .get('/api/services?search=wedding')
        .expect(200);

      expect(response.body.data.services.length).toBeGreaterThan(0);
      expect(response.body.data.services[0].name.toLowerCase()).toContain('wedding');
    });
  });

  describe('GET /api/services/categories', () => {
    it('should get service categories with counts', async () => {
      const response = await request(app)
        .get('/api/services/categories')
        .expect(200);

      expect(response.body.message).toBe('Service categories retrieved successfully');
      expect(response.body.data).toHaveProperty('categories');
      expect(Array.isArray(response.body.data.categories)).toBe(true);
      
      const categories = response.body.data.categories;
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0]).toHaveProperty('id');
      expect(categories[0]).toHaveProperty('name');
      expect(categories[0]).toHaveProperty('slug');
      expect(categories[0]).toHaveProperty('count');
      expect(categories[0]).toHaveProperty('subcategories');
    });
  });

  describe('GET /api/services/category/:category', () => {
    it('should get services by category', async () => {
      const response = await request(app)
        .get('/api/services/category/photography')
        .expect(200);

      expect(response.body.message).toBe('Photography services retrieved successfully');
      expect(Array.isArray(response.body.data.services)).toBe(true);
      response.body.data.services.forEach((service: any) => {
        expect(service.category.slug).toBe('photography');
      });
    });

    it('should return 404 for invalid category', async () => {
      const response = await request(app)
        .get('/api/services/category/invalid')
        .expect(404);

      expect(response.body.error).toBe('Category not found');
    });
  });

  describe('POST /api/services', () => {
    it('should create a new service with authentication', async () => {
      const serviceData = {
        name: 'Test Photography Service',
        categoryId: 'cat_photography',
        subcategory: 'Test',
        description: 'A test photography service',
        basePrice: 250,
        priceType: 'fixed',
        duration: 120,
        features: { feature1: 'Test feature 1', feature2: 'Test feature 2' },
        active: true,
      };

      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceData)
        .expect(201);

      expect(response.body.message).toBe('Service created successfully');
      expect(response.body.data.service).toMatchObject({
        name: serviceData.name,
        categoryId: serviceData.categoryId,
        subcategory: serviceData.subcategory,
        description: serviceData.description,
        priceType: serviceData.priceType,
        active: serviceData.active,
      });

      testServiceId = response.body.data.service.id;
    });

    it('should return 401 without authentication', async () => {
      const serviceData = {
        name: 'Unauthorized Service',
        category: 'photography',
      };

      await request(app)
        .post('/api/services')
        .send(serviceData)
        .expect(401);
    });

    it('should return 409 for duplicate service', async () => {
      const serviceData = {
        name: 'Test Photography Service',
        categoryId: 'cat_photography',
      };

      await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceData)
        .expect(409);
    });
  });

  describe('GET /api/services/:id', () => {
    it('should get service by ID', async () => {
      const response = await request(app)
        .get(`/api/services/${testServiceId}`)
        .expect(200);

      expect(response.body.message).toBe('Service retrieved successfully');
      expect(response.body.data.service.id).toBe(testServiceId);
      expect(response.body.data.service.name).toBe('Test Photography Service');
    });

    it('should return 404 for non-existent service', async () => {
      const response = await request(app)
        .get('/api/services/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Service not found');
    });
  });

  describe('PUT /api/services/:id', () => {
    it('should update service with authentication', async () => {
      const updateData = {
        description: 'Updated test service description',
        basePrice: 300,
      };

      const response = await request(app)
        .put(`/api/services/${testServiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Service updated successfully');
      expect(response.body.data.service.description).toBe(updateData.description);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .put(`/api/services/${testServiceId}`)
        .send({ description: 'Unauthorized update' })
        .expect(401);
    });

    it('should return 404 for non-existent service', async () => {
      await request(app)
        .put('/api/services/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Update non-existent' })
        .expect(404);
    });
  });

  describe('GET /api/services/:id/availability', () => {
    it('should get service availability', async () => {
      const response = await request(app)
        .get(`/api/services/${testServiceId}/availability`)
        .expect(200);

      expect(response.body.message).toBe('Service availability retrieved successfully');
      expect(response.body.data.availability).toHaveProperty('serviceId');
      expect(response.body.data.availability).toHaveProperty('available');
      expect(response.body.data.availability).toHaveProperty('bookedSlots');
      expect(response.body.data.availability.serviceId).toBe(testServiceId);
    });
  });

  describe('DELETE /api/services/:id', () => {
    it('should delete service with authentication', async () => {
      const response = await request(app)
        .delete(`/api/services/${testServiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Service deleted successfully');

      // Verify service is deleted
      await request(app)
        .get(`/api/services/${testServiceId}`)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .delete(`/api/services/${testServiceId}`)
        .expect(401);
    });

    it('should return 404 for non-existent service', async () => {
      await request(app)
        .delete('/api/services/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});