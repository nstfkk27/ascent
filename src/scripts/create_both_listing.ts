
import { prisma } from '../lib/prisma';
import { ListingType, PropertyCategory } from '@prisma/client';
import { generateReferenceId, generateUniqueSlug } from '../utils/propertyHelpers';

async function main() {
  console.log('--- Creating a BOTH listing ---');
  
  const existing = await prisma.property.findFirst({
    where: { title: 'Test BOTH Listing' }
  });

  if (existing) {
    console.log('Test listing already exists:', existing.id);
    return;
  }

  const property = await prisma.property.create({
    data: {
      referenceId: await generateReferenceId(),
      slug: await generateUniqueSlug('Test BOTH Listing'),
      title: 'Test BOTH Listing',
      description: 'This is a test property available for both SALE and RENT.',
      price: 5000000,
      rentPrice: 25000,
      listingType: 'BOTH',
      category: 'CONDO',
      status: 'AVAILABLE',
      address: '123 Test St',
      city: 'Pattaya',
      state: 'Chonburi',
      zipCode: '20150',
      size: 50,
      bedrooms: 1,
      bathrooms: 1,
    }
  });

  console.log('Created BOTH listing:', property.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
