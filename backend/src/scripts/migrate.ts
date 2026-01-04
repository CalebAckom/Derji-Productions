import { exec } from 'child_process';
import { promisify } from 'util';
import prisma from '../config/database';

const execAsync = promisify(exec);

async function runMigrations() {
  console.log('🚀 Starting database migration process...');
  
  try {
    // Check if database is accessible
    console.log('🔍 Checking database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Run Prisma migrations
    console.log('📦 Running Prisma migrations...');
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy', {
      cwd: process.cwd(),
    });
    
    if (stderr && !stderr.includes('warning')) {
      console.error('❌ Migration stderr:', stderr);
      throw new Error('Migration failed');
    }
    
    console.log('✅ Migrations completed successfully');
    if (stdout) {
      console.log('Migration output:', stdout);
    }
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    const { stdout: genStdout, stderr: genStderr } = await execAsync('npx prisma generate', {
      cwd: process.cwd(),
    });
    
    if (genStderr && !genStderr.includes('warning')) {
      console.error('❌ Client generation stderr:', genStderr);
      throw new Error('Client generation failed');
    }
    
    console.log('✅ Prisma client generated successfully');
    if (genStdout) {
      console.log('Generation output:', genStdout);
    }
    
    // Verify database schema
    console.log('🔍 Verifying database schema...');
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const expectedTables = [
      'users',
      'services', 
      'portfolio_items',
      'portfolio_media',
      'bookings',
      'contact_inquiries',
      '_prisma_migrations'
    ];
    
    const actualTables = tables.map(t => t.table_name);
    const missingTables = expectedTables.filter(table => 
      table !== '_prisma_migrations' && !actualTables.includes(table)
    );
    
    if (missingTables.length > 0) {
      throw new Error(`Missing tables: ${missingTables.join(', ')}`);
    }
    
    console.log('✅ Database schema verification successful');
    console.log(`📊 Found ${actualTables.length} tables:`, actualTables.join(', '));
    
    console.log('🎉 Migration process completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations()
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { runMigrations };