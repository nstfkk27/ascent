import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { generateReferenceId, generateUniqueSlug } from '@/utils/propertyHelpers';

// Helper to parse CSV text into array of objects (RFC 4180 compliant)
// Handles quoted fields with commas and newlines
function parseCSV(text: string): Record<string, string>[] {
  const result: string[][] = [];
  let current = '';
  let currentRow: string[] = [];
  let inQuotes = false;
  
  // Parse entire CSV character by character
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote - add one quote and skip next
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      currentRow.push(current.trim());
      current = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // Row separator (handle both \n and \r\n)
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip \n in \r\n
      }
      
      // Add last field and row
      if (current || currentRow.length > 0) {
        currentRow.push(current.trim());
        if (currentRow.some(field => field.length > 0)) {
          result.push(currentRow);
        }
        currentRow = [];
        current = '';
      }
    } else {
      // Regular character (including newlines inside quotes)
      current += char;
    }
  }
  
  // Add final field and row if exists
  if (current || currentRow.length > 0) {
    currentRow.push(current.trim());
    if (currentRow.some(field => field.length > 0)) {
      result.push(currentRow);
    }
  }
  
  if (result.length < 2) return [];
  
  const headers = result[0];
  const dataRows = result.slice(1);
  
  return dataRows.map(row => {
    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header] = row[idx] || '';
    });
    return obj;
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createClient();
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
    const projectsFile = formData.get('projects') as File | null;
    const facilitiesFile = formData.get('facilities') as File | null;
    const unitsFile = formData.get('units') as File | null;

    // At least one CSV file must be provided
    if (!projectsFile && !facilitiesFile && !unitsFile) {
      return NextResponse.json({ 
        success: false, 
        message: 'No CSV files provided',
        errors: ['Please upload at least one CSV file (Projects, Facilities, or Units)']
      }, { status: 400 });
    }

    // Read CSV files
    const projectsText = projectsFile ? await projectsFile.text() : '';
    const facilitiesText = facilitiesFile ? await facilitiesFile.text() : '';
    const unitsText = unitsFile ? await unitsFile.text() : '';

    // Parse CSVs
    const projectsData = projectsFile ? parseCSV(projectsText) : [];
    const facilitiesData = facilitiesFile ? parseCSV(facilitiesText) : [];
    const unitsData = unitsFile ? parseCSV(unitsText) : [];

    const errors: string[] = [];
    let projectsCreated = 0;
    let projectsUpdated = 0;
    let facilitiesCreated = 0;
    let unitsCreated = 0;

    // Step 1: Create or Update Projects
    const projectMap = new Map<string, string>(); // project_name -> project_id
    
    for (const row of projectsData) {
      try {
        // Check if project already exists by name
        const existingProject = await prisma.project.findFirst({
          where: { name: row.project_name }
        });

        const projectData = {
          name: row.project_name,
          nameTh: row.project_name_th || null,
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
        };

        let project;
        if (existingProject) {
          // Update existing project
          project = await prisma.project.update({
            where: { id: existingProject.id },
            data: projectData
          });
          projectsUpdated++;
        } else {
          // Create new project
          project = await prisma.project.create({
            data: projectData
          });
          projectsCreated++;
        }
        
        projectMap.set(row.project_name, project.id);
      } catch (error) {
        errors.push(`Project "${row.project_name}": ${String(error)}`);
      }
    }

    // Step 2: Create Facilities (if provided)
    for (const row of facilitiesData) {
      try {
        // First check projectMap (if projects were uploaded in same batch)
        let projectId = projectMap.get(row.project_name);
        
        // If not in map, look up existing project in database
        if (!projectId) {
          const existingProject = await prisma.project.findFirst({
            where: { name: row.project_name }
          });
          
          if (existingProject) {
            projectId = existingProject.id;
          } else {
            errors.push(`Facility "${row.facility_name}": Project "${row.project_name}" not found in database`);
            continue;
          }
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

    // Step 3: Create Units (if provided)
    for (const row of unitsData) {
      try {
        // First check projectMap (if projects were uploaded in same batch)
        let projectId = projectMap.get(row.project_name);
        
        // If not in map, look up existing project in database
        if (!projectId) {
          const existingProject = await prisma.project.findFirst({
            where: { name: row.project_name }
          });
          
          if (existingProject) {
            projectId = existingProject.id;
          } else {
            errors.push(`Unit "${row.unit_title}": Project "${row.project_name}" not found in database`);
            continue;
          }
        }

        // Build images array from comma-separated string
        const images: string[] = [];
        if (row.images) {
          // Split by comma and trim whitespace
          const imageUrls = row.images.split(',').map(url => url.trim()).filter(url => url.length > 0);
          images.push(...imageUrls);
        }

        await prisma.property.create({
          data: {
            referenceId: await generateReferenceId(),
            slug: await generateUniqueSlug(row.unit_title),
            title: row.unit_title,
            description: row.description,
            price: row.price ? parseFloat(row.price) : null,
            rentPrice: row.rent_price ? parseFloat(row.rent_price) : null,
            address: '', // Will use project address
            city: 'Pattaya', // Default
            state: 'Chonburi',
            zipCode: '20150',
            category: row.category as any,
            houseType: row.house_type as any || null,
            investmentType: row.investment_type as any || null,
            area: row.area || null,
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
            latitude: row.latitude ? parseFloat(row.latitude) : null,
            longitude: row.longitude ? parseFloat(row.longitude) : null,
            ownerContactDetails: row.owner_contact || null,
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
      message: `Import completed! Created ${projectsCreated} projects, updated ${projectsUpdated} projects, ${facilitiesCreated} facilities, ${unitsCreated} units`,
      stats: {
        projectsCreated,
        projectsUpdated,
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
