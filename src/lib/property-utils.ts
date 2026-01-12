
export function sanitizePropertyData(data: any) {
  const cleanData = { ...data };
  const category = cleanData.category;

  // Filter out null/empty/invalid image URLs
  if (cleanData.images && Array.isArray(cleanData.images)) {
    cleanData.images = cleanData.images.filter((url: any) => url && typeof url === 'string' && url.trim() !== '');
  }
  
  // Remove category-inappropriate fields
  if (category === 'LAND') {
    // LAND cannot have these fields
    delete cleanData.petFriendly;
    delete cleanData.furnished;
    delete cleanData.bedrooms;
    delete cleanData.bathrooms;
    delete cleanData.floors;
  }
  
  if (category === 'INVESTMENT') {
    // INVESTMENT doesn't use these residential fields
    delete cleanData.petFriendly;
    delete cleanData.furnished;
  }

  // Common fields that shouldn't be touched unless necessary
  // ...

  // Delete fields that don't exist in schema anymore
  delete cleanData.garden;
  delete cleanData.pool;
  delete cleanData.openForYears;

  if (category === 'HOUSE') {
    // Clear Condo specific fields
    // We allow projectName for Houses to store the "Village Name" or "Mooban"
    cleanData.floor = null;

    // Clear Investment specific fields
    cleanData.investmentType = null;
    cleanData.equipmentIncluded = null;
    cleanData.numberOfStaff = null;
    cleanData.monthlyRevenue = null;
    cleanData.license = null;
    cleanData.conferenceRoom = null;
    cleanData.landZoneColor = null;
  } else if (category === 'CONDO') {
    // Clear House specific fields
    cleanData.houseType = null;
    cleanData.floors = null; // Number of floors (usually for house)

    // Clear Investment specific fields
    cleanData.investmentType = null;
    cleanData.equipmentIncluded = null;
    cleanData.numberOfStaff = null;
    cleanData.monthlyRevenue = null;
    cleanData.license = null;
    cleanData.conferenceRoom = null;
    cleanData.landZoneColor = null;
  } else if (category === 'INVESTMENT') {
    // Clear House specific fields
    cleanData.houseType = null;
    cleanData.floors = null;

    // Clear Condo specific fields
    cleanData.projectName = null;
    cleanData.floor = null;
    
    cleanData.landZoneColor = null;
  } else if (category === 'LAND') {
    // Clear House specific fields
    cleanData.houseType = null;
    cleanData.bedrooms = null;
    cleanData.bathrooms = null;
    cleanData.floors = null;
    cleanData.parking = null;
    cleanData.furnished = null;
    cleanData.petFriendly = null;
    
    // Clear Condo specific fields
    cleanData.floor = null;
    // We might keep projectName for Land if it's land in a village/project

    // Clear Investment (Business) specific fields
    cleanData.investmentType = null;
    cleanData.equipmentIncluded = null;
    cleanData.numberOfStaff = null;
    cleanData.monthlyRevenue = null;
    cleanData.license = null;
    cleanData.conferenceRoom = null;
  }

  return cleanData;
}
