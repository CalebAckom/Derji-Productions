# Database Setup and Management

This document describes the database setup, schema, and management procedures for the Derji Productions website backend.

## Database Schema Overview

The application uses PostgreSQL with Prisma ORM for database management. The schema includes the following main entities:

### Core Tables

1. **users** - Admin users for content management
2. **services** - Photography, videography, and sound services
3. **portfolio_items** - Portfolio projects and showcases
4. **portfolio_media** - Media files associated with portfolio items
5. **bookings** - Client booking requests and appointments
6. **contact_inquiries** - Contact form submissions and inquiries

### Relationships

- Portfolio items have many media files (one-to-many)
- Bookings reference services (many-to-one, optional)
- All tables include audit fields (created_at, updated_at)

## Setup Instructions

### Prerequisites

- PostgreSQL 12+ running locally or remotely
- Node.js 18+ with npm
- Environment variables configured in `.env`

### Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database connection details
   ```

3. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

4. **Run initial migration:**
   ```bash
   npm run db:migrate
   ```

5. **Seed the database with sample data:**
   ```bash
   npm run db:seed
   ```

6. **Test the database connection:**
   ```bash
   npm run db:test
   ```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run db:generate` | Generate Prisma client from schema |
| `npm run db:migrate` | Run development migrations |
| `npm run db:migrate:deploy` | Deploy migrations to production |
| `npm run db:migrate:reset` | Reset database and run all migrations |
| `npm run db:seed` | Populate database with sample data |
| `npm run db:studio` | Open Prisma Studio for database browsing |
| `npm run db:test` | Test database connection and operations |
| `npm run db:setup` | Complete setup (migrate + seed) |

## Connection Pooling

The application is configured with connection pooling for optimal performance:

- **Connection limit**: 10 concurrent connections (configurable via DATABASE_URL)
- **Pool timeout**: 20 seconds
- **Graceful shutdown**: Connections are properly closed on application exit

## Sample Data

The seeding script creates:

- 1 admin user (admin@derjiproductions.com / admin123)
- 10 services across all categories
- 5 portfolio items with associated media
- 3 sample bookings
- 3 contact inquiries

## Database Maintenance

### Backup

```bash
# Create backup
pg_dump $DATABASE_URL > backup.sql

# Restore backup
psql $DATABASE_URL < backup.sql
```

### Monitoring

Use the database utility functions in `src/utils/database.ts`:

```typescript
import { checkDatabaseHealth, getDatabaseStats } from './utils/database';

// Check connection health
const isHealthy = await checkDatabaseHealth();

// Get database statistics
const stats = await getDatabaseStats();
```

### Production Deployment

1. Set production DATABASE_URL
2. Run migrations: `npm run db:migrate:deploy`
3. Optionally seed with production data
4. Monitor connection health

## Schema Changes

When modifying the schema:

1. Update `prisma/schema.prisma`
2. Generate migration: `npm run db:migrate`
3. Update seed data if needed
4. Test changes: `npm run db:test`
5. Update this documentation

## Troubleshooting

### Common Issues

1. **Connection refused**: Check PostgreSQL is running and DATABASE_URL is correct
2. **Migration conflicts**: Use `npm run db:migrate:reset` to reset and reapply
3. **Seeding errors**: Check for unique constraint violations or missing relations
4. **Performance issues**: Monitor connection pool usage and query performance

### Debug Mode

Enable query logging by setting NODE_ENV=development in your .env file. This will log all database queries for debugging purposes.

## Security Considerations

- Database credentials are stored in environment variables
- Connection pooling prevents connection exhaustion
- Prepared statements prevent SQL injection
- Audit trails track data changes
- Regular backups ensure data recovery capability