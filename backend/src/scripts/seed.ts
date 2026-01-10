import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.portfolioMedia.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.contactInquiry.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.create({
    data: {
      email: 'admin@derjiproductions.com',
      passwordHash: hashedPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
    },
  });

  // Create service categories first
  console.log('📂 Creating service categories...');
  const photographyCategory = await prisma.serviceCategory.create({
    data: {
      name: 'Photography',
      slug: 'photography',
      description: 'Professional photography services for all occasions',
      icon: 'camera',
      active: true,
      sortOrder: 1,
    },
  });

  const videographyCategory = await prisma.serviceCategory.create({
    data: {
      name: 'Videography',
      slug: 'videography',
      description: 'Professional video production and editing services',
      icon: 'video',
      active: true,
      sortOrder: 2,
    },
  });

  const soundCategory = await prisma.serviceCategory.create({
    data: {
      name: 'Sound Production',
      slug: 'sound-production',
      description: 'Professional audio recording and production services',
      icon: 'microphone',
      active: true,
      sortOrder: 3,
    },
  });

  // Create services
  console.log('🎯 Creating services...');
  const photographyServices = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Wedding Photography',
        categoryId: photographyCategory.id,
        subcategory: 'Wedding',
        description: 'Professional wedding photography capturing your special moments with artistic flair and attention to detail.',
        basePrice: 1500.00,
        priceType: 'package',
        duration: 480, // 8 hours
        features: ['Pre-wedding consultation', 'Full day coverage', 'Edited high-resolution photos', 'Online gallery', 'Print release'],
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Corporate Photography',
        categoryId: photographyCategory.id,
        subcategory: 'Corporate',
        description: 'Professional corporate headshots and event photography for businesses and organizations.',
        basePrice: 200.00,
        priceType: 'hourly',
        duration: 60,
        features: ['Professional lighting', 'Multiple outfit changes', 'Retouched images', 'Same-day delivery available'],
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Birthday Photography',
        categoryId: photographyCategory.id,
        subcategory: 'Birthday',
        description: 'Capture precious birthday moments with creative and fun photography sessions.',
        basePrice: 300.00,
        priceType: 'fixed',
        duration: 120,
        features: ['Creative setups', 'Props included', 'Edited photos', 'Digital gallery'],
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Graduation Photography',
        categoryId: photographyCategory.id,
        subcategory: 'Graduation',
        description: 'Commemorate your graduation milestone with professional photography.',
        basePrice: 250.00,
        priceType: 'fixed',
        duration: 90,
        features: ['Cap and gown photos', 'Family portraits', 'Campus locations', 'Edited photos'],
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Church Event Photography',
        categoryId: photographyCategory.id,
        subcategory: 'Church Events',
        description: 'Respectful and professional photography for religious ceremonies and church events.',
        basePrice: 350.00,
        priceType: 'fixed',
        duration: 180,
        features: ['Ceremony coverage', 'Group photos', 'Candid moments', 'Digital delivery'],
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Travel Photography',
        categoryId: photographyCategory.id,
        subcategory: 'Travel',
        description: 'Capture your travel adventures with stunning destination photography.',
        basePrice: 400.00,
        priceType: 'hourly',
        duration: 120,
        features: ['Location scouting', 'Golden hour sessions', 'Lifestyle shots', 'Travel portfolio'],
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Studio Photography',
        categoryId: photographyCategory.id,
        subcategory: 'Studio',
        description: 'Professional studio photography with controlled lighting and backdrops.',
        basePrice: 180.00,
        priceType: 'hourly',
        duration: 60,
        features: ['Professional studio', 'Multiple backdrops', 'Professional lighting', 'Wardrobe changes'],
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Location Photography',
        categoryId: photographyCategory.id,
        subcategory: 'Location',
        description: 'On-location photography sessions at your preferred venue or outdoor setting.',
        basePrice: 220.00,
        priceType: 'hourly',
        duration: 90,
        features: ['Location flexibility', 'Natural lighting', 'Environmental portraits', 'Travel included'],
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Drone Aerial Photography',
        categoryId: photographyCategory.id,
        subcategory: 'Drone aerial shoot',
        description: 'Stunning aerial photography and videography using professional drone equipment.',
        basePrice: 400.00,
        priceType: 'fixed',
        duration: 90,
        features: ['4K aerial footage', 'Professional drone pilot', 'Weather contingency', 'Edited final deliverables'],
        active: true,
      },
    }),
  ]);

  const videographyServices = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Live Streaming',
        categoryId: videographyCategory.id,
        subcategory: 'Livestreaming',
        description: 'Professional live streaming services for events, conferences, and special occasions.',
        basePrice: 500.00,
        priceType: 'hourly',
        duration: 60,
        features: ['Multi-camera setup', 'Professional audio', 'Real-time streaming', 'Recording backup'],
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Video Post-Production',
        categoryId: videographyCategory.id,
        subcategory: 'Post-production',
        description: 'Complete video editing and post-production services including color grading and audio mixing.',
        basePrice: 100.00,
        priceType: 'hourly',
        duration: 60,
        features: ['Professional editing', 'Color correction', 'Audio enhancement', 'Motion graphics', 'Multiple formats'],
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Podcast Video Production',
        categoryId: videographyCategory.id,
        subcategory: 'Podcast',
        description: 'Complete podcast video production from recording to final edited episodes.',
        basePrice: 800.00,
        priceType: 'package',
        duration: 240,
        features: ['Multi-camera recording', 'Professional audio', 'Editing and post-production', 'Thumbnail creation'],
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Drone Video Coverage',
        categoryId: videographyCategory.id,
        subcategory: 'Drone coverage',
        description: 'Professional aerial videography for events, real estate, and promotional content.',
        basePrice: 600.00,
        priceType: 'fixed',
        duration: 120,
        features: ['4K drone footage', 'Cinematic shots', 'Professional pilot', 'Edited deliverables'],
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Video Consultation & Training',
        categoryId: videographyCategory.id,
        subcategory: 'Consultation/training',
        description: 'Professional consultation and training services for video production techniques.',
        basePrice: 150.00,
        priceType: 'hourly',
        duration: 60,
        features: ['Equipment recommendations', 'Technique training', 'Workflow optimization', 'Hands-on practice'],
        active: true,
      },
    }),
  ]);

  const soundServices = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Live Sound Production',
        categoryId: soundCategory.id,
        subcategory: 'Live sound production',
        description: 'Professional live sound engineering for concerts, events, and performances.',
        basePrice: 300.00,
        priceType: 'hourly',
        duration: 60,
        features: ['Professional sound equipment', 'Sound engineer', 'Mixing and monitoring', 'Backup systems'],
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Audio Post-Production',
        categoryId: soundCategory.id,
        subcategory: 'Post sound production',
        description: 'Professional audio editing, mixing, and mastering services for various media projects.',
        basePrice: 80.00,
        priceType: 'hourly',
        duration: 60,
        features: ['Audio editing', 'Mixing and mastering', 'Noise reduction', 'Audio restoration'],
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Podcast Audio Production',
        categoryId: soundCategory.id,
        subcategory: 'Podcast',
        description: 'Complete podcast audio production including recording, editing, and distribution preparation.',
        basePrice: 150.00,
        priceType: 'fixed',
        duration: 120,
        features: ['Studio recording', 'Audio editing', 'Intro/outro creation', 'Distribution formats'],
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Audio Consultation & Training',
        categoryId: soundCategory.id,
        subcategory: 'Consultation/training',
        description: 'Professional consultation and training for audio recording and production techniques.',
        basePrice: 120.00,
        priceType: 'hourly',
        duration: 60,
        features: ['Equipment setup', 'Recording techniques', 'Software training', 'Workflow optimization'],
        active: true,
      },
    }),
  ]);

  // Create portfolio items
  console.log('🎨 Creating portfolio items...');
  const portfolioItems = await Promise.all([
    prisma.portfolioItem.create({
      data: {
        title: 'Sarah & Michael Wedding',
        description: 'A beautiful outdoor wedding ceremony captured with artistic flair and attention to detail.',
        category: 'photography',
        clientName: 'Sarah Johnson',
        projectDate: new Date('2023-08-15'),
        featured: true,
        tags: ['wedding', 'outdoor', 'romantic', 'summer'],
      },
    }),
    prisma.portfolioItem.create({
      data: {
        title: 'TechCorp Annual Conference',
        description: 'Corporate event photography and videography for a major technology conference.',
        category: 'photography',
        clientName: 'TechCorp Inc.',
        projectDate: new Date('2023-09-22'),
        featured: true,
        tags: ['corporate', 'conference', 'professional', 'technology'],
      },
    }),
    prisma.portfolioItem.create({
      data: {
        title: 'Emma\'s 5th Birthday Party',
        description: 'Fun and creative birthday party photography capturing precious childhood moments.',
        category: 'photography',
        clientName: 'The Williams Family',
        projectDate: new Date('2023-10-08'),
        featured: false,
        tags: ['birthday', 'children', 'party', 'family'],
      },
    }),
    prisma.portfolioItem.create({
      data: {
        title: 'City Skyline Aerial Showcase',
        description: 'Stunning aerial photography and videography showcasing the city\'s architectural beauty.',
        category: 'videography',
        clientName: 'City Tourism Board',
        projectDate: new Date('2023-07-30'),
        featured: true,
        tags: ['aerial', 'cityscape', 'drone', 'architecture'],
      },
    }),
    prisma.portfolioItem.create({
      data: {
        title: 'The Business Podcast Series',
        description: 'Complete podcast production including video recording, audio mixing, and post-production.',
        category: 'sound',
        clientName: 'Business Insights Media',
        projectDate: new Date('2023-11-15'),
        featured: true,
        tags: ['podcast', 'business', 'interview', 'series'],
      },
    }),
  ]);

  // Create portfolio media
  console.log('🖼️ Creating portfolio media...');
  await Promise.all([
    // Wedding portfolio media
    prisma.portfolioMedia.create({
      data: {
        portfolioItemId: portfolioItems[0].id,
        mediaType: 'image',
        fileUrl: 'https://example.com/portfolio/wedding-1.jpg',
        thumbnailUrl: 'https://example.com/portfolio/thumbs/wedding-1-thumb.jpg',
        fileSize: 2048000,
        width: 1920,
        height: 1280,
        altText: 'Bride and groom exchanging vows in garden setting',
        sortOrder: 1,
      },
    }),
    prisma.portfolioMedia.create({
      data: {
        portfolioItemId: portfolioItems[0].id,
        mediaType: 'image',
        fileUrl: 'https://example.com/portfolio/wedding-2.jpg',
        thumbnailUrl: 'https://example.com/portfolio/thumbs/wedding-2-thumb.jpg',
        fileSize: 1856000,
        width: 1920,
        height: 1280,
        altText: 'Wedding reception dance floor with romantic lighting',
        sortOrder: 2,
      },
    }),
    // Corporate event media
    prisma.portfolioMedia.create({
      data: {
        portfolioItemId: portfolioItems[1].id,
        mediaType: 'image',
        fileUrl: 'https://example.com/portfolio/corporate-1.jpg',
        thumbnailUrl: 'https://example.com/portfolio/thumbs/corporate-1-thumb.jpg',
        fileSize: 1024000,
        width: 1920,
        height: 1080,
        altText: 'Conference keynote speaker on stage',
        sortOrder: 1,
      },
    }),
    // Aerial video media
    prisma.portfolioMedia.create({
      data: {
        portfolioItemId: portfolioItems[3].id,
        mediaType: 'video',
        fileUrl: 'https://example.com/portfolio/aerial-city.mp4',
        thumbnailUrl: 'https://example.com/portfolio/thumbs/aerial-city-thumb.jpg',
        fileSize: 15728640,
        width: 3840,
        height: 2160,
        durationSeconds: 120,
        altText: 'Aerial view of city skyline at sunset',
        sortOrder: 1,
      },
    }),
    // Podcast audio media
    prisma.portfolioMedia.create({
      data: {
        portfolioItemId: portfolioItems[4].id,
        mediaType: 'audio',
        fileUrl: 'https://example.com/portfolio/podcast-sample.mp3',
        fileSize: 5242880,
        durationSeconds: 180,
        altText: 'Business podcast episode sample',
        sortOrder: 1,
      },
    }),
  ]);

  // Create sample bookings
  console.log('📅 Creating sample bookings...');
  await Promise.all([
    prisma.booking.create({
      data: {
        clientName: 'Jennifer Davis',
        clientEmail: 'jennifer.davis@email.com',
        clientPhone: '+1-555-0123',
        serviceId: photographyServices[0].id, // Wedding Photography
        bookingDate: new Date('2024-02-14'),
        startTime: new Date('2024-02-14T10:00:00Z'),
        endTime: new Date('2024-02-14T18:00:00Z'),
        status: 'confirmed',
        projectDetails: 'Outdoor wedding ceremony and reception at Riverside Gardens. Approximately 150 guests.',
        budgetRange: '$1500-2000',
        location: 'Riverside Gardens, Downtown',
        notes: 'Client prefers natural lighting and candid shots',
      },
    }),
    prisma.booking.create({
      data: {
        clientName: 'Mark Thompson',
        clientEmail: 'mark.thompson@techstartup.com',
        clientPhone: '+1-555-0456',
        serviceId: photographyServices[1].id, // Corporate Photography
        bookingDate: new Date('2024-01-20'),
        startTime: new Date('2024-01-20T14:00:00Z'),
        endTime: new Date('2024-01-20T16:00:00Z'),
        status: 'pending',
        projectDetails: 'Corporate headshots for 10 team members',
        budgetRange: '$500-800',
        location: 'TechStartup Office, Business District',
        notes: 'Need professional headshots for website and LinkedIn profiles',
      },
    }),
    prisma.booking.create({
      data: {
        clientName: 'Lisa Rodriguez',
        clientEmail: 'lisa.rodriguez@email.com',
        clientPhone: '+1-555-0789',
        serviceId: videographyServices[0].id, // Live Streaming
        bookingDate: new Date('2024-03-10'),
        startTime: new Date('2024-03-10T19:00:00Z'),
        endTime: new Date('2024-03-10T22:00:00Z'),
        status: 'confirmed',
        projectDetails: 'Live streaming of charity gala event',
        budgetRange: '$1000-1500',
        location: 'Grand Ballroom, City Hotel',
        notes: 'Need multi-camera setup with professional audio',
      },
    }),
  ]);

  // Create sample contact inquiries
  console.log('📧 Creating sample contact inquiries...');
  await Promise.all([
    prisma.contactInquiry.create({
      data: {
        name: 'Robert Chen',
        email: 'robert.chen@email.com',
        phone: '+1-555-0321',
        subject: 'Wedding Photography Inquiry',
        message: 'Hi, I\'m interested in your wedding photography services for my wedding in June. Could you please send me more information about your packages and availability?',
        serviceInterest: 'Wedding Photography',
        status: 'new',
      },
    }),
    prisma.contactInquiry.create({
      data: {
        name: 'Amanda Foster',
        email: 'amanda.foster@company.com',
        phone: '+1-555-0654',
        subject: 'Corporate Event Coverage',
        message: 'We need photography and videography services for our annual company retreat. The event will be held over 2 days with approximately 200 attendees.',
        serviceInterest: 'Corporate Photography',
        status: 'responded',
      },
    }),
    prisma.contactInquiry.create({
      data: {
        name: 'David Kim',
        email: 'david.kim@email.com',
        subject: 'Podcast Production Services',
        message: 'I\'m starting a new podcast and need help with audio production and editing. What services do you offer for podcast creators?',
        serviceInterest: 'Podcast Audio Production',
        status: 'new',
      },
    }),
  ]);

  console.log('✅ Database seeding completed successfully!');
  console.log(`
📊 Seeded data summary:
- 1 admin user
- 3 service categories
- ${photographyServices.length + videographyServices.length + soundServices.length} services
- ${portfolioItems.length} portfolio items
- 5 portfolio media files
- 3 sample bookings
- 3 contact inquiries
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });