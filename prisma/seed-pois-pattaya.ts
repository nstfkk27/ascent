// POI Seed Data for Pattaya/Jomtien Area
// Run with: npx tsx prisma/seed-pois-pattaya.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PATTAYA_POIS = [
  // BEACHES
  { name: 'Jomtien Beach', nameTh: 'หาดจอมเทียน', type: 'BEACH', lat: 12.8886, lng: 100.8742, city: 'Pattaya', area: 'Jomtien' },
  { name: 'Pattaya Beach', nameTh: 'หาดพัทยา', type: 'BEACH', lat: 12.9266, lng: 100.8688, city: 'Pattaya', area: 'Central Pattaya' },
  { name: 'Wong Amat Beach', nameTh: 'หาดวงศ์อมาตย์', type: 'BEACH', lat: 12.9667, lng: 100.8833, city: 'Pattaya', area: 'Naklua' },
  { name: 'Na Jomtien Beach', nameTh: 'หาดนาจอมเทียน', type: 'BEACH', lat: 12.8333, lng: 100.9000, city: 'Pattaya', area: 'Na Jomtien' },
  { name: 'Dongtan Beach', nameTh: 'หาดดงตาล', type: 'BEACH', lat: 12.9033, lng: 100.8678, city: 'Pattaya', area: 'Jomtien' },

  // HOSPITALS
  { name: 'Bangkok Hospital Pattaya', nameTh: 'โรงพยาบาลกรุงเทพพัทยา', type: 'HOSPITAL', lat: 12.9292, lng: 100.8987, city: 'Pattaya', area: 'Central Pattaya' },
  { name: 'Pattaya Memorial Hospital', nameTh: 'โรงพยาบาลพัทยาเมมโมเรียล', type: 'HOSPITAL', lat: 12.9356, lng: 100.8889, city: 'Pattaya', area: 'Central Pattaya' },
  { name: 'Pattaya International Hospital', nameTh: 'โรงพยาบาลพัทยาอินเตอร์เนชั่นแนล', type: 'HOSPITAL', lat: 12.9458, lng: 100.8842, city: 'Pattaya', area: 'North Pattaya' },
  { name: 'Queen Sirikit Hospital', nameTh: 'โรงพยาบาลสมเด็จพระนางเจ้าสิริกิติ์', type: 'HOSPITAL', lat: 12.9128, lng: 100.9122, city: 'Pattaya', area: 'Sattahip' },

  // SHOPPING MALLS
  { name: 'Central Festival Pattaya Beach', nameTh: 'เซ็นทรัล เฟสติวัล พัทยาบีช', type: 'SHOPPING_MALL', lat: 12.9358, lng: 100.8847, city: 'Pattaya', area: 'Central Pattaya' },
  { name: 'Terminal 21 Pattaya', nameTh: 'เทอร์มินอล 21 พัทยา', type: 'SHOPPING_MALL', lat: 12.9478, lng: 100.8878, city: 'Pattaya', area: 'North Pattaya' },
  { name: 'Central Marina', nameTh: 'เซ็นทรัล มารีน่า', type: 'SHOPPING_MALL', lat: 12.9544, lng: 100.8900, city: 'Pattaya', area: 'North Pattaya' },
  { name: 'Big C Pattaya Klang', nameTh: 'บิ๊กซี พัทยากลาง', type: 'SHOPPING_MALL', lat: 12.9267, lng: 100.8922, city: 'Pattaya', area: 'Central Pattaya' },
  { name: 'Tesco Lotus South Pattaya', nameTh: 'เทสโก้ โลตัส พัทยาใต้', type: 'SHOPPING_MALL', lat: 12.9111, lng: 100.8856, city: 'Pattaya', area: 'South Pattaya' },

  // INTERNATIONAL SCHOOLS
  { name: 'Regents International School Pattaya', nameTh: 'โรงเรียนนานาชาติรีเจ้นท์พัทยา', type: 'INTERNATIONAL_SCHOOL', lat: 12.8522, lng: 100.9056, city: 'Pattaya', area: 'Banglamung' },
  { name: 'St. Andrews International School', nameTh: 'โรงเรียนนานาชาติเซนต์แอนดรูว์ส', type: 'INTERNATIONAL_SCHOOL', lat: 12.8744, lng: 100.9178, city: 'Pattaya', area: 'Jomtien' },
  { name: 'Rugby School Thailand', nameTh: 'โรงเรียนรักบี้ ไทยแลนด์', type: 'INTERNATIONAL_SCHOOL', lat: 12.8356, lng: 100.9211, city: 'Pattaya', area: 'Banglamung' },
  { name: 'ISE Pattaya', nameTh: 'โรงเรียนนานาชาติ ISE', type: 'INTERNATIONAL_SCHOOL', lat: 12.9289, lng: 100.9044, city: 'Pattaya', area: 'Central Pattaya' },

  // SUPERMARKETS
  { name: 'Makro Pattaya', nameTh: 'แม็คโคร พัทยา', type: 'SUPERMARKET', lat: 12.9556, lng: 100.9033, city: 'Pattaya', area: 'North Pattaya' },
  { name: 'Big C Extra Pattaya', nameTh: 'บิ๊กซี เอ็กซ์ตร้า', type: 'SUPERMARKET', lat: 12.9522, lng: 100.8989, city: 'Pattaya', area: 'North Pattaya' },
  { name: 'Foodland Pattaya Klang', nameTh: 'ฟู้ดแลนด์ พัทยากลาง', type: 'SUPERMARKET', lat: 12.9311, lng: 100.8867, city: 'Pattaya', area: 'Central Pattaya' },

  // PARKS
  { name: 'Nong Nooch Tropical Garden', nameTh: 'สวนนงนุช', type: 'PARK', lat: 12.7622, lng: 100.9344, city: 'Pattaya', area: 'Na Jomtien' },
  { name: 'Pattaya Viewpoint (Khao Phra Tamnak)', nameTh: 'จุดชมวิวเขาพระตำหนัก', type: 'PARK', lat: 12.9133, lng: 100.8644, city: 'Pattaya', area: 'Pratumnak' },

  // GOLF COURSES
  { name: 'Siam Country Club Pattaya', nameTh: 'สยามคันทรีคลับ', type: 'GOLF_COURSE', lat: 12.9433, lng: 100.9522, city: 'Pattaya', area: 'East Pattaya' },
  { name: 'Laem Chabang Golf Course', nameTh: 'สนามกอล์ฟแหลมฉบัง', type: 'GOLF_COURSE', lat: 13.0656, lng: 100.9156, city: 'Chonburi', area: 'Laem Chabang' },
  { name: 'Phoenix Gold Golf & Country Club', nameTh: 'ฟีนิกซ์โกลด์กอล์ฟ', type: 'GOLF_COURSE', lat: 12.8900, lng: 100.9356, city: 'Pattaya', area: 'East Pattaya' },

  // NIGHTLIFE
  { name: 'Walking Street', nameTh: 'ถนนคนเดิน', type: 'NIGHTLIFE', lat: 12.9267, lng: 100.8711, city: 'Pattaya', area: 'South Pattaya' },
  { name: 'Soi Buakhao', nameTh: 'ซอยบัวขาว', type: 'NIGHTLIFE', lat: 12.9289, lng: 100.8833, city: 'Pattaya', area: 'Central Pattaya' },

  // TRANSPORTATION
  { name: 'U-Tapao International Airport', nameTh: 'สนามบินอู่ตะเภา', type: 'AIRPORT', lat: 12.6800, lng: 101.0050, city: 'Rayong', area: 'U-Tapao' },

  // IMMIGRATION
  { name: 'Pattaya Immigration Office', nameTh: 'ตรวจคนเข้าเมืองพัทยา', type: 'IMMIGRATION', lat: 12.8856, lng: 100.9122, city: 'Pattaya', area: 'Jomtien' },

  // TEMPLES
  { name: 'Sanctuary of Truth', nameTh: 'ปราสาทสัจธรรม', type: 'TEMPLE', lat: 12.9689, lng: 100.8878, city: 'Pattaya', area: 'Naklua' },
  { name: 'Wat Phra Yai (Big Buddha)', nameTh: 'วัดพระใหญ่', type: 'TEMPLE', lat: 12.9167, lng: 100.8589, city: 'Pattaya', area: 'Pratumnak' },
];

async function seedPOIs() {
  console.log('Seeding POIs for Pattaya area...');
  
  for (const poi of PATTAYA_POIS) {
    await prisma.pointOfInterest.upsert({
      where: { 
        // Use a composite key since we don't have one defined
        id: `${poi.type}-${poi.name}`.replace(/\s/g, '-').toLowerCase()
      },
      update: {
        nameTh: poi.nameTh,
        latitude: poi.lat,
        longitude: poi.lng,
        area: poi.area,
      },
      create: {
        id: `${poi.type}-${poi.name}`.replace(/\s/g, '-').toLowerCase(),
        name: poi.name,
        nameTh: poi.nameTh,
        type: poi.type as any,
        latitude: poi.lat,
        longitude: poi.lng,
        city: poi.city,
        area: poi.area,
        isActive: true,
      },
    });
    console.log(`  ✓ ${poi.name}`);
  }
  
  console.log(`\n✅ Seeded ${PATTAYA_POIS.length} POIs`);
}

seedPOIs()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
