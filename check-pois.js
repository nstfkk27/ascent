const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPOIs() {
  try {
    const count = await prisma.pointOfInterest.count();
    console.log(`\n✅ Total POIs in database: ${count}`);
    
    if (count > 0) {
      const pois = await prisma.pointOfInterest.findMany({
        take: 10,
        orderBy: { type: 'asc' }
      });
      
      console.log('\n📍 Sample POIs:');
      pois.forEach(poi => {
        console.log(`  - ${poi.type}: ${poi.name} (${poi.city})`);
      });
      
      // Check by type
      const types = await prisma.pointOfInterest.groupBy({
        by: ['type'],
        _count: true
      });
      
      console.log('\n📊 POIs by type:');
      types.forEach(t => {
        console.log(`  - ${t.type}: ${t._count} locations`);
      });
    } else {
      console.log('\n❌ No POIs found. Run: npx tsx prisma/seed-pois-pattaya.ts');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPOIs();
