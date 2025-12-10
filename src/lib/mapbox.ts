
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface GeocodingResult {
  address: string;
  city: string;
  zipCode: string;
  lat: number;
  lng: number;
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  if (!MAPBOX_TOKEN) return null;

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,poi`
    );
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const context = feature.context || [];
      
      const city = context.find((c: any) => c.id.startsWith('place'))?.text || 
                   context.find((c: any) => c.id.startsWith('district'))?.text || '';
      
      const zipCode = context.find((c: any) => c.id.startsWith('postcode'))?.text || '';
      
      return {
        address: feature.place_name, // Full address
        city,
        zipCode,
        lat,
        lng
      };
    }
  } catch (error) {
    console.error('Error reverse geocoding:', error);
  }
  return null;
}

export async function searchAddress(query: string): Promise<GeocodingResult[]> {
  if (!MAPBOX_TOKEN || !query) return [];

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=th`
    );
    const data = await response.json();

    return data.features.map((feature: any) => {
      const context = feature.context || [];
      const city = context.find((c: any) => c.id.startsWith('place'))?.text || 
                   context.find((c: any) => c.id.startsWith('district'))?.text || '';
      const zipCode = context.find((c: any) => c.id.startsWith('postcode'))?.text || '';

      return {
        address: feature.place_name,
        city,
        zipCode,
        lat: feature.center[1],
        lng: feature.center[0]
      };
    });
  } catch (error) {
    console.error('Error searching address:', error);
    return [];
  }
}
