
import { prisma } from '../lib/prisma';
import { ListingType } from '@prisma/client';

async function main() {
  console.log('--- Checking Database Content ---');
  
  // 1. Count units by listing type
  const counts = await prisma.property.groupBy({
    by: ['listingType'],
    _count: {
      _all: true
    }
  });
  console.log('Counts by ListingType:', counts);

  // 2. Find a unit that is BOTH
  const bothUnit = await prisma.property.findFirst({
    where: {
      listingType: 'BOTH',
      status: 'AVAILABLE'
    }
  });

  if (!bothUnit) {
    console.log('No AVAILABLE units with ListingType.BOTH found.');
  } else {
    console.log('Found a BOTH unit:', bothUnit.id, bothUnit.title, bothUnit.listingType);
    
    // 3. Simulate Search for RENT
    console.log('\n--- Simulating Search for RENT ---');
    const unitFilter: any = {
      status: 'AVAILABLE',
      listingType: { in: ['RENT', 'BOTH'] }
    };
    
    // Test if this unit is found with the filter
    const foundInRent = await prisma.property.findFirst({
      where: {
        id: bothUnit.id,
        ...unitFilter
      }
    });
    
    console.log('Is BOTH unit found when searching for RENT?', !!foundInRent);

    // 4. Simulate Search for SALE
    console.log('\n--- Simulating Search for SALE ---');
    const unitFilterSale: any = {
      status: 'AVAILABLE',
      listingType: { in: ['SALE', 'BOTH'] }
    };
    
    const foundInSale = await prisma.property.findFirst({
        where: {
          id: bothUnit.id,
          ...unitFilterSale
        }
      });
      
    console.log('Is BOTH unit found when searching for SALE?', !!foundInSale);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
