-- Initial database setup
-- This file is run when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The Prisma schema will handle table creation
-- This file is for any initial setup that needs to happen before Prisma migrations