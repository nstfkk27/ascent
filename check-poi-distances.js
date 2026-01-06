const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDistances() {
  try {
    const distanceCount = await prisma.propertyPOIDistance.count();
    console.log(`\n📏 Total POI distances calculated: ${distanceCount}`);
    
    const propertiesWithCoords = await prisma.property.count({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    console.log(`📍 Properties with coordinates: ${propertiesWithCoords}`);
    
    const propertiesWithNearestBeach = await prisma.property.count({
      where: {
        nearestBeachKm: { not: null }
      }
    });
    console.log(`🏖️  Properties with nearest beach calculated: ${propertiesWithNearestBeach}`);
    
    if (distanceCount > 0) {
      const sample = await prisma.propertyPOIDistance.findMany({
        take: 5,
        include: {
          poi: { select: { name: true, type: true } }
        }
      });
      
      console.log('\n📊 Sample distances:');
      sample.forEach(d => {
        console.log(`  - ${d.poi.type} (${d.poi.name}): ${d.distanceKm} km`);
      });
    } else {
      console.log('\n❌ No distances calculated yet.');
      console.log('💡 Need to run distance calculation for properties.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDistances();
