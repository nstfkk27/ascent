'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProject(formData: FormData) {
  const name = formData.get('name') as string;
  const type = formData.get('type') as any;
  const address = formData.get('address') as string;
  const city = formData.get('city') as string;
  const lat = parseFloat(formData.get('lat') as string);
  const lng = parseFloat(formData.get('lng') as string);
  const description = formData.get('description') as string;
  const developer = formData.get('developer') as string;
  const completionYear = formData.get('completionYear') ? parseInt(formData.get('completionYear') as string) : null;
  const totalUnits = formData.get('totalUnits') ? parseInt(formData.get('totalUnits') as string) : null;
  const totalFloors = formData.get('totalFloors') ? parseInt(formData.get('totalFloors') as string) : null;
  const totalBuildings = formData.get('totalBuildings') ? parseInt(formData.get('totalBuildings') as string) : null;
  const glbUrl = formData.get('glbUrl') as string;
  const imageUrl = formData.get('imageUrl') as string;

  const project = await prisma.project.create({
    data: {
      name,
      type,
      address,
      city,
      lat,
      lng,
      description,
      developer,
      completionYear,
      totalUnits,
      totalFloors,
      totalBuildings,
      imageUrl,
      modelAsset: glbUrl ? {
        create: {
          glbUrl,
          placement: {}
        }
      } : undefined
    }
  });

  revalidatePath('/agent/project-manager');
  redirect(`/agent/project-manager/${project.id}`);
}

export async function updateProject(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const glbUrl = formData.get('glbUrl') as string;
  const completionYear = formData.get('completionYear') ? parseInt(formData.get('completionYear') as string) : null;
  const totalUnits = formData.get('totalUnits') ? parseInt(formData.get('totalUnits') as string) : null;
  const totalFloors = formData.get('totalFloors') ? parseInt(formData.get('totalFloors') as string) : null;
  const totalBuildings = formData.get('totalBuildings') ? parseInt(formData.get('totalBuildings') as string) : null;
  const imageUrl = formData.get('imageUrl') as string;

  // Update basic info
  await prisma.project.update({
    where: { id },
    data: {
      name,
      description,
      completionYear,
      totalUnits,
      totalFloors,
      totalBuildings,
      imageUrl,
    }
  });

  // Update or Create Model Asset
  if (glbUrl) {
    const existingModel = await prisma.modelAsset.findUnique({
      where: { projectId: id }
    });

    if (existingModel) {
      await prisma.modelAsset.update({
        where: { projectId: id },
        data: { glbUrl }
      });
    } else {
      await prisma.modelAsset.create({
        data: {
          projectId: id,
          glbUrl,
          placement: {}
        }
      });
    }
  }

  revalidatePath(`/agent/project-manager/${id}`);
  revalidatePath('/agent/project-manager');
}

export async function linkMatchingUnits(projectId: string, projectName: string, formData: FormData) {
  // Find properties with matching project name (case-insensitive search could be better but Prisma simple filter is exact/contains)
  // We'll use contains for flexibility
  await prisma.property.updateMany({
    where: {
      projectId: null,
      OR: [
        { projectName: { equals: projectName, mode: 'insensitive' } },
        { title: { contains: projectName, mode: 'insensitive' } }
      ]
    },
    data: {
      projectId: projectId
    }
  });

  revalidatePath(`/agent/project-manager/${projectId}`);
}

export async function addFacility(projectId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const imageUrl = formData.get('imageUrl') as string;

  if (!name) return;

  await prisma.facility.create({
    data: {
      name,
      imageUrl: imageUrl || null,
      projectId
    }
  });

  revalidatePath(`/agent/project-manager/${projectId}`);
}

export async function deleteFacility(facilityId: string, projectId: string, formData: FormData) {
  await prisma.facility.delete({
    where: { id: facilityId }
  });

  revalidatePath(`/agent/project-manager/${projectId}`);
}
