
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    include: {
      modelAsset: true
    }
  });
  fs.writeFileSync('db_dump.json', JSON.stringify(projects, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
