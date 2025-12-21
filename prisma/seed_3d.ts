import { PrismaClient } from '@prisma/client';
import { generateReferenceId, generateUniqueSlug } from '../src/utils/propertyHelpers';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding 3D projects...');

  // 1. Create a Condo Project
  const condo = await prisma.project.create({
    data: {
      name: 'Ascent Heights',
      type: 'CONDO',
      developer: 'Ascent Development',
      completionYear: 2024,
      description: 'Luxury high-rise condominium in the heart of the city.',
      address: '123 Sukhumvit Road',
      city: 'Bangkok',
      lat: 13.7563,
      lng: 100.5018,
      modelAsset: {
        create: {
          glbUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb', // Placeholder
          placement: { scale: [10, 10, 10], rotation: [0, 0, 0] }
        }
      },
      facilities: {
        create: [
          { name: 'Infinity Pool', imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=500&q=60' },
          { name: 'Sky Gym', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=60' }
        ]
      },
      units: {
        create: [
          {
            referenceId: await generateReferenceId(),
            slug: await generateUniqueSlug('Penthouse Suite'),
            title: 'Penthouse Suite',
            description: 'Top floor luxury suite with panoramic views.',
            price: 15000000,
            bedrooms: 3,
            bathrooms: 3,
            size: 120,
            listingType: 'SALE',
            status: 'AVAILABLE',
            category: 'CONDO',
            address: '123 Sukhumvit Road',
            city: 'Bangkok',
            state: 'Bangkok',
            zipCode: '10110',
            images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=60']
          },
          {
            referenceId: await generateReferenceId(),
            slug: await generateUniqueSlug('1 Bedroom City View'),
            title: '1 Bedroom City View',
            description: 'Cozy unit perfect for singles or couples.',
            price: 5000000,
            bedrooms: 1,
            bathrooms: 1,
            size: 45,
            listingType: 'SALE',
            status: 'AVAILABLE',
            category: 'CONDO',
            address: '123 Sukhumvit Road',
            city: 'Bangkok',
            state: 'Bangkok',
            zipCode: '10110',
            images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=500&q=60']
          }
        ]
      }
    }
  });

  // 2. Create a House Project
  const house = await prisma.project.create({
    data: {
      name: 'Green Valley Estate',
      type: 'HOUSE',
      developer: 'Green Living',
      completionYear: 2023,
      description: 'Spacious family homes surrounded by nature.',
      address: '456 Green Way',
      city: 'Bangkok',
      lat: 13.8000,
      lng: 100.5500,
      modelAsset: {
        create: {
          glbUrl: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb', // Placeholder
          placement: { scale: [5, 5, 5], rotation: [0, 90, 0] }
        }
      },
      facilities: {
        create: [
          { name: 'Clubhouse', imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=500&q=60' },
          { name: 'Park', imageUrl: 'https://images.unsplash.com/photo-1496417263034-38ec4f0d665a?auto=format&fit=crop&w=500&q=60' }
        ]
      },
      units: {
        create: [
          {
            referenceId: await generateReferenceId(),
            slug: await generateUniqueSlug('Modern Villa Type A'),
            title: 'Modern Villa Type A',
            description: 'Modern villa with private garden.',
            price: 12000000,
            bedrooms: 4,
            bathrooms: 3,
            size: 200,
            listingType: 'SALE',
            status: 'AVAILABLE',
            category: 'HOUSE',
            houseType: 'SINGLE_HOUSE',
            address: '456 Green Way',
            city: 'Bangkok',
            state: 'Bangkok',
            zipCode: '10220',
            images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=500&q=60']
          }
        ]
      }
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
