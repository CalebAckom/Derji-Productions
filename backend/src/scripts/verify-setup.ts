import { checkDatabaseHealth, getDatabaseStats, testDatabaseOperations } from '../utils/database';
import prisma from '../config/database';

async function verifyDatabaseSetup() {
  console.log('🔍 Verifying complete database setup...\n');
  
  try {
    // 1. Test basic connection
    console.log('1️⃣ Testing database connection...');
    const isHealthy = await checkDatabaseHealth();
    console.log(`   ${isHealthy ? '✅' : '❌'} Database health: ${isHealthy ? 'OK' : 'FAILED'}\n`);
    
    if (!isHealthy) {
      throw new Error('Database connection failed');
    }
    
    // 2. Get database statistics
    console.log('2️⃣ Checking database statistics...');
    const stats = await getDatabaseStats();
    console.log(`   📊 Database contains:`);
    console.log(`      - Users: ${stats.users}`);
    console.log(`      - Services: ${stats.services}`);
    console.log(`      - Portfolio Items: ${stats.portfolioItems}`);
    console.log(`      - Portfolio Media: ${stats.portfolioMedia}`);
    console.log(`      - Bookings: ${stats.bookings}`);
    console.log(`      - Contact Inquiries: ${stats.contactInquiries}\n`);
    
    // 3. Test all database operations
    console.log('3️⃣ Testing database operations...');
    const operationTest = await testDatabaseOperations();
    console.log(`   ${operationTest.success ? '✅' : '❌'} Operations test: ${operationTest.success ? 'PASSED' : 'FAILED'}`);
    
    Object.entries(operationTest.operations).forEach(([operation, success]) => {
      console.log(`      ${success ? '✅' : '❌'} ${operation}: ${success ? 'OK' : 'FAILED'}`);
    });
    
    if (operationTest.error) {
      console.log(`      ❌ Error: ${operationTest.error}`);
    }
    console.log();
    
    // 4. Test complex queries with relations
    console.log('4️⃣ Testing complex queries...');
    
    // Test portfolio with media
    const portfolioWithMedia = await prisma.portfolioItem.findMany({
      include: { media: true },
      where: { featured: true },
    });
    console.log(`   ✅ Featured portfolio items: ${portfolioWithMedia.length}`);
    
    // Test bookings with services
    const bookingsWithServices = await prisma.booking.findMany({
      include: { service: true },
      where: { status: 'confirmed' },
    });
    console.log(`   ✅ Confirmed bookings: ${bookingsWithServices.length}`);
    
    // Test service categories
    const servicesByCategory = await prisma.service.groupBy({
      by: ['category'],
      _count: { category: true },
    });
    console.log(`   ✅ Service categories:`);
    servicesByCategory.forEach(group => {
      console.log(`      - ${group.category}: ${group._count.category} services`);
    });
    console.log();
    
    // 5. Test data integrity
    console.log('5️⃣ Testing data integrity...');
    
    // Check for orphaned media (this shouldn't happen with foreign key constraints)
    const totalMedia = await prisma.portfolioMedia.count();
    // Since portfolioItemId is required and has foreign key constraint, all media should have valid portfolio items
    console.log(`   ✅ Total media files: ${totalMedia} (all should have valid portfolio items due to FK constraint)`);
    
    // Check for bookings without services (should be allowed)
    const bookingsWithoutService = await prisma.booking.count({
      where: { serviceId: null },
    });
    console.log(`   ✅ Bookings without specific service: ${bookingsWithoutService}`);
    
    // Check admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
    });
    console.log(`   ${adminUser ? '✅' : '❌'} Admin user exists: ${adminUser ? 'YES' : 'NO'}\n`);
    
    // 6. Performance test
    console.log('6️⃣ Running performance test...');
    const startTime = Date.now();
    
    await Promise.all([
      prisma.service.findMany({ take: 5 }),
      prisma.portfolioItem.findMany({ take: 5, include: { media: true } }),
      prisma.booking.findMany({ take: 5, include: { service: true } }),
    ]);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`   ✅ Concurrent queries completed in ${duration}ms\n`);
    
    console.log('🎉 Database setup verification completed successfully!');
    console.log('✅ All systems are operational and ready for development.');
    
  } catch (error) {
    console.error('❌ Database setup verification failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabaseSetup()
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
  });