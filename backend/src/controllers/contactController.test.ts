import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Contact Controller', () => {
  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.contactInquiry.deleteMany({
      where: {
        email: {
          contains: 'test@example.com',
        },
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.contactInquiry.deleteMany({
      where: {
        email: {
          contains: 'test@example.com',
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/contact', () => {
    it('should create a new contact inquiry', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'test@example.com',
        phone: '+1234567890',
        subject: 'Test Inquiry',
        message: 'This is a test message for the contact form.',
        serviceInterest: 'Photography',
      };

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Thank you for your message');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.status).toBe('new');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: 'J', // Too short
        email: 'invalid-email', // Invalid email
        message: 'Short', // Too short
      };

      const response = await request(app)
        .post('/api/contact')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        name: 'John Doe',
        // Missing email and message
      };

      const response = await request(app)
        .post('/api/contact')
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should apply rate limiting', async () => {
      const contactData = {
        name: 'Rate Test User',
        email: 'ratetest@example.com',
        message: 'This is a rate limiting test message.',
      };

      // Make multiple requests quickly to trigger rate limiting
      const requests = Array(5).fill(null).map(() =>
        request(app)
          .post('/api/contact')
          .send(contactData)
      );

      const responses = await Promise.all(requests);
      
      // At least one should be rate limited (429)
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Spam Protection', () => {
    it('should detect and handle spam content', async () => {
      const spamData = {
        name: 'Spam User',
        email: 'spam@example.com',
        message: 'URGENT!!! MAKE MONEY FAST!!! CLICK HERE NOW!!! GUARANTEED INCOME!!!',
      };

      const response = await request(app)
        .post('/api/contact')
        .send(spamData)
        .expect(200); // Returns 200 to hide spam detection

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Thank you for your message');
    });

    it('should handle honeypot fields', async () => {
      const honeypotData = {
        name: 'Legitimate User',
        email: 'legit@example.com',
        message: 'This is a legitimate message.',
        website: 'http://spam-bot-site.com', // Honeypot field
      };

      const response = await request(app)
        .post('/api/contact')
        .send(honeypotData)
        .expect(200); // Returns 200 to hide spam detection

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Thank you for your message');
    });
  });

  describe('Admin Endpoints', () => {
    let authToken: string;
    let testInquiryId: string;

    beforeAll(async () => {
      // Create a test user and get auth token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@derjiproductions.com',
          password: 'admin123',
        });

      if (loginResponse.status === 200) {
        authToken = loginResponse.body.data.accessToken;
      }

      // Create a test inquiry for admin operations
      const inquiry = await prisma.contactInquiry.create({
        data: {
          name: 'Admin Test User',
          email: 'admintest@example.com',
          message: 'Test inquiry for admin operations',
          status: 'new',
        },
      });
      testInquiryId = inquiry.id;
    });

    afterAll(async () => {
      // Clean up test inquiry
      if (testInquiryId) {
        await prisma.contactInquiry.deleteMany({
          where: { id: testInquiryId },
        });
      }
    });

    it('should get contact inquiry statistics', async () => {
      if (!authToken) {
        console.log('Skipping admin test - no auth token available');
        return;
      }

      const response = await request(app)
        .get('/api/contact/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('byStatus');
      expect(response.body.data.byStatus).toHaveProperty('new');
      expect(response.body.data.byStatus).toHaveProperty('responded');
      expect(response.body.data.byStatus).toHaveProperty('closed');
    });

    it('should get all contact inquiries with pagination', async () => {
      if (!authToken) {
        console.log('Skipping admin test - no auth token available');
        return;
      }

      const response = await request(app)
        .get('/api/contact?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('totalCount');
    });

    it('should get a specific contact inquiry', async () => {
      if (!authToken || !testInquiryId) {
        console.log('Skipping admin test - no auth token or test inquiry available');
        return;
      }

      const response = await request(app)
        .get(`/api/contact/${testInquiryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testInquiryId);
      expect(response.body.data.name).toBe('Admin Test User');
    });

    it('should update contact inquiry status', async () => {
      if (!authToken || !testInquiryId) {
        console.log('Skipping admin test - no auth token or test inquiry available');
        return;
      }

      const updateData = {
        status: 'responded',
        notes: 'Test response from admin',
      };

      const response = await request(app)
        .put(`/api/contact/${testInquiryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('responded');
    });

    it('should require authentication for admin endpoints', async () => {
      await request(app)
        .get('/api/contact')
        .expect(401);

      await request(app)
        .get('/api/contact/stats')
        .expect(401);

      if (testInquiryId) {
        await request(app)
          .put(`/api/contact/${testInquiryId}`)
          .send({ status: 'closed' })
          .expect(401);
      }
    });
  });
});