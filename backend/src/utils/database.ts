import prisma from '../config/database';

/**
 * Check database connection health
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Get database connection info
 */
export async function getDatabaseInfo() {
  try {
    const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
    return {
      connected: true,
      version: result[0]?.version || 'Unknown',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  try {
    const [
      userCount,
      serviceCount,
      portfolioCount,
      portfolioMediaCount,
      bookingCount,
      inquiryCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.service.count(),
      prisma.portfolioItem.count(),
      prisma.portfolioMedia.count(),
      prisma.booking.count(),
      prisma.contactInquiry.count(),
    ]);

    return {
      users: userCount,
      services: serviceCount,
      portfolioItems: portfolioCount,
      portfolioMedia: portfolioMediaCount,
      bookings: bookingCount,
      contactInquiries: inquiryCount,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to get database stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Clean up database connections
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Test database operations
 */
export async function testDatabaseOperations(): Promise<{
  success: boolean;
  operations: Record<string, boolean>;
  error?: string;
}> {
  const operations: Record<string, boolean> = {};
  
  try {
    // Test basic connection
    operations.connection = await checkDatabaseHealth();
    
    // Test read operations
    try {
      await prisma.user.findFirst();
      operations.read = true;
    } catch {
      operations.read = false;
    }
    
    // Test write operations (create and delete a test record)
    try {
      const testUser = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@test.com`,
          passwordHash: 'test-hash',
          firstName: 'Test',
          lastName: 'User',
        },
      });
      
      await prisma.user.delete({
        where: { id: testUser.id },
      });
      
      operations.write = true;
    } catch {
      operations.write = false;
    }
    
    // Test transactions
    try {
      await prisma.$transaction(async (tx) => {
        await tx.user.findFirst();
        await tx.service.findFirst();
      });
      operations.transaction = true;
    } catch {
      operations.transaction = false;
    }
    
    const allOperationsSuccessful = Object.values(operations).every(Boolean);
    
    return {
      success: allOperationsSuccessful,
      operations,
    };
  } catch (error) {
    return {
      success: false,
      operations,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}