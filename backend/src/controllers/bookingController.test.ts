import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('BookingController', () => {
  beforeAll(async () => {
    // Ensure database connection
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up and disconnect
    await prisma.$disconnect();
  });

  describe('GET /api/bookings/availability', () => {
    it('should return availability for a valid date', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString();

      const response = await request(app)
        .get('/api/bookings/availability')
        .query({ date: dateString })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('availableSlots');
      expect(response.body.data).toHaveProperty('bookedSlots');
      expect(response.body.data).toHaveProperty('summary');
      expect(Array.isArray(response.body.data.availableSlots)).toBe(true);
      expect(Array.isArray(response.body.data.bookedSlots)).toBe(true);
    });

    it('should return error for past date', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateString = yesterday.toISOString();

      const response = await request(app)
        .get('/api/bookings/availability')
        .query({ date: dateString })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('past dates');
    });

    it('should return error when date is missing', async () => {
      const response = await request(app)
        .get('/api/bookings/availability')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message || response.body.message || 'Validation Error').toContain('Validation');
    });
  });

  describe('POST /api/bookings', () => {
    it('should create a booking with valid data', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const bookingDate = new Date(tomorrow);
      bookingDate.setHours(0, 0, 0, 0);
      
      const startTime = new Date(tomorrow);
      startTime.setHours(10, 0, 0, 0);
      
      const endTime = new Date(tomorrow);
      endTime.setHours(11, 0, 0, 0);

      const bookingData = {
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        clientPhone: '+1234567890',
        bookingDate: bookingDate.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        projectDetails: 'Test project details',
        budgetRange: '$1000-$2000',
        location: 'Test Location',
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('booking');
      expect(response.body.data.booking.clientName).toBe(bookingData.clientName);
      expect(response.body.data.booking.clientEmail).toBe(bookingData.clientEmail);
      expect(response.body.data.booking.status).toBe('pending');

      // Clean up - delete the created booking
      if (response.body.data.booking.id) {
        await prisma.booking.delete({
          where: { id: response.body.data.booking.id },
        });
      }
    });

    it('should return error for invalid email', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const bookingData = {
        clientName: 'Test Client',
        clientEmail: 'invalid-email',
        bookingDate: tomorrow.toISOString(),
        startTime: tomorrow.toISOString(),
        endTime: tomorrow.toISOString(),
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message || response.body.message).toContain('Validation');
    });

    it('should return error for end time before start time', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const bookingDate = new Date(tomorrow);
      bookingDate.setHours(0, 0, 0, 0);
      
      const startTime = new Date(tomorrow);
      startTime.setHours(11, 0, 0, 0);
      
      const endTime = new Date(tomorrow);
      endTime.setHours(10, 0, 0, 0); // End before start

      const bookingData = {
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        bookingDate: bookingDate.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message || response.body.message).toContain('Validation');
    });

    it('should return error for booking in the past', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const bookingDate = new Date(yesterday);
      bookingDate.setHours(0, 0, 0, 0);
      
      const startTime = new Date(yesterday);
      startTime.setHours(10, 0, 0, 0);
      
      const endTime = new Date(yesterday);
      endTime.setHours(11, 0, 0, 0);

      const bookingData = {
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        bookingDate: bookingDate.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('past dates');
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should return 404 for non-existent booking', async () => {
      const response = await request(app)
        .get('/api/bookings/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('not exist');
    });
  });
});