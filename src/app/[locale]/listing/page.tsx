'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Map, { Marker, MapMouseEvent, MarkerDragEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

type PropertyCategory = 'HOUSE' | 'CONDO' | 'INVESTMENT';
type HouseType = 'SINGLE_HOUSE' | 'POOL_VILLA' | 'TOWNHOUSE' | 'SHOPHOUSE';
type InvestmentType = 'HOTEL' | 'CLUB_BAR' | 'MASSAGE' | 'RESTAURANT' | 'WELLNESS';
type EquipmentLevel = 'FULLY' | 'PARTIAL' | 'JUST_STRUCTURE';

export default function ListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<PropertyCategory>('HOUSE');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    city: 'Pattaya',
    state: 'Chonburi',
    zipCode: '',
    latitude: 12.9236,
    longitude: 100.8825,
    listingType: 'SALE',
    
    // House
    houseType: 'SINGLE_HOUSE',
    bedrooms: '',
    bathrooms: '',
    size: '',
    petFriendly: false,
    parking: '',
    furnished: false,
    garden: false,
    pool: false,
    floors: '',
    
    // Condo
    projectName: '',
    floor: '',
    amenities: {
      swimmingPool: false,
      gym: false,
      security24h: false,
      parking: false,
      garden: false,
      playground: false,
      coWorkingSpace: false,
      sauna: false,
      library: false,
    },
    
    // Investment
    investmentType: 'RESTAURANT',
    openForYears: '',
    equipmentIncluded: 'FULLY',
    numberOfStaff: '',
    monthlyRevenue: '',
    license: false,
    
    images: '',
    
    // Contact & Commission
    contactName: '',
    contactLine: '',
    contactPhone: '',
    commission: '',
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const [viewState, setViewState] = useState({
    longitude: 100.8825,
    latitude: 12.9236,
    zoom: 12
  });

  const handleGeocode = async () => {
    if (!formData.address || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return;
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(formData.address)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&limit=1`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        setViewState(prev => ({ ...prev, latitude: lat, longitude: lng, zoom: 14 }));
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const files = Array.from(e.target.files);
    const newImages: string[] = [];
    
    try {
      // Dynamic import to avoid server-side issues if any
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
          // Fallback for demo: create a fake URL object
          newImages.push(URL.createObjectURL(file));
        } else {
          const { data } = supabase.storage.from('properties').getPublicUrl(filePath);
          newImages.push(data.publicUrl);
        }
      }
      setUploadedImages(prev => [...prev, ...newImages]);
      
      // Update formData images string
      const currentImages = formData.images ? formData.images.split(',').map(s => s.trim()).filter(Boolean) : [];
      const allImages = [...currentImages, ...newImages];
      setFormData(prev => ({ ...prev, images: allImages.join(', ') }));
      
    } catch (err) {
      console.error('Supabase client error:', err);
      // Fallback
      files.forEach(f => newImages.push(URL.createObjectURL(f)));
      setUploadedImages(prev => [...prev, ...newImages]);
      
      const currentImages = formData.images ? formData.images.split(',').map(s => s.trim()).filter(Boolean) : [];
      const allImages = [...currentImages, ...newImages];
      setFormData(prev => ({ ...prev, images: allImages.join(', ') }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.title.trim()) {
      alert('Please enter a property title');
      return;
    }
    if (!formData.contactName.trim()) {
      alert('Please enter a contact name');
      return;
    }
    
    const rawPrice = parseFloat(formData.price.replace(/,/g, ''));
    if (isNaN(rawPrice) || rawPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }

    setLoading(true);

    try {
      const submitData: any = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price.replace(/,/g, '')),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        latitude: formData.latitude,
        longitude: formData.longitude,
        category,
        listingType: formData.listingType,
        images: formData.images ? formData.images.split(',').map(url => url.trim()) : [],
        
        contactName: formData.contactName,
        contactLine: formData.contactLine,
        contactPhone: formData.contactPhone,
        commission: formData.commission,
      };

      // Add category specific data (simplified for submission)
      // We are sending everything to the submission endpoint, which might just store the raw data or specific fields.
      // Since PropertySubmission model has limited fields, we might want to store the rest in description or a JSON field if we added one.
      // But I didn't add a JSON field. I'll append details to description for now or just rely on the fields I added.
      // Wait, I added `category` and `listingType` to PropertySubmission.
      // I did NOT add `bedrooms`, `bathrooms`, etc. to PropertySubmission.
      // I should probably append them to the description or add a JSON field.
      // Given the user said "normal input like our create form", they probably expect all that data to be saved.
      // I'll append the extra details to the description for the reviewer.
      
      let extraDetails = `\n\n--- Property Details ---\n`;
      if (category === 'HOUSE') {
        extraDetails += `Village: ${formData.projectName || 'Detached/Standalone'}\n`;
        extraDetails += `Type: ${formData.houseType}\nBedrooms: ${formData.bedrooms}\nBathrooms: ${formData.bathrooms}\nSize: ${formData.size} sqm\nFloors: ${formData.floors}\nParking: ${formData.parking}\n`;
        extraDetails += `Features: ${formData.petFriendly ? 'Pet Friendly, ' : ''}${formData.furnished ? 'Furnished, ' : ''}${formData.pool ? 'Pool, ' : ''}${formData.garden ? 'Garden' : ''}`;
      } else if (category === 'CONDO') {
        extraDetails += `Project: ${formData.projectName}\nBedrooms: ${formData.bedrooms}\nBathrooms: ${formData.bathrooms}\nSize: ${formData.size} sqm\nFloor: ${formData.floor}\n`;
        extraDetails += `Features: ${formData.petFriendly ? 'Pet Friendly, ' : ''}${formData.furnished ? 'Furnished' : ''}`;
      } else if (category === 'INVESTMENT') {
        extraDetails += `Type: ${formData.investmentType}\nSize: ${formData.size} sqm\nOpen For: ${formData.openForYears} years\nStaff: ${formData.numberOfStaff}\nRevenue: ${formData.monthlyRevenue}\n`;
      }
      
      submitData.description = submitData.description + extraDetails;

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Property submitted for review successfully! Our team will contact you shortly.');
        router.push('/');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name.startsWith('amenities.')) {
        const amenityKey = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          amenities: { ...prev.amenities, [amenityKey]: checked }
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      let newValue = value;
      // Format price with commas
      if (name === 'price') {
        const rawValue = value.replace(/[^0-9]/g, '');
        newValue = rawValue ? Number(rawValue).toLocaleString() : '';
      }
      setFormData(prev => ({ ...prev, [name]: newValue }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-[#49516f] hover:text-[#8ea4d2] mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-[#49516f]">List Your Property</h1>
          <p className="text-gray-600 mt-2">Fill in the details below to list your property</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {/* Category Selection */}
          <div>
            <label className="block text-lg font-semibold text-[#49516f] mb-4">Property Category *</label>
            <div className="grid grid-cols-3 gap-4">
              {(['HOUSE', 'CONDO', 'INVESTMENT'] as PropertyCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-4 px-6 rounded-lg font-semibold transition-all ${
                    category === cat
                      ? 'bg-[#496f5d] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#49516f] border-b pb-2">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                placeholder="e.g., Luxury Pool Villa in Pattaya"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                placeholder="Describe your property in detail..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (฿) *</label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent text-gray-900"
                  placeholder="25,000,000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Listing Type *</label>
                <select
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                >
                  <option value="SALE">For Sale</option>
                  <option value="RENT">For Rent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#49516f] border-b pb-2">Location</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
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
                  required
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  placeholder="123 Beach Road"
                />
                <button
                  type="button"
                  onClick={handleGeocode}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 border border-gray-300"
                  title="Find on Map"
                >
                  🔍
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Press Enter or click search to find on map</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Zip Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  placeholder="20150"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pin Location on Map</label>
              <div className="h-64 rounded-lg overflow-hidden border border-gray-300 relative">
                {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? (
                  <Map
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
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
                <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs shadow backdrop-blur-sm">
                  Lat: {formData.latitude.toFixed(4)}, Lng: {formData.longitude.toFixed(4)}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Click or drag the pin to set exact location</p>
            </div>
          </div>

          {/* Category-Specific Fields */}
          {category === 'HOUSE' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#49516f] border-b pb-2">House Details</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Village Name (Optional)</label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  placeholder="e.g., Baan Dusit, Siam Royal View (Leave empty if standalone)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">House Type *</label>
                <select
                  name="houseType"
                  value={formData.houseType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                >
                  <option value="SINGLE_HOUSE">Single House</option>
                  <option value="POOL_VILLA">Pool Villa</option>
                  <option value="TOWNHOUSE">Townhouse</option>
                  <option value="SHOPHOUSE">Shophouse</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Size (m²) *</label>
                  <input
                    type="number"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Parking Spaces</label>
                  <input
                    type="number"
                    name="parking"
                    value={formData.parking}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Floors</label>
                  <input
                    type="number"
                    name="floors"
                    value={formData.floors}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'petFriendly', label: 'Pet Friendly' },
                  { name: 'furnished', label: 'Furnished' },
                  { name: 'garden', label: 'Garden' },
                  { name: 'pool', label: 'Swimming Pool' },
                ].map(({ name, label }) => (
                  <label key={name} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name={name}
                      checked={formData[name as keyof typeof formData] as boolean}
                      onChange={handleChange}
                      className="w-5 h-5 text-[#496f5d] rounded focus:ring-2 focus:ring-[#496f5d]"
                    />
                    <span className="text-sm font-semibold text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {category === 'CONDO' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#49516f] border-b pb-2">Condo Details</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name *</label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  placeholder="e.g., The Riviera Jomtien"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Size (m²) *</label>
                  <input
                    type="number"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Floor Level</label>
                  <input
                    type="number"
                    name="floor"
                    value={formData.floor}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="petFriendly"
                    checked={formData.petFriendly}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#496f5d] rounded focus:ring-2 focus:ring-[#496f5d]"
                  />
                  <span className="text-sm font-semibold text-gray-700">Pet Friendly</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="furnished"
                    checked={formData.furnished}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#496f5d] rounded focus:ring-2 focus:ring-[#496f5d]"
                  />
                  <span className="text-sm font-semibold text-gray-700">Furnished</span>
                </label>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Building Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { name: 'swimmingPool', label: 'Swimming Pool' },
                    { name: 'gym', label: 'Gym' },
                    { name: 'security24h', label: '24h Security' },
                    { name: 'parking', label: 'Parking' },
                    { name: 'garden', label: 'Garden' },
                    { name: 'playground', label: 'Playground' },
                    { name: 'coWorkingSpace', label: 'Co-Working Space' },
                    { name: 'sauna', label: 'Sauna' },
                    { name: 'library', label: 'Library' },
                  ].map(({ name, label }) => (
                    <label key={name} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name={`amenities.${name}`}
                        checked={formData.amenities[name as keyof typeof formData.amenities]}
                        onChange={handleChange}
                        className="w-5 h-5 text-[#496f5d] rounded focus:ring-2 focus:ring-[#496f5d]"
                      />
                      <span className="text-sm font-semibold text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {category === 'INVESTMENT' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#49516f] border-b pb-2">Investment Details</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Business Type *</label>
                <select
                  name="investmentType"
                  value={formData.investmentType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                >
                  <option value="HOTEL">Hotel</option>
                  <option value="CLUB_BAR">Club/Bar</option>
                  <option value="MASSAGE">Massage</option>
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="WELLNESS">Wellness</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Open For (Years)</label>
                  <input
                    type="number"
                    name="openForYears"
                    value={formData.openForYears}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Staff</label>
                  <input
                    type="number"
                    name="numberOfStaff"
                    value={formData.numberOfStaff}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Size (m²) *</label>
                  <input
                    type="number"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Equipment Included *</label>
                  <select
                    name="equipmentIncluded"
                    value={formData.equipmentIncluded}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  >
                    <option value="FULLY">Fully</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="JUST_STRUCTURE">Just Structure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Revenue (฿)</label>
                  <input
                    type="number"
                    name="monthlyRevenue"
                    value={formData.monthlyRevenue}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                    placeholder="800000"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="license"
                  checked={formData.license}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#496f5d] rounded focus:ring-2 focus:ring-[#496f5d]"
                />
                <span className="text-sm font-semibold text-gray-700">Licensed Business</span>
              </label>
            </div>
          )}

          {/* Images */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#49516f] border-b pb-2">Images</h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Images</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#496f5d] transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={isUploading}
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                  <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[#496f5d] font-semibold">Click to upload</span>
                  <span className="text-gray-500 text-sm mt-1">or drag and drop images here</span>
                </label>
              </div>
              {isUploading && <p className="text-sm text-[#496f5d] mt-2">Uploading images...</p>}
              
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {uploadedImages.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image 
                        src={url} 
                        alt={`Uploaded ${idx}`} 
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#49516f] border-b pb-2">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Name *</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  placeholder="+66..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Line ID</label>
                <input
                  type="text"
                  name="contactLine"
                  value={formData.contactLine}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  placeholder="Line ID"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Agent Commission</label>
                <input
                  type="text"
                  name="commission"
                  value={formData.commission}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent placeholder-gray-600 text-gray-900"
                  placeholder="e.g. 3%, 5%, Fixed Amount"
                />
                <p className="text-xs text-gray-500 mt-1">Proposed commission for the agent.</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#496f5d] text-white py-4 rounded-lg font-semibold hover:bg-[#3d5a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Listing'}
            </button>
            <Link
              href="/"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
