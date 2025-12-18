import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

// Helper to parse CSV text into array of objects
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1);
  
  return rows.map(row => {
    const values = row.split(',').map(v => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header] = values[idx] || '';
    });
    return obj;
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is platform agent
    const agentProfile = await prisma.agentProfile.findFirst({
      where: { email: user.email! },
      select: { role: true }
    });

    if (!agentProfile || (agentProfile.role !== 'SUPER_ADMIN' && agentProfile.role !== 'PLATFORM_AGENT')) {
      return NextResponse.json({ success: false, message: 'Forbidden - Platform agents only' }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const projectsFile = formData.get('projects') as File;
    const facilitiesFile = formData.get('facilities') as File;
    const unitsFile = formData.get('units') as File;

    if (!projectsFile || !facilitiesFile || !unitsFile) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing CSV files',
        errors: ['Please upload all 3 CSV files']
      }, { status: 400 });
    }

    // Read CSV files
    const projectsText = await projectsFile.text();
    const facilitiesText = await facilitiesFile.text();
    const unitsText = await unitsFile.text();

    // Parse CSVs
    const projectsData = parseCSV(projectsText);
    const facilitiesData = parseCSV(facilitiesText);
    const unitsData = parseCSV(unitsText);

    const errors: string[] = [];
    let projectsCreated = 0;
    let facilitiesCreated = 0;
    let unitsCreated = 0;

    // Step 1: Create Projects
    const projectMap = new Map<string, string>(); // project_name -> project_id
    
    for (const row of projectsData) {
      try {
        const project = await prisma.project.create({
          data: {
            name: row.project_name,
            type: row.type as any,
            address: row.address,
            city: row.city,
            lat: parseFloat(row.latitude),
            lng: parseFloat(row.longitude),
            developer: row.developer || null,
            completionYear: row.completion_year ? parseInt(row.completion_year) : null,
            description: row.description || null,
            totalUnits: row.total_units ? parseInt(row.total_units) : null,
            totalBuildings: row.total_buildings ? parseInt(row.total_buildings) : null,
            totalFloors: row.total_floors ? parseInt(row.total_floors) : null,
            imageUrl: row.project_image_url || null,
          }
        });
        
        projectMap.set(row.project_name, project.id);
        projectsCreated++;
      } catch (error) {
        errors.push(`Project "${row.project_name}": ${String(error)}`);
      }
    }

    // Step 2: Create Facilities
    for (const row of facilitiesData) {
      try {
        const projectId = projectMap.get(row.project_name);
        if (!projectId) {
          errors.push(`Facility "${row.facility_name}": Project "${row.project_name}" not found`);
          continue;
        }

        await prisma.facility.create({
          data: {
            name: row.facility_name,
            imageUrl: row.facility_image_url || null,
            projectId: projectId,
          }
        });
        
        facilitiesCreated++;
      } catch (error) {
        errors.push(`Facility "${row.facility_name}": ${String(error)}`);
      }
    }

    // Step 3: Create Units
    for (const row of unitsData) {
      try {
        const projectId = projectMap.get(row.project_name);
        if (!projectId) {
          errors.push(`Unit "${row.unit_title}": Project "${row.project_name}" not found`);
          continue;
        }

        // Build images array
        const images: string[] = [];
        for (let i = 1; i <= 5; i++) {
          const imageUrl = row[`image_url_${i}`];
          if (imageUrl) images.push(imageUrl);
        }

        await prisma.property.create({
          data: {
            title: row.unit_title,
            description: row.description,
            price: row.price ? parseFloat(row.price) : null,
            rentPrice: row.rent_price ? parseFloat(row.rent_price) : null,
            address: '', // Will use project address
            city: 'Pattaya', // Default
            state: 'Chonburi',
            zipCode: '20150',
            category: row.category as any,
            listingType: row.listing_type as any,
            status: row.status as any,
            bedrooms: row.bedrooms ? parseInt(row.bedrooms) : null,
            bathrooms: row.bathrooms ? parseInt(row.bathrooms) : null,
            size: parseInt(row.size),
            floor: row.floor ? parseInt(row.floor) : null,
            petFriendly: row.pet_friendly?.toUpperCase() === 'TRUE',
            furnished: row.furnished?.toUpperCase() === 'TRUE',
            pool: row.pool?.toUpperCase() === 'TRUE',
            garden: row.garden?.toUpperCase() === 'TRUE',
            parking: row.parking ? parseInt(row.parking) : null,
            commissionRate: row.commission_rate ? parseFloat(row.commission_rate) : null,
            agentCommissionRate: row.agent_commission_rate ? parseFloat(row.agent_commission_rate) : null,
            images: images,
            projectId: projectId,
          }
        });
        
        unitsCreated++;
      } catch (error) {
        errors.push(`Unit "${row.unit_title}": ${String(error)}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed! Created ${projectsCreated} projects, ${facilitiesCreated} facilities, ${unitsCreated} units`,
      stats: {
        projectsCreated,
        facilitiesCreated,
        unitsCreated,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({
      success: false,
      message: 'Import failed',
      errors: [String(error)]
    }, { status: 500 });
  }
}
