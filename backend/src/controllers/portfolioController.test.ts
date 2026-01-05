import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../index';
import { authService } from '../services/authService';

const prisma = new PrismaClient();

describe('Portfolio Controller', () => {
  let authToken: string;
  let testPortfolioItemId: string;
  let testMediaId: string;

  beforeAll(async () => {
    // Create test user and get auth token
    await prisma.user.create({
      data: {
        email: 'portfolio-test@example.com',
        passwordHash: await authService.hashPassword('testpassword'),
        role: 'admin',
        firstName: 'Portfolio',
        lastName: 'Test',
      },
    });

    const authResult = await authService.login('portfolio-test@example.com', 'testpassword');
    authToken = authResult.accessToken;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.portfolioMedia.deleteMany({
      where: { portfolioItem: { title: { contains: 'Test Portfolio' } } },
    });
    await prisma.portfolioItem.deleteMany({
      where: { title: { contains: 'Test Portfolio' } },
    });
    await prisma.user.deleteMany({
      where: { email: 'portfolio-test@example.com' },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/portfolio', () => {
    it('should create a new portfolio item with authentication', async () => {
      const portfolioData = {
        title: 'Test Portfolio Item',
        description: 'A test portfolio item for testing',
        category: 'photography',
        clientName: 'Test Client',
        featured: false,
        tags: ['test', 'portfolio'],
      };

      const response = await request(app)
        .post('/api/portfolio')
        .set('Authorization', `Bearer ${authToken}`)
        .send(portfolioData)
        .expect(201);

      expect(response.body.message).toBe('Portfolio item created successfully');
      expect(response.body.data.portfolioItem.title).toBe(portfolioData.title);
      expect(response.body.data.portfolioItem.category).toBe(portfolioData.category);
      expect(response.body.data.portfolioItem.clientName).toBe(portfolioData.clientName);

      testPortfolioItemId = response.body.data.portfolioItem.id;
    });

    it('should return 401 without authentication', async () => {
      const portfolioData = {
        title: 'Unauthorized Test',
        category: 'photography',
      };

      await request(app)
        .post('/api/portfolio')
        .send(portfolioData)
        .expect(401);
    });

    it('should return 409 for duplicate title in same category', async () => {
      const portfolioData = {
        title: 'Test Portfolio Item', // Same title as created above
        category: 'photography', // Same category
      };

      const response = await request(app)
        .post('/api/portfolio')
        .set('Authorization', `Bearer ${authToken}`)
        .send(portfolioData)
        .expect(409);

      expect(response.body.error).toBe('Portfolio item already exists');
    });
  });

  describe('GET /api/portfolio', () => {
    it('should get all portfolio items', async () => {
      const response = await request(app)
        .get('/api/portfolio')
        .expect(200);

      expect(response.body.message).toBe('Portfolio items retrieved successfully');
      expect(response.body.data.items).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter portfolio items by category', async () => {
      const response = await request(app)
        .get('/api/portfolio?category=photography')
        .expect(200);

      expect(response.body.data.items).toBeInstanceOf(Array);
      // All items should be photography category
      response.body.data.items.forEach((item: any) => {
        expect(item.category).toBe('photography');
      });
    });
  });

  describe('GET /api/portfolio/:id', () => {
    it('should get portfolio item by ID', async () => {
      const response = await request(app)
        .get(`/api/portfolio/${testPortfolioItemId}`)
        .expect(200);

      expect(response.body.message).toBe('Portfolio item retrieved successfully');
      expect(response.body.data.portfolioItem.id).toBe(testPortfolioItemId);
      expect(response.body.data.portfolioItem.title).toBe('Test Portfolio Item');
    });

    it('should return 404 for non-existent portfolio item', async () => {
      await request(app)
        .get('/api/portfolio/non-existent-id')
        .expect(404);
    });
  });

  describe('PUT /api/portfolio/:id', () => {
    it('should update portfolio item with authentication', async () => {
      const updateData = {
        title: 'Updated Test Portfolio Item',
        description: 'Updated description',
        featured: true,
      };

      const response = await request(app)
        .put(`/api/portfolio/${testPortfolioItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Portfolio item updated successfully');
      expect(response.body.data.portfolioItem.title).toBe(updateData.title);
      expect(response.body.data.portfolioItem.description).toBe(updateData.description);
      expect(response.body.data.portfolioItem.featured).toBe(updateData.featured);
    });

    it('should return 401 without authentication', async () => {
      const updateData = { title: 'Unauthorized Update' };

      await request(app)
        .put(`/api/portfolio/${testPortfolioItemId}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('POST /api/portfolio/media', () => {
    it('should create portfolio media with authentication', async () => {
      const mediaData = {
        portfolioItemId: testPortfolioItemId,
        mediaType: 'image',
        fileUrl: 'https://example.com/test-image.jpg',
        thumbnailUrl: 'https://example.com/test-thumb.jpg',
        fileSize: 1024000,
        width: 1920,
        height: 1080,
        altText: 'Test image',
        sortOrder: 0,
      };

      const response = await request(app)
        .post('/api/portfolio/media')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mediaData)
        .expect(201);

      expect(response.body.message).toBe('Portfolio media created successfully');
      expect(response.body.data.media.mediaType).toBe(mediaData.mediaType);
      expect(response.body.data.media.fileUrl).toBe(mediaData.fileUrl);

      testMediaId = response.body.data.media.id;
    });

    it('should return 404 for non-existent portfolio item', async () => {
      const mediaData = {
        portfolioItemId: 'non-existent-id',
        mediaType: 'image',
        fileUrl: 'https://example.com/test-image.jpg',
      };

      await request(app)
        .post('/api/portfolio/media')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mediaData)
        .expect(404);
    });
  });

  describe('GET /api/portfolio/:portfolioItemId/media', () => {
    it('should get media for portfolio item', async () => {
      const response = await request(app)
        .get(`/api/portfolio/${testPortfolioItemId}/media`)
        .expect(200);

      expect(response.body.message).toBe('Portfolio media retrieved successfully');
      expect(response.body.data.media).toBeInstanceOf(Array);
      expect(response.body.data.media.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/portfolio/featured', () => {
    it('should get featured portfolio items', async () => {
      const response = await request(app)
        .get('/api/portfolio/featured')
        .expect(200);

      expect(response.body.message).toBe('Featured portfolio items retrieved successfully');
      expect(response.body.data.portfolioItems).toBeInstanceOf(Array);
      // All items should be featured
      response.body.data.portfolioItems.forEach((item: any) => {
        expect(item.featured).toBe(true);
      });
    });
  });

  describe('GET /api/portfolio/category/:category', () => {
    it('should get portfolio items by category', async () => {
      const response = await request(app)
        .get('/api/portfolio/category/photography')
        .expect(200);

      expect(response.body.message).toBe('photography portfolio items retrieved successfully');
      expect(response.body.data.items).toBeInstanceOf(Array);
    });

    it('should return 400 for invalid category', async () => {
      await request(app)
        .get('/api/portfolio/category/invalid-category')
        .expect(400);
    });
  });

  describe('DELETE /api/portfolio/media/:id', () => {
    it('should delete portfolio media with authentication', async () => {
      const response = await request(app)
        .delete(`/api/portfolio/media/${testMediaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Portfolio media deleted successfully');
    });
  });

  describe('DELETE /api/portfolio/:id', () => {
    it('should delete portfolio item with authentication', async () => {
      const response = await request(app)
        .delete(`/api/portfolio/${testPortfolioItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Portfolio item deleted successfully');
    });

    it('should return 404 for non-existent portfolio item', async () => {
      await request(app)
        .delete('/api/portfolio/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});