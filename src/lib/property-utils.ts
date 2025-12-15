
export function sanitizePropertyData(data: any) {
  const cleanData = { ...data };
  const category = cleanData.category;

  // Common fields that shouldn't be touched unless necessary
  // ...

  if (category === 'HOUSE') {
    // Clear Condo specific fields
    // We allow projectName for Houses to store the "Village Name" or "Mooban"
    cleanData.floor = null;
    cleanData.unitFeatures = cleanData.unitFeatures || null; // Keep unit features for houses

    // Clear Investment specific fields
    cleanData.investmentType = null;
    cleanData.openForYears = null;
    cleanData.equipmentIncluded = null;
    cleanData.numberOfStaff = null;
    cleanData.monthlyRevenue = null;
    cleanData.license = null;
    cleanData.conferenceRoom = null;
    cleanData.landZoneColor = null;
  } else if (category === 'CONDO') {
    // Clear House specific fields
    cleanData.houseType = null;
    cleanData.garden = null;
    cleanData.pool = null; 
    cleanData.floors = null; // Number of floors (usually for house)

    // Clear Investment specific fields
    cleanData.investmentType = null;
    cleanData.openForYears = null;
    cleanData.equipmentIncluded = null;
    cleanData.numberOfStaff = null;
    cleanData.monthlyRevenue = null;
    cleanData.license = null;
    cleanData.conferenceRoom = null;
    cleanData.landZoneColor = null;
  } else if (category === 'INVESTMENT') {
    // Clear House specific fields
    cleanData.houseType = null;
    cleanData.garden = null;
    cleanData.pool = null;
    cleanData.floors = null;
    
    // Clear Condition (applies to House/Condo units)
    cleanData.condition = null;

    // Clear Condo specific fields
    cleanData.projectName = null;
    cleanData.floor = null;
    cleanData.unitFeatures = null;
    
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
    cleanData.pool = null;
    cleanData.garden = null;
    
    // Clear Condition
    cleanData.condition = null;

    // Clear Condo specific fields
    cleanData.floor = null;
    cleanData.unitFeatures = null;
    // We might keep projectName for Land if it's land in a village/project

    // Clear Investment (Business) specific fields
    cleanData.investmentType = null;
    cleanData.openForYears = null;
    cleanData.equipmentIncluded = null;
    cleanData.numberOfStaff = null;
    cleanData.monthlyRevenue = null;
    cleanData.license = null;
    cleanData.conferenceRoom = null;
  }

  return cleanData;
}
