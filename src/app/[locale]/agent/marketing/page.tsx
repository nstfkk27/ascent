'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Property {
  id: string;
  title: string;
  price: number;
  description: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  category: string;
  listingType: string;
  images: string[];
}

const FACEBOOK_GROUPS = [
  { name: 'Pattaya Buy & Sell', url: 'https://www.facebook.com/groups/pattayabuyandsell' },
  { name: 'Pattaya Real Estate', url: 'https://www.facebook.com/groups/pattayarealestate' },
  { name: 'Pattaya Condos For Rent/Sale', url: 'https://www.facebook.com/groups/pattayacondos' },
  { name: 'Expats in Pattaya', url: 'https://www.facebook.com/groups/expatsinpattaya' },
  { name: 'Pattaya Property Group', url: 'https://www.facebook.com/groups/282075142642411' },
  // Add more groups here
];

export default function MarketingPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [postText, setPostText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchProperties = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const url = query 
        ? `/api/properties?query=${encodeURIComponent(query)}&limit=20`
        : `/api/properties?limit=10`; // Recent 10
        
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setProperties(data.data);
        // If we have no selection yet and results exist, select the first one
        setSelectedPropertyId((current) => {
          if (!current && data.data.length > 0 && !query) {
            return data.data[0].id;
          }
          return current;
        });
      }
    } catch (err) {
      console.error('Failed to search properties', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load initial recent properties
    searchProperties('');
  }, [searchProperties]);

  useEffect(() => {
    const timer = setTimeout(() => {
        searchProperties(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchProperties]);

  const generatePost = useCallback((p: Property) => {
    const type = p.listingType === 'SALE' ? 'Sale' : 'Rent';
    const emoji = p.category === 'CONDO' ? '🏢' : '🏠';
    
    return `${emoji} HOT DEAL! For ${type}: ${p.title}
📍 Location: ${p.address}

💰 Price: ${Number(p.price).toLocaleString()} THB ${p.listingType === 'RENT' ? '/ month' : ''}

✨ Details:
• ${p.bedrooms} Bedrooms
• ${p.bathrooms} Bathrooms
• ${p.size} Sqm
• ${p.category}

${p.description.substring(0, 200)}...

🔥 Highlights:
✅ Great Location
✅ Ready to Move in
✅ Best Price Guarantee

📞 Contact us for viewing!
Tel: 0xx-xxx-xxxx
Line: @ascentweb

#PattayaRealEstate #PattayaProperty #ThailandRealEstate #${p.category}Pattaya`;
  }, []);

  useEffect(() => {
    if (!selectedPropertyId) return;
    const property = properties.find(p => p.id === selectedPropertyId);
    if (property) {
      setPostText(generatePost(property));
    }
  }, [selectedPropertyId, properties, generatePost]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(postText);
    alert('Post text copied! Now click a group to open it.');
  };

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Group Blaster 🚀</h1>
          <p className="text-gray-600">Post to multiple Facebook Groups in seconds.</p>
        </div>
        <Link href="/agent" className="text-blue-600 hover:underline">Back to Dashboard</Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left: Property Selector */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-gray-50 font-semibold">
            <div>1. Select Property</div>
            <input 
              type="text"
              placeholder="Search properties..."
              className="mt-2 w-full p-2 border rounded text-sm font-normal"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {loading ? <p className="p-4 text-center text-gray-500">Loading...</p> : properties.map(p => (
              <div 
                key={p.id}
                onClick={() => setSelectedPropertyId(p.id)}
                className={`p-3 rounded cursor-pointer border transition-colors ${
                  selectedPropertyId === p.id 
                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="font-medium text-gray-800 truncate">{p.title}</div>
                <div className="text-sm text-gray-500 flex justify-between mt-1">
                  <span>{p.listingType}</span>
                  <span className="font-semibold text-green-600">฿{Number(p.price).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle: Content Generator */}
        <div className="lg:col-span-5 bg-white rounded-lg shadow border border-gray-200 flex flex-col">
          <div className="p-4 border-b bg-gray-50 font-semibold flex justify-between items-center">
            <span>2. Review Content</span>
            <button 
              onClick={copyToClipboard}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              📋 Copy Text
            </button>
          </div>
          <div className="flex-1 p-4 flex flex-col gap-4">
            <textarea 
              className="flex-1 w-full p-4 border rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 resize-none"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            ></textarea>
            
            {selectedProperty && selectedProperty.images.length > 0 && (
              <div className="h-32 border rounded p-2 bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">Don&apos;t forget to download images!</p>
                <div className="flex gap-2 overflow-x-auto h-full pb-2">
                  {selectedProperty.images.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer" className="relative aspect-square h-20 flex-shrink-0 rounded overflow-hidden border hover:opacity-80">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Group Launcher */}
        <div className="lg:col-span-4 bg-white rounded-lg shadow border border-gray-200 flex flex-col">
          <div className="p-4 border-b bg-gray-50 font-semibold">3. Launch Groups</div>
          <div className="flex-1 p-4 overflow-y-auto">
            <p className="text-sm text-gray-600 mb-4">
              Click a group to open it. Paste the text (Ctrl+V) and drag images to post.
            </p>
            <div className="space-y-3">
              {FACEBOOK_GROUPS.map((group, idx) => (
                <a 
                  key={idx}
                  href={group.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                >
                  <span className="font-medium text-gray-700 group-hover:text-blue-700">{group.name}</span>
                  <span className="text-gray-400 group-hover:text-blue-500">↗</span>
                </a>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-100 text-sm text-yellow-800">
              <strong>💡 Pro Tip:</strong> Join these groups first! You cannot post if you are not a member.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
