import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Service Category Controller', () => {
  let authToken: string;
  let testCategoryId: string;
  let testCategory2Id: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.service.deleteMany({
      where: { name: { contains: 'Test' } }
    });
    await prisma.serviceCategory.deleteMany({
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
    await prisma.serviceCategory.deleteMany({
      where: { name: { contains: 'Test' } }
    });
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' }
    });
    await prisma.$disconnect();
  });

  describe('GET /api/service-categories', () => {
    it('should get all service categories', async () => {
      const response = await request(app)
        .get('/api/service-categories')
        .expect(200);

      expect(response.body.message).toBe('Service categories retrieved successfully');
      expect(response.body.data).toHaveProperty('categories');
      expect(Array.isArray(response.body.data.categories)).toBe(true);
    });

    it('should filter categories by active status', async () => {
      const response = await request(app)
        .get('/api/service-categories?active=true')
        .expect(200);

      expect(response.body.data.categories).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ active: true })
        ])
      );
    });

    it('should include services when requested', async () => {
      const response = await request(app)
        .get('/api/service-categories?includeServices=true')
        .expect(200);

      expect(response.body.data.categories[0]).toHaveProperty('services');
    });
  });

  describe('POST /api/service-categories', () => {
    it('should create a new service category with authentication', async () => {
      const categoryData = {
        name: 'Test Photography',
        slug: 'test-photography',
        description: 'Test photography category',
        icon: 'camera',
        active: true,
        sortOrder: 1,
      };

      const response = await request(app)
        .post('/api/service-categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryData)
        .expect(201);

      expect(response.body.message).toBe('Service category created successfully');
      expect(response.body.data.category).toMatchObject({
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        icon: categoryData.icon,
        active: categoryData.active,
        sortOrder: categoryData.sortOrder,
      });

      testCategoryId = response.body.data.category.id;
    });

    it('should create category with minimal required fields', async () => {
      const categoryData = {
        name: 'Test Videography',
        slug: 'test-videography',
      };

      const response = await request(app)
        .post('/api/service-categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryData)
        .expect(201);

      expect(response.body.data.category).toMatchObject({
        name: categoryData.name,
        slug: categoryData.slug,
        active: true,
        sortOrder: 0,
      });

      testCategory2Id = response.body.data.category.id;
    });

    it('should return 401 without authentication', async () => {
      const categoryData = {
        name: 'Unauthorized Category',
        slug: 'unauthorized',
      };

      await request(app)
        .post('/api/service-categories')
        .send(categoryData)
        .expect(401);
    });

    it('should return 409 for duplicate category name', async () => {
      const categoryData = {
        name: 'Test Photography',
        slug: 'test-photography-duplicate',
      };

      await request(app)
        .post('/api/service-categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryData)
        .expect(409);
    });

    it('should return 409 for duplicate category slug', async () => {
      const categoryData = {
        name: 'Test Photography Duplicate',
        slug: 'test-photography',
      };

      await request(app)
        .post('/api/service-categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryData)
        .expect(409);
    });

    it('should return 400 for invalid slug format', async () => {
      const categoryData = {
        name: 'Invalid Slug Category',
        slug: 'Invalid Slug!',
      };

      await request(app)
        .post('/api/service-categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryData)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const categoryData = {
        name: 'Missing Slug Category',
      };

      await request(app)
        .post('/api/service-categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryData)
        .expect(400);
    });
  });

  describe('GET /api/service-categories/:identifier', () => {
    it('should get category by ID', async () => {
      const response = await request(app)
        .get(`/api/service-categories/${testCategoryId}`)
        .expect(200);

      expect(response.body.message).toBe('Service category retrieved successfully');
      expect(response.body.data.category.id).toBe(testCategoryId);
      expect(response.body.data.category.name).toBe('Test Photography');
    });

    it('should get category by slug', async () => {
      const response = await request(app)
        .get('/api/service-categories/test-photography')
        .expect(200);

      expect(response.body.message).toBe('Service category retrieved successfully');
      expect(response.body.data.category.slug).toBe('test-photography');
      expect(response.body.data.category.name).toBe('Test Photography');
    });

    it('should include services when requested', async () => {
      const response = await request(app)
        .get(`/api/service-categories/${testCategoryId}?includeServices=true`)
        .expect(200);

      expect(response.body.data.category).toHaveProperty('services');
      expect(Array.isArray(response.body.data.category.services)).toBe(true);
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .get('/api/service-categories/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Category not found');
    });
  });

  describe('PUT /api/service-categories/:id', () => {
    it('should update service category with authentication', async () => {
      const updateData = {
        description: 'Updated test photography category',
        icon: 'photo',
        sortOrder: 5,
      };

      const response = await request(app)
        .put(`/api/service-categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Service category updated successfully');
      expect(response.body.data.category.description).toBe(updateData.description);
      expect(response.body.data.category.icon).toBe(updateData.icon);
      expect(response.body.data.category.sortOrder).toBe(updateData.sortOrder);
    });

    it('should update category name and slug', async () => {
      const updateData = {
        name: 'Test Photography Updated',
        slug: 'test-photography-updated',
      };

      const response = await request(app)
        .put(`/api/service-categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.category.name).toBe(updateData.name);
      expect(response.body.data.category.slug).toBe(updateData.slug);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .put(`/api/service-categories/${testCategoryId}`)
        .send({ description: 'Unauthorized update' })
        .expect(401);
    });

    it('should return 404 for non-existent category', async () => {
      await request(app)
        .put('/api/service-categories/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Update non-existent' })
        .expect(404);
    });

    it('should return 409 for conflicting name', async () => {
      const updateData = {
        name: 'Test Videography', // This name already exists
      };

      await request(app)
        .put(`/api/service-categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(409);
    });

    it('should return 409 for conflicting slug', async () => {
      const updateData = {
        slug: 'test-videography', // This slug already exists
      };

      await request(app)
        .put(`/api/service-categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(409);
    });

    it('should return 400 for invalid slug format', async () => {
      const updateData = {
        slug: 'Invalid Slug!',
      };

      await request(app)
        .put(`/api/service-categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe('POST /api/service-categories/reorder', () => {
    it('should reorder categories with authentication', async () => {
      const reorderData = {
        categoryOrders: [
          { id: testCategoryId, sortOrder: 10 },
          { id: testCategory2Id, sortOrder: 5 },
        ],
      };

      const response = await request(app)
        .post('/api/service-categories/reorder')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reorderData)
        .expect(200);

      expect(response.body.message).toBe('Service categories reordered successfully');

      // Verify the reordering worked
      const category1 = await prisma.serviceCategory.findUnique({
        where: { id: testCategoryId },
      });
      const category2 = await prisma.serviceCategory.findUnique({
        where: { id: testCategory2Id },
      });

      expect(category1?.sortOrder).toBe(10);
      expect(category2?.sortOrder).toBe(5);
    });

    it('should return 401 without authentication', async () => {
      const reorderData = {
        categoryOrders: [
          { id: testCategoryId, sortOrder: 1 },
        ],
      };

      await request(app)
        .post('/api/service-categories/reorder')
        .send(reorderData)
        .expect(401);
    });

    it('should return 400 for invalid reorder data', async () => {
      const reorderData = {
        categoryOrders: 'invalid',
      };

      await request(app)
        .post('/api/service-categories/reorder')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reorderData)
        .expect(400);
    });

    it('should return 400 for missing categoryOrders', async () => {
      await request(app)
        .post('/api/service-categories/reorder')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('DELETE /api/service-categories/:id', () => {
    it('should return 409 when trying to delete category with services', async () => {
      // First create a service in the category
      const serviceData = {
        name: 'Test Service in Category',
        categoryId: testCategoryId,
        description: 'A test service',
        basePrice: 100,
        priceType: 'fixed',
        active: true,
      };

      await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceData);

      // Try to delete the category
      const response = await request(app)
        .delete(`/api/service-categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);

      expect(response.body.error).toBe('Category has services');
    });

    it('should delete empty category with authentication', async () => {
      const response = await request(app)
        .delete(`/api/service-categories/${testCategory2Id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Service category deleted successfully');

      // Verify category is deleted
      await request(app)
        .get(`/api/service-categories/${testCategory2Id}`)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .delete(`/api/service-categories/${testCategoryId}`)
        .expect(401);
    });

    it('should return 404 for non-existent category', async () => {
      await request(app)
        .delete('/api/service-categories/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});