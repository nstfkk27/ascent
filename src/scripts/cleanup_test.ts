
import { prisma } from '../lib/prisma';

async function main() {
  const deleted = await prisma.property.deleteMany({
    where: {
      title: 'Test BOTH Listing'
    }
  });
  console.log(`Deleted ${deleted.count} test listings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
