import { prisma } from '../lib/prisma';
import { generateReferenceId, generateUniqueSlug } from '../utils/propertyHelpers';

/**
 * Migration script to add referenceId and slug to existing properties
 * Run this AFTER running the Prisma migration
 */
async function main() {
  console.log('🚀 Starting migration: Adding referenceId and slug to existing properties...\n');

  // Get all properties without referenceId or slug
  const properties = await prisma.property.findMany({
    select: {
      id: true,
      title: true,
      referenceId: true,
      slug: true,
    },
  });

  console.log(`📊 Found ${properties.length} properties to check\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const property of properties) {
    try {
      const needsUpdate = !property.referenceId || !property.slug;

      if (!needsUpdate) {
        skippedCount++;
        continue;
      }

      // Generate missing fields
      const referenceId = property.referenceId || await generateReferenceId();
      const slug = property.slug || await generateUniqueSlug(property.title, property.id);

      // Update property
      await prisma.property.update({
        where: { id: property.id },
        data: {
          referenceId,
          slug,
        },
      });

      updatedCount++;
      console.log(`✅ Updated property ${property.id}: ${referenceId} | ${slug}`);
    } catch (error: any) {
      console.error(`❌ Failed to update property ${property.id}:`, error.message);
    }
  }

  console.log('\n✨ Migration completed!');
  console.log(`   Updated: ${updatedCount} properties`);
  console.log(`   Skipped: ${skippedCount} properties (already had IDs)`);
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
