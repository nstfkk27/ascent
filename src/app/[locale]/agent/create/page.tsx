'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Map, { Marker, MapMouseEvent, MarkerDragEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import ImageUpload from '@/components/ImageUpload';
import { 
  PROPERTY_CATEGORIES, 
  CATEGORY_SUBTYPES, 
  PROPERTY_SUBTYPES, 
  SUBTYPE_FEATURES, 
  EQUIPMENT_LEVELS, 
  CONDO_UNIT_FEATURES,
  HOUSE_UNIT_FEATURES,
  PROJECT_FACILITIES,
  PROPERTY_CONDITIONS,
  PATTAYA_AREAS
} from '@/lib/constants';

const formatNumber = (num: number) => {
  if (!num) return '';
  return num.toLocaleString();
};

export default function QuickDropPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  // Project Autocomplete State
  const [projectSuggestions, setProjectSuggestions] = useState<any[]>([]);
  const [showProjectSuggestions, setShowProjectSuggestions] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch('/api/agent/me');
        if (res.ok) {
          const data = await res.json();
          setRole(data.role);
        }
      } catch (error) {
        console.error('Failed to fetch role', error);
      }
    };
    fetchRole();
  }, []);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    price: 0,
    rentPrice: 0,
    size: 0,
    bedrooms: 0,
    bathrooms: 0,
    isStudio: false,
    description: '',
    address: '',
    city: 'Pattaya', // Default
    area: '', // Added Area
    state: 'Chon Buri', // Default
    zipCode: '20150', // Default
    latitude: 12.9236, // Default Pattaya
    longitude: 100.8825, // Default Pattaya
    category: 'CONDO',
    listingType: 'SALE',
    
    // Dynamic Fields
    subtype: '', // houseType or investmentType
    condition: '', // Added condition
    floors: 0,
    parking: 0,
    furnished: false,
    pool: false,
    garden: false,
    projectName: '',
    projectId: '',
    
    // Investment Specific
    openForYears: 0,
    numberOfStaff: 0,
    equipmentIncluded: 'FULLY',
    landZoneColor: '',
    conferenceRoom: false,
    
    // Rental Tracking (Platform Agent only - internal)
    status: 'AVAILABLE',
    rentedUntil: '',
    availableFrom: '',
    
    // Commission (SuperAdmin/Platform Agent)
    commissionRate: 0,
    commissionAmount: 0,
    agentCommissionRate: 0,
    coAgentCommissionRate: 0,
    
    // Amenities
    selectedAmenities: [] as string[],
  });

  // Map View State (Separate from Pin Location to allow panning)
  const [viewState, setViewState] = useState({
    longitude: 100.8825,
    latitude: 12.9236,
    zoom: 12
  });

  // Reset subtype when category changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, subtype: '' }));
  }, [formData.category]);

  const shouldShowField = (fieldName: string) => {
    // If no subtype selected, show basic fields for category
    if (!formData.subtype) {
      if (formData.category === 'CONDO') return ['bedrooms', 'bathrooms', 'size', 'floors', 'parking', 'furnished', 'projectName'].includes(fieldName);
      if (formData.category === 'HOUSE') return ['bedrooms', 'bathrooms', 'size', 'floors', 'parking', 'furnished', 'projectName'].includes(fieldName);
      return ['size'].includes(fieldName); // Minimal for investment until subtype selected
    }

    // Check features for selected subtype
    const features = SUBTYPE_FEATURES[formData.subtype as keyof typeof SUBTYPE_FEATURES] as readonly string[] || [];
    return features.includes(fieldName);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let finalValue: any = value;
    
    if (type === 'number') {
      finalValue = parseFloat(value) || 0;
    } else if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    }

    // Handle formatted price inputs
    if (name === 'price' || name === 'rentPrice') {
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

  const handleProjectSearch = async (query: string) => {
    setFormData(prev => ({ ...prev, projectName: query, projectId: '' })); // Clear ID on name change
    
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
    const lat = project.lat ? Number(project.lat) : formData.latitude;
    const lng = project.lng ? Number(project.lng) : formData.longitude;
    
    setFormData(prev => ({ 
      ...prev, 
      projectName: project.name,
      projectId: project.id,
      address: project.address || prev.address,
      city: project.city || prev.city,
      latitude: lat,
      longitude: lng
    }));
    
    setViewState(prev => ({ ...prev, latitude: lat, longitude: lng, zoom: 14 }));
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
      // Prepare payload based on category
      // Create a clean payload object, explicitly excluding UI-only fields
      const { selectedAmenities, ...cleanFormData } = formData;

      const payload: any = {
        ...cleanFormData,
        projectId: formData.projectId || null,
        images: uploadedImages,
        amenities: {}, // Initialize amenities
      };

      // Map amenities to JSON
      formData.selectedAmenities.forEach(id => {
        payload.amenities[id] = true;
      });

      // Map specific boolean columns from amenities if needed
      if (formData.category === 'HOUSE') {
        payload.houseType = formData.subtype;
        if (formData.selectedAmenities.includes('privatePool')) payload.pool = true;
        if (formData.selectedAmenities.includes('privateGarden')) payload.garden = true;
      } else if (formData.category === 'CONDO') {
        if (formData.selectedAmenities.includes('swimmingPool')) payload.pool = true; // Common pool
        if (formData.selectedAmenities.includes('garden')) payload.garden = true; // Common garden
      } else if (formData.category === 'INVESTMENT') {
        payload.investmentType = formData.subtype;
        payload.conferenceRoom = formData.conferenceRoom;
        payload.pool = formData.pool;
        
        // Handle Land specific fields
        if (formData.subtype === 'LAND') {
          payload.landZoneColor = formData.landZoneColor;
        }
      }

      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Property saved successfully!');
        router.push('/agent');
      } else {
        const error = await res.json();
        alert('Error saving property: ' + error.error);
      }
    } catch (err) {
      alert('Failed to save property');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportExcel = () => {
    // Simple CSV Export
    const headers = ['Title', 'Price', 'Size', 'Bedrooms', 'Bathrooms', 'Location', 'Category', 'Type'];
    const row = [
      formData.title,
      formData.price,
      formData.size,
      formData.bedrooms,
      formData.bathrooms,
      `${formData.address}, ${formData.city}`,
      formData.category,
      formData.listingType
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + row.join(",");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "listing_draft.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quick-Drop Listing Engine</h1>
          <p className="text-gray-600">Paste details or enter manually. AI parsing is optional.</p>
        </div>
        <button 
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-6 py-3 bg-[#496f5d] text-white rounded-lg font-semibold hover:bg-[#3d5a4a] transition-colors"
        >
          Download CSV
        </button>
      </div>

      <div>
        {/* Form Section */}      
        <div>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">Listing Details</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm md:text-base" 
                  placeholder="e.g. Luxury Condo in Thong Lo"
                />
              </div>

              {shouldShowField('projectName') && (
                <div className="col-span-2 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.category === 'HOUSE' ? 'Village Name (Optional)' : 'Project Name'}
                  </label>
                  <input 
                    type="text" 
                    name="projectName"
                    value={formData.projectName}
                    onChange={(e) => handleProjectSearch(e.target.value)}
                    onFocus={() => formData.projectName.length >= 2 && setShowProjectSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowProjectSuggestions(false), 200)}
                    className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm md:text-base" 
                    placeholder={formData.category === 'HOUSE' ? "Leave empty if detached..." : "Start typing to search existing projects..."}
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
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm md:text-base"
                >
                  {Object.entries(PROPERTY_CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Subtype Selection */}
              {CATEGORY_SUBTYPES[formData.category as keyof typeof CATEGORY_SUBTYPES]?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select 
                    name="subtype"
                    value={formData.subtype}
                    onChange={handleChange}
                    className={`w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm md:text-base ${formData.subtype ? 'text-gray-900' : 'text-gray-500'}`}
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
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm md:text-base"
                >
                  <option value="SALE">For Sale</option>
                  <option value="RENT">For Rent</option>
                  <option value="BOTH">Sale & Rent</option>
                </select>
              </div>

              {(formData.category === 'HOUSE' || formData.category === 'CONDO') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select 
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm md:text-base"
                  >
                    <option value="">Select Condition</option>
                    {Object.entries(PROPERTY_CONDITIONS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price Inputs */}
              {(formData.listingType === 'SALE' || formData.listingType === 'BOTH') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (THB) *</label>
                  <input 
                    type="text" 
                    name="price"
                    value={formatNumber(formData.price)}
                    onChange={handleChange}
                    className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm md:text-base" 
                  />
                </div>
              )}

              {(formData.listingType === 'RENT' || formData.listingType === 'BOTH') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rental Price / Month </label>
                  <input 
                    type="text" 
                    name="rentPrice"
                    value={formatNumber(formData.rentPrice)}
                    onChange={handleChange}
                    className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm md:text-base" 
                  />
                </div>
              )}

              {/* Rental Tracking - Platform Agents Only */}
              {(role === 'SUPER_ADMIN' || role === 'PLATFORM_AGENT') && (formData.listingType === 'RENT' || formData.listingType === 'BOTH') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-xs text-gray-500">- Internal Only</span></label>
                    <select 
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm md:text-base"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="PENDING">Pending</option>
                      <option value="RENTED">Rented</option>
                      <option value="SOLD">Sold</option>
                    </select>
                  </div>

                  {formData.status === 'RENTED' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lease End Date <span className="text-xs text-gray-500">- Internal Only</span></label>
                        <input 
                          type="date" 
                          name="rentedUntil"
                          value={formData.rentedUntil}
                          onChange={handleChange}
                          className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm md:text-base" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Available From <span className="text-xs text-gray-500">- Internal Only</span></label>
                        <input 
                          type="date" 
                          name="availableFrom"
                          value={formData.availableFrom}
                          onChange={handleChange}
                          className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm md:text-base" 
                          placeholder="When tenant gives notice"
                        />
                      </div>                    
                    </>
                    
                  )}
                </>
              )}           

              {/* Dynamic Fields */}
              {shouldShowField('bedrooms') && (
                <>
                  {/* Studio Checkbox for Condos */}
                  {formData.category === 'CONDO' && (
                    <div className="col-span-2 md:col-span-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isStudio"
                          checked={formData.isStudio}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setFormData(prev => ({
                              ...prev,
                              isStudio: isChecked,
                              bedrooms: isChecked ? 0 : prev.bedrooms
                            }));
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Studio (0 Bedrooms)</span>
                      </label>
                    </div>
                  )}
                  
                  <div className="col-span-1 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.subtype === 'HOTEL' ? 'Number of Rooms' : 'Bedrooms'}
                    </label>
                    <input 
                      type="number" 
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      disabled={formData.isStudio}
                      className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm md:text-base disabled:bg-gray-100 disabled:cursor-not-allowed" 
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                    <input 
                      type="number" 
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm md:text-base" 
                    />
                  </div>
                </>
              )}

              {shouldShowField('size') && (
                <div className="col-span-1 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.subtype === 'LAND' ? 'Land Size (sqm)' : 'Size (sqm)'} *
                  </label>
                  <input 
                    type="number" 
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm md:text-base" 
                  />
                </div>
              )}

              {shouldShowField('floors') && (
                <div className="col-span-1 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floors</label>
                  <input 
                    type="number" 
                    name="floors"
                    value={formData.floors}
                    onChange={handleChange}
                    className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm md:text-base" 
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
                    className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm md:text-base" 
                  />
                </div>
              )}

              {shouldShowField('projectName') && (
                <div className="col-span-2 hidden">
                  {/* Hidden original input to prevent duplication if I missed removing it elsewhere */}
                </div>
              )}

              {/* Investment Specific Fields */}
              {shouldShowField('openForYears') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Open For (Years)</label>
                  <input 
                    type="number" 
                    name="openForYears"
                    value={formData.openForYears}
                    onChange={handleChange}
                    className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm md:text-base" 
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
                    className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm md:text-base" 
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
                    className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm md:text-base"
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
                    className={`w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm md:text-base ${formData.landZoneColor ? 'text-gray-900' : 'text-gray-500'}`}
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

              {/* Unit Features Section - These are specific to this unit */}
              {formData.category === 'HOUSE' && (
                <div className="col-span-2 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit Features</label>
                  <p className="text-xs text-gray-500 mb-2">Features specific to this unit (not shared project facilities)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {HOUSE_UNIT_FEATURES.map((item: { id: string; label: string }) => (
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

              {formData.category === 'CONDO' && (
                <div className="col-span-2 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit Features</label>
                  <p className="text-xs text-gray-500 mb-2">Features specific to this unit (project facilities are inherited automatically)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {CONDO_UNIT_FEATURES.map((item: { id: string; label: string }) => (
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

              {/* Boolean Features (Legacy / Investment) */}
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
                
                {/* Only show these if NOT covered by the new amenities section above */}
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

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm md:text-base" 
                  placeholder="Property description..."
                ></textarea>
              </div>

              {/* Photo Upload */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Photos</label>
                <ImageUpload 
                  images={uploadedImages}
                  onChange={setUploadedImages}
                />
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
                    className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm md:text-base text-gray-900 placeholder-gray-500" 
                    placeholder="Street address or Building name"
                  />
                  <button
                    type="button"
                    onClick={handleGeocode}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 border border-gray-300"
                    title="Find on Map"
                  >
                    🔍
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Press Enter or click search to find on map.</p>
              </div>

              {/* Area Dropdown */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Area / Neighborhood</label>
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className={`w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm md:text-base ${formData.area ? 'text-gray-900' : 'text-gray-500'}`}
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
              </div>

              {/* Commission Section - Different fields based on role */}
              <div className="col-span-2 pt-4 border-t">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Commission Details</h3>
                
                {(role === 'SUPER_ADMIN' || role === 'PLATFORM_AGENT') ? (
                  // Internal agents see both platform and agent commission
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Platform Commission Rate (%) <span className="text-xs text-gray-500">- Internal Only</span></label>
                      <input 
                        type="number" 
                        step="0.1"
                        name="commissionRate"
                        value={formData.commissionRate}
                        onChange={handleChange}
                        className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm md:text-base" 
                        placeholder="e.g. 3.0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Commission from property owner</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Agent Commission Rate (%) <span className="text-xs text-green-600">- Visible to Agents</span></label>
                      <input 
                        type="number" 
                        step="0.1"
                        name="agentCommissionRate"
                        value={formData.agentCommissionRate}
                        onChange={handleChange}
                        className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm md:text-base" 
                        placeholder="e.g. 2.0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Commission shared with agents</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Amount (THB)</label>
                      <input 
                        type="number" 
                        name="commissionAmount"
                        value={formData.commissionAmount}
                        onChange={handleChange}
                        className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm md:text-base" 
                        placeholder="Optional fixed amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Co-Agent Share (%)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        name="coAgentCommissionRate"
                        value={formData.coAgentCommissionRate}
                        onChange={handleChange}
                        className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm md:text-base" 
                        placeholder="e.g. 1.5"
                      />
                    </div>
                  </div>
                ) : (
                  // External agents only see agent commission rate
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%) <span className="text-xs text-green-600">- Shared with Other Agents</span></label>
                      <input 
                        type="number" 
                        step="0.1"
                        name="agentCommissionRate"
                        value={formData.agentCommissionRate}
                        onChange={handleChange}
                        className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm md:text-base" 
                        placeholder="e.g. 2.0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Commission you offer to other agents who help sell</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Co-Agent Share (%)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        name="coAgentCommissionRate"
                        value={formData.coAgentCommissionRate}
                        onChange={handleChange}
                        className="w-full p-2 md:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm md:text-base" 
                        placeholder="e.g. 1.5"
                      />
                      <p className="text-xs text-gray-500 mt-1">Optional: Split with co-listing agent</p>
                    </div>
                  </div>
                )}
              </div>
                  <div className="col-span-2 mt-8 pt-6 border-t flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => router.push('/agent')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-4 bg-[#496f5d] text-white rounded-lg font-semibold hover:bg-[#3d5a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Property'}
                </button>           
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
