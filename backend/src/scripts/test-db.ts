import prisma from '../config/database';

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test queries
    const userCount = await prisma.user.count();
    const serviceCount = await prisma.service.count();
    const portfolioCount = await prisma.portfolioItem.count();
    const bookingCount = await prisma.booking.count();
    const inquiryCount = await prisma.contactInquiry.count();
    
    console.log('📊 Database statistics:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Services: ${serviceCount}`);
    console.log(`- Portfolio Items: ${portfolioCount}`);
    console.log(`- Bookings: ${bookingCount}`);
    console.log(`- Contact Inquiries: ${inquiryCount}`);
    
    // Test complex query with relations
    const portfolioWithMedia = await prisma.portfolioItem.findMany({
      include: {
        media: true,
      },
      take: 3,
    });
    
    console.log(`📸 Portfolio items with media: ${portfolioWithMedia.length}`);
    portfolioWithMedia.forEach(item => {
      console.log(`  - ${item.title}: ${item.media.length} media files`);
    });
    
    // Test booking with service relation
    const bookingsWithServices = await prisma.booking.findMany({
      include: {
        service: true,
      },
      take: 2,
    });
    
    console.log(`📅 Bookings with services: ${bookingsWithServices.length}`);
    bookingsWithServices.forEach(booking => {
      console.log(`  - ${booking.clientName}: ${booking.service?.name || 'No service'}`);
    });
    
    console.log('✅ All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });