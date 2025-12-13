'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Map, { Marker, MapMouseEvent, MarkerDragEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  PROPERTY_CATEGORIES, 
  CATEGORY_SUBTYPES, 
  PROPERTY_SUBTYPES, 
  SUBTYPE_FEATURES, 
  EQUIPMENT_LEVELS, 
  CONDO_FACILITIES,
  CONDO_VIEWS,
  HOUSE_FACILITIES,
  HOUSE_AMENITIES,
  INVESTMENT_AMENITIES,
  PATTAYA_AREAS
} from '@/lib/constants';

interface ListingFormData {
  title: string;
  price: number;
  rentPrice: number;
  size: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  address: string;
  city: string;
  area: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  category: string;
  listingType: string;
  subtype: string;
  floors: number;
  parking: number;
  furnished: boolean;
  pool: boolean;
  garden: boolean;
  projectName: string;
  openForYears: number;
  numberOfStaff: number;
  equipmentIncluded: string;
  landZoneColor: string;
  conferenceRoom: boolean;
  commissionRate: number;
  commissionAmount: number;
  coAgentCommissionRate: number;
  selectedAmenities: string[];
}

const formatNumber = (num: number) => {
  if (!num) return '';
  return num.toLocaleString();
};

export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  // Project Autocomplete State
  const [projectSuggestions, setProjectSuggestions] = useState<any[]>([]);
  const [showProjectSuggestions, setShowProjectSuggestions] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    price: 0,
    rentPrice: 0,
    size: 0,
    bedrooms: 0,
    bathrooms: 0,
    description: '',
    address: '',
    city: 'Pattaya',
    area: '',
    state: 'Chon Buri',
    zipCode: '20150',
    latitude: 12.9236,
    longitude: 100.8825,
    category: 'CONDO',
    listingType: 'SALE',
    
    // Dynamic Fields
    subtype: '',
    floors: 0,
    parking: 0,
    furnished: false,
    pool: false,
    garden: false,
    projectName: '',
    
    // Investment Specific
    openForYears: 0,
    numberOfStaff: 0,
    equipmentIncluded: 'FULLY',
    landZoneColor: '',
    conferenceRoom: false,

    // Commission
    commissionRate: 0,
    commissionAmount: 0,
    coAgentCommissionRate: 0,
    
    // Amenities
    selectedAmenities: [] as string[],
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`/api/properties/${params.id}`);
        const data = await res.json();
        
        if (data.success) {
          const p = data.data;
          
          // Map API data back to form state
          const amenitiesList: string[] = [];
          if (p.amenities) {
             // If amenities is an object/json, extract keys that are true
             Object.entries(p.amenities).forEach(([key, val]) => {
               if (val === true) amenitiesList.push(key);
             });
          }

          // Also check boolean columns and add to amenities list for UI consistency if needed
          // But our toggleAmenity logic relies on this list.
          
          setFormData({
            title: p.title,
            price: Number(p.price),
            rentPrice: Number(p.rentPrice || 0),
            size: p.size,
            bedrooms: p.bedrooms || 0,
            bathrooms: p.bathrooms || 0,
            description: p.description,
            address: p.address,
            city: p.city,
            area: p.area || '',
            state: p.state,
            zipCode: p.zipCode,
            latitude: p.latitude ? Number(p.latitude) : 12.9236,
            longitude: p.longitude ? Number(p.longitude) : 100.8825,
            category: p.category,
            listingType: p.listingType,
            
            subtype: p.houseType || p.investmentType || '',
            floors: p.floors || 0,
            parking: p.parking || 0,
            furnished: p.furnished || false,
            pool: p.pool || false,
            garden: p.garden || false,
            projectName: p.projectName || '',
            
            openForYears: p.openForYears || 0,
            numberOfStaff: p.numberOfStaff || 0,
            equipmentIncluded: p.equipmentIncluded || 'FULLY',
            landZoneColor: p.amenities?.landZoneColor || '', // Extract landZoneColor from JSON if stored there
            conferenceRoom: p.conferenceRoom || false,

            commissionRate: Number(p.commissionRate || 0),
            commissionAmount: Number(p.commissionAmount || 0),
            coAgentCommissionRate: Number(p.coAgentCommissionRate || 0),
            
            selectedAmenities: amenitiesList,
          });
          
          setUploadedImages(p.images || []);
        }
      } catch (error) {
        console.error('Failed to fetch property', error);
        alert('Error loading property details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProperty();
  }, [params.id]);

  const shouldShowField = (fieldName: string) => {
    if (!formData.subtype) {
      if (formData.category === 'CONDO') return ['bedrooms', 'bathrooms', 'size', 'floors', 'parking', 'furnished', 'projectName'].includes(fieldName);
      if (formData.category === 'HOUSE') return ['bedrooms', 'bathrooms', 'size', 'floors', 'parking', 'furnished', 'projectName'].includes(fieldName);
      return ['size'].includes(fieldName);
    }
    const features = SUBTYPE_FEATURES[formData.subtype as keyof typeof SUBTYPE_FEATURES] as readonly string[] || [];
    return features.includes(fieldName);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const files = Array.from(e.target.files);
    const newImages: string[] = [];

    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('properties')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          newImages.push(URL.createObjectURL(file));
        } else {
          const { data } = supabase.storage.from('properties').getPublicUrl(filePath);
          newImages.push(data.publicUrl);
        }
      }
      setUploadedImages(prev => [...prev, ...newImages]);
    } catch (err) {
      console.error('Supabase client error:', err);
      files.forEach(f => newImages.push(URL.createObjectURL(f)));
      setUploadedImages(prev => [...prev, ...newImages]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    if (type === 'number') {
      finalValue = parseFloat(value) || 0;
    } else if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    }

    if (name === 'price' || name === 'rentPrice' || name === 'commissionAmount') {
      finalValue = parseFloat(value.replace(/,/g, '')) || 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleGeocode = async () => {
    if (!formData.address || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return;
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(formData.address)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&limit=1`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    }
  };

  const handleReverseGeocode = async (lat: number, lng: number) => {
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return;
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&limit=1`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          address: data.features[0].place_name,
          latitude: lat,
          longitude: lng
        }));
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
  };

  const handleProjectSearch = async (query: string) => {
    setFormData(prev => ({ ...prev, projectName: query }));
    if (query.length < 2) {
      setProjectSuggestions([]);
      setShowProjectSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`/api/projects?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.projects) {
        setProjectSuggestions(data.projects);
        setShowProjectSuggestions(true);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const selectProject = (project: any) => {
    setFormData(prev => ({ 
      ...prev, 
      projectName: project.name,
      address: project.address || prev.address,
      city: project.city || prev.city,
      latitude: project.lat ? Number(project.lat) : prev.latitude,
      longitude: project.lng ? Number(project.lng) : prev.longitude
    }));
    setShowProjectSuggestions(false);
  };

  const toggleAmenity = (amenityId: string) => {
    setFormData(prev => {
      const current = prev.selectedAmenities;
      if (current.includes(amenityId)) {
        return { ...prev, selectedAmenities: current.filter(id => id !== amenityId) };
      } else {
        return { ...prev, selectedAmenities: [...current, amenityId] };
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: any = {
        ...formData,
        images: uploadedImages,
        amenities: {},
      };

      formData.selectedAmenities.forEach(id => {
        payload.amenities[id] = true;
      });

      if (formData.category === 'HOUSE') {
        payload.houseType = formData.subtype;
        if (formData.selectedAmenities.includes('privatePool')) payload.pool = true;
        if (formData.selectedAmenities.includes('privateGarden')) payload.garden = true;
      } else if (formData.category === 'CONDO') {
        if (formData.selectedAmenities.includes('swimmingPool')) payload.pool = true;
        if (formData.selectedAmenities.includes('garden')) payload.garden = true;
      } else if (formData.category === 'INVESTMENT') {
        payload.investmentType = formData.subtype;
        payload.conferenceRoom = formData.conferenceRoom;
        payload.pool = formData.pool;
        if (formData.landZoneColor) payload.landZoneColor = formData.landZoneColor;
      }

      const res = await fetch(`/api/properties/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Property updated successfully!');
        router.push('/agent');
      } else {
        const error = await res.json();
        alert('Error updating property: ' + error.error);
      }
    } catch (err) {
      alert('Failed to update property');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading property details...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Edit Listing</h1>
          <p className="text-gray-600">Update property details and images.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Images Section (Left) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <p className="text-gray-500 text-sm">
                {isUploading ? 'Uploading...' : 'Drag & drop images or click to select'}
              </p>
            </div>
            
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square bg-gray-100 rounded overflow-hidden border group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Section (Right) */}
        <div className="lg:col-span-8">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">Listing Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              {shouldShowField('projectName') && (
                <div className="col-span-2 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input 
                    type="text" 
                    name="projectName"
                    value={formData.projectName}
                    onChange={(e) => handleProjectSearch(e.target.value)}
                    onFocus={() => formData.projectName.length >= 2 && setShowProjectSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowProjectSuggestions(false), 200)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                    autoComplete="off"
                  />
                  {showProjectSuggestions && projectSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b shadow-lg max-h-60 overflow-y-auto">
                      {projectSuggestions.map((proj, idx) => (
                        <div 
                          key={idx}
                          className="p-2 hover:bg-blue-50 cursor-pointer text-sm"
                          onClick={() => selectProject(proj)}
                        >
                          <div className="font-medium">{proj.name}</div>
                          <div className="text-xs text-gray-500">{proj.address}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(PROPERTY_CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {CATEGORY_SUBTYPES[formData.category as keyof typeof CATEGORY_SUBTYPES]?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select 
                    name="subtype"
                    value={formData.subtype}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type...</option>
                    {CATEGORY_SUBTYPES[formData.category as keyof typeof CATEGORY_SUBTYPES].map((key) => (
                      <option key={key} value={key}>
                        {PROPERTY_SUBTYPES[key as keyof typeof PROPERTY_SUBTYPES]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
                <select 
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SALE">For Sale</option>
                  <option value="RENT">For Rent</option>
                  <option value="BOTH">Sale & Rent</option>
                </select>
              </div>

              {(formData.listingType === 'SALE' || formData.listingType === 'BOTH') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (THB) *</label>
                  <input 
                    type="text" 
                    name="price"
                    value={formatNumber(formData.price)}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-gray-900" 
                  />
                </div>
              )}

              {(formData.listingType === 'RENT' || formData.listingType === 'BOTH') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rental Price (THB/Month) *</label>
                  <input 
                    type="text" 
                    name="rentPrice"
                    value={formatNumber(formData.rentPrice)}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-gray-900" 
                  />
                </div>
              )}

              {/* Commission Section */}
              <div className="col-span-2 border-t pt-4 mt-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Commission Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%)</label>
                    <input 
                      type="number" 
                      name="commissionRate"
                      value={formData.commissionRate}
                      onChange={handleChange}
                      step="0.1"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commission Amount (THB)</label>
                    <input 
                      type="text" 
                      name="commissionAmount"
                      value={formatNumber(formData.commissionAmount)}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Co-Agent Rate (%)</label>
                    <input 
                      type="number" 
                      name="coAgentCommissionRate"
                      value={formData.coAgentCommissionRate}
                      onChange={handleChange}
                      step="0.1"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </div>
              </div>

              {shouldShowField('bedrooms') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.subtype === 'HOTEL' ? 'Number of Rooms' : 'Bedrooms'}
                  </label>
                  <input 
                    type="number" 
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              )}

              {shouldShowField('bathrooms') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <input 
                    type="number" 
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              )}

              {shouldShowField('size') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.subtype === 'LAND' ? 'Land Size (sqm)' : 'Size (sqm)'} *
                  </label>
                  <input 
                    type="number" 
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              )}

              {shouldShowField('floors') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floors</label>
                  <input 
                    type="number" 
                    name="floors"
                    value={formData.floors}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              )}

              {shouldShowField('parking') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parking Spaces</label>
                  <input 
                    type="number" 
                    name="parking"
                    value={formData.parking}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              )}

              {shouldShowField('openForYears') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Open For (Years)</label>
                  <input 
                    type="number" 
                    name="openForYears"
                    value={formData.openForYears}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              )}

              {shouldShowField('numberOfStaff') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Staff</label>
                  <input 
                    type="number" 
                    name="numberOfStaff"
                    value={formData.numberOfStaff}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              )}

              {shouldShowField('equipmentIncluded') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                  <select 
                    name="equipmentIncluded"
                    value={formData.equipmentIncluded}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(EQUIPMENT_LEVELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              )}

              {shouldShowField('landZoneColor') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Land Zone Color</label>
                  <select 
                    name="landZoneColor"
                    value={formData.landZoneColor}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Zone Color</option>
                    <option value="RED">Red (Commercial)</option>
                    <option value="ORANGE">Orange (High Density)</option>
                    <option value="YELLOW">Yellow (Low Density)</option>
                    <option value="BROWN">Brown (Special)</option>
                    <option value="PURPLE">Purple (Industrial)</option>
                    <option value="GREEN">Green (Rural/Agri)</option>
                  </select>
                </div>
              )}

              {/* Amenities / Facilities Section */}
              {formData.category === 'HOUSE' && (
                <>
                  <div className="col-span-2 mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      {HOUSE_AMENITIES.map((item) => (
                        <label key={item.id} className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.selectedAmenities.includes(item.id)}
                            onChange={() => toggleAmenity(item.id)}
                            className="rounded text-blue-600 focus:ring-blue-500" 
                          />
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      {HOUSE_FACILITIES.map((item) => (
                        <label key={item.id} className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.selectedAmenities.includes(item.id)}
                            onChange={() => toggleAmenity(item.id)}
                            className="rounded text-blue-600 focus:ring-blue-500" 
                          />
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {formData.category === 'CONDO' && (
                <>
                  <div className="col-span-2 mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Views</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      {CONDO_VIEWS.map((item) => (
                        <label key={item.id} className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.selectedAmenities.includes(item.id)}
                            onChange={() => toggleAmenity(item.id)}
                            className="rounded text-blue-600 focus:ring-blue-500" 
                          />
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      {CONDO_FACILITIES.map((item) => (
                        <label key={item.id} className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.selectedAmenities.includes(item.id)}
                            onChange={() => toggleAmenity(item.id)}
                            className="rounded text-blue-600 focus:ring-blue-500" 
                          />
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {formData.category === 'INVESTMENT' && (
                <div className="col-span-2 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {INVESTMENT_AMENITIES.map((item) => (
                      <label key={item.id} className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.selectedAmenities.includes(item.id)}
                          onChange={() => toggleAmenity(item.id)}
                          className="rounded text-blue-600 focus:ring-blue-500" 
                        />
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {shouldShowField('furnished') && (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="furnished"
                      checked={formData.furnished}
                      onChange={handleChange}
                      className="rounded text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-sm text-gray-700">Furnished</span>
                  </label>
                )}
                
                {shouldShowField('pool') && formData.category === 'INVESTMENT' && (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="pool"
                      checked={formData.pool}
                      onChange={handleChange}
                      className="rounded text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-sm text-gray-700">Swimming Pool</span>
                  </label>
                )}

                {shouldShowField('garden') && formData.category === 'INVESTMENT' && (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="garden"
                      checked={formData.garden}
                      onChange={handleChange}
                      className="rounded text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-sm text-gray-700">Garden</span>
                  </label>
                )}

                {shouldShowField('conferenceRoom') && (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="conferenceRoom"
                      checked={formData.conferenceRoom}
                      onChange={handleChange}
                      className="rounded text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-sm text-gray-700">Conference Room</span>
                  </label>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address / Location *</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleGeocode();
                      }
                    }}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                  />
                  <button
                    type="button"
                    onClick={handleGeocode}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 border border-gray-300"
                  >
                    🔍
                  </button>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Area / Neighborhood</label>
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Area</option>
                  {PATTAYA_AREAS.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pin Location</label>
                <div className="h-64 rounded-lg overflow-hidden border border-gray-300 relative">
                  {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? (
                    <Map
                      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                      initialViewState={{
                        longitude: formData.longitude,
                        latitude: formData.latitude,
                        zoom: 12
                      }}
                      longitude={formData.longitude}
                      latitude={formData.latitude}
                      style={{width: '100%', height: '100%'}}
                      mapStyle="mapbox://styles/mapbox/streets-v11"
                      onClick={(e: MapMouseEvent) => {
                        handleReverseGeocode(e.lngLat.lat, e.lngLat.lng);
                      }}
                    >
                      <Marker 
                        longitude={formData.longitude} 
                        latitude={formData.latitude} 
                        anchor="bottom" 
                        draggable
                        onDragEnd={(e: MarkerDragEvent) => {
                          handleReverseGeocode(e.lngLat.lat, e.lngLat.lng);
                        }}
                      >
                        <div className="text-2xl cursor-pointer animate-bounce">📍</div>
                      </Marker>
                    </Map>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                      Mapbox Token Missing
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                ></textarea>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t flex gap-4 justify-end">
              <button 
                onClick={() => router.push('/agent')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm"
              >
                {isSaving ? 'Saving...' : '💾 Update Property'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
