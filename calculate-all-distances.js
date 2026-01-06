const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Haversine formula
function calculateDistanceKm(point1, point2) {
  const R = 6371;
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

function estimateWalkingMins(distanceKm) {
  return Math.round((distanceKm / 5) * 60);
}

function estimateDrivingMins(distanceKm) {
  return Math.round((distanceKm / 30) * 60);
}

async function calculateAllDistances() {
  console.log('🚀 Starting POI distance calculation...\n');

  const properties = await prisma.property.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null }
    },
    select: {
      id: true,
      referenceId: true,
      title: true,
      latitude: true,
      longitude: true
    }
  });

  console.log(`📍 Found ${properties.length} properties with coordinates\n`);

  const pois = await prisma.pointOfInterest.findMany({
    where: { isActive: true }
  });

  console.log(`📌 Found ${pois.length} active POIs\n`);

  let totalCalculated = 0;

  for (const property of properties) {
    console.log(`Processing: ${property.referenceId} - ${property.title}`);
    
    const distances = [];
    const nearestByType = {};

    for (const poi of pois) {
      const distanceKm = calculateDistanceKm(
        { lat: Number(property.latitude), lng: Number(property.longitude) },
        { lat: Number(poi.latitude), lng: Number(poi.longitude) }
      );

      const roundedDistance = Math.round(distanceKm * 1000) / 1000;

      distances.push({
        propertyId: property.id,
        poiId: poi.id,
        poiType: poi.type,
        distanceKm: roundedDistance,
        walkingMins: estimateWalkingMins(distanceKm),
        drivingMins: estimateDrivingMins(distanceKm)
      });

      // Track nearest of each type
      if (!nearestByType[poi.type] || roundedDistance < nearestByType[poi.type].distance) {
        nearestByType[poi.type] = {
          distance: roundedDistance,
          name: poi.name
        };
      }
    }

    // Upsert all distances
    for (const d of distances) {
      await prisma.propertyPOIDistance.upsert({
        where: {
          propertyId_poiId: {
            propertyId: d.propertyId,
            poiId: d.poiId
          }
        },
        create: d,
        update: {
          distanceKm: d.distanceKm,
          walkingMins: d.walkingMins,
          drivingMins: d.drivingMins
        }
      });
    }

    // Update property convenience fields
    const updateData = {};
    if (nearestByType.BEACH) {
      updateData.nearestBeachKm = nearestByType.BEACH.distance;
      updateData.nearestBeachName = nearestByType.BEACH.name;
    }
    if (nearestByType.SHOPPING_MALL) {
      updateData.nearestMallKm = nearestByType.SHOPPING_MALL.distance;
      updateData.nearestMallName = nearestByType.SHOPPING_MALL.name;
    }
    if (nearestByType.HOSPITAL) {
      updateData.nearestHospitalKm = nearestByType.HOSPITAL.distance;
      updateData.nearestHospitalName = nearestByType.HOSPITAL.name;
    }
    if (nearestByType.INTERNATIONAL_SCHOOL) {
      updateData.nearestSchoolKm = nearestByType.INTERNATIONAL_SCHOOL.distance;
      updateData.nearestSchoolName = nearestByType.INTERNATIONAL_SCHOOL.name;
    }
    // BTS/MRT share the same field
    if (nearestByType.BTS_STATION || nearestByType.MRT_STATION) {
      const bts = nearestByType.BTS_STATION;
      const mrt = nearestByType.MRT_STATION;
      if (bts && mrt) {
        if (bts.distance < mrt.distance) {
          updateData.nearestBtsKm = bts.distance;
          updateData.nearestBtsName = bts.name;
        } else {
          updateData.nearestBtsKm = mrt.distance;
          updateData.nearestBtsName = mrt.name;
        }
      } else if (bts) {
        updateData.nearestBtsKm = bts.distance;
        updateData.nearestBtsName = bts.name;
      } else if (mrt) {
        updateData.nearestBtsKm = mrt.distance;
        updateData.nearestBtsName = mrt.name;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.property.update({
        where: { id: property.id },
        data: updateData
      });
    }

    totalCalculated += distances.length;
    console.log(`  ✅ Calculated ${distances.length} distances`);
    if (nearestByType.BEACH) {
      console.log(`     🏖️  Nearest beach: ${nearestByType.BEACH.name} (${nearestByType.BEACH.distance} km)`);
    }
  }

  console.log(`\n✨ Done! Calculated ${totalCalculated} total distances for ${properties.length} properties`);
}

calculateAllDistances()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
