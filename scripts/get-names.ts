import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getProjectAndAreaNames() {
  try {
    // Get all unique project names from Project table
    const projects = await prisma.project.findMany({
      select: {
        name: true,
        nameTh: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Get all unique project names from Property table
    const propertyProjects = await prisma.property.findMany({
      where: {
        projectName: {
          not: null,
        },
      },
      select: {
        projectName: true,
      },
      distinct: ['projectName'],
      orderBy: {
        projectName: 'asc',
      },
    });

    // Get all unique area names from Property table
    const propertyAreas = await prisma.property.findMany({
      where: {
        area: {
          not: null,
        },
      },
      select: {
        area: true,
      },
      distinct: ['area'],
      orderBy: {
        area: 'asc',
      },
    });

    // Get all unique subArea names from Property table
    const propertySubAreas = await prisma.property.findMany({
      where: {
        subArea: {
          not: null,
        },
      },
      select: {
        subArea: true,
      },
      distinct: ['subArea'],
      orderBy: {
        subArea: 'asc',
      },
    });

    console.log('\n========================================');
    console.log('PROJECT NAMES (from Project table)');
    console.log('========================================');
    console.log(`Total: ${projects.length}\n`);
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name}${project.nameTh ? ` (${project.nameTh})` : ''}`);
    });

    console.log('\n========================================');
    console.log('PROJECT NAMES (from Property table)');
    console.log('========================================');
    console.log(`Total: ${propertyProjects.length}\n`);
    propertyProjects.forEach((property, index) => {
      console.log(`${index + 1}. ${property.projectName}`);
    });

    console.log('\n========================================');
    console.log('AREA NAMES (from Property table)');
    console.log('========================================');
    console.log(`Total: ${propertyAreas.length}\n`);
    propertyAreas.forEach((property, index) => {
      console.log(`${index + 1}. ${property.area}`);
    });

    console.log('\n========================================');
    console.log('SUB-AREA NAMES (from Property table)');
    console.log('========================================');
    console.log(`Total: ${propertySubAreas.length}\n`);
    propertySubAreas.forEach((property, index) => {
      console.log(`${index + 1}. ${property.subArea}`);
    });

  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getProjectAndAreaNames();
