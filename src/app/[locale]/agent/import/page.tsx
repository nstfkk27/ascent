'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';

interface ImportedRow {
  no: string;
  project: string;
  location: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  floor: string;
  buildingZone: string;
  unitNo: string;
  view: string;
  furniture: string;
  // Derived fields
  category: string;
  listingType: string;
  price: number; // Default to 0 if not found
}

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ImportedRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [importStats, setImportStats] = useState({ total: 0, success: 0, failed: 0 });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      // Skip header row (assuming row 1 is header)
      const rows = data.slice(1) as any[];
      
      const parsedRows: ImportedRow[] = rows.map((row: any) => {
        // Map columns based on the user's screenshot structure
        // Index: 0=No, 1=Project, 2=Location, 3=Type, 4=Bed, 5=Bath, 6=Size, 7=Floor, 8=Zone, 9=UnitNo, 10=View, 11=Furniture
        // Note: This index mapping assumes the exact column order from the screenshot.
        // Ideally, we should map by header name, but for now we'll try index or safe access.
        
        const typeStr = (row[3] || '').toString().toLowerCase();
        let category = 'CONDO';
        if (typeStr.includes('house') || typeStr.includes('villa')) category = 'HOUSE';
        if (typeStr.includes('commercial') || typeStr.includes('hotel')) category = 'INVESTMENT';

        return {
          no: row[0],
          project: row[1] || 'Untitled Project',
          location: row[2] || 'Bangkok',
          type: row[3],
          bedrooms: parseInt(row[4]) || 0,
          bathrooms: parseInt(row[5]) || 0,
          size: parseFloat(row[6]) || 0,
          floor: row[7] || '',
          buildingZone: row[8] || '',
          unitNo: row[9] || '',
          view: row[10] || '',
          furniture: row[11] || '',
          category,
          listingType: 'SALE', // Defaulting to SALE for now
          price: 0 // Missing in screenshot, defaulting to 0
        };
      }).filter(r => r.project !== 'Untitled Project'); // Filter empty rows

      setPreviewData(parsedRows);
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleImport = async () => {
    setIsUploading(true);
    let successCount = 0;
    let failedCount = 0;

    for (const row of previewData) {
      try {
        // Construct the payload matching our API
        const payload = {
          title: `${row.project} ${row.unitNo ? '- ' + row.unitNo : ''}`,
          description: `
            Project: ${row.project}
            Type: ${row.type}
            View: ${row.view}
            Furniture: ${row.furniture}
            Floor: ${row.floor}
            Zone: ${row.buildingZone}
          `.trim(),
          price: row.price,
          size: row.size,
          bedrooms: row.bedrooms,
          bathrooms: row.bathrooms,
          address: row.location, // Using location as address for now
          city: row.location,
          state: 'Chonburi', // Assuming Pattaya based on screenshot (Jomtien, etc.)
          zipCode: '20150',
          category: row.category,
          listingType: row.listingType,
          images: [], // No images yet
          features: [row.view, row.furniture].filter(Boolean)
        };

        const res = await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) successCount++;
        else failedCount++;
      } catch (err) {
        failedCount++;
      }
    }

    setImportStats({ total: previewData.length, success: successCount, failed: failedCount });
    setIsUploading(false);
    alert(`Import Complete!\nSuccess: ${successCount}\nFailed: ${failedCount}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Bulk Import Listings</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Excel File (.xlsx)</label>
            <input 
              type="file" 
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="flex-1 border-l pl-4">
            <h3 className="text-sm font-semibold text-gray-800">Instructions</h3>
            <ul className="text-xs text-gray-500 mt-1 list-disc list-inside">
              <li>Ensure columns match the standard format (Project, Location, Type, etc.)</li>
              <li>Images cannot be imported directly from Excel unless they are public URLs.</li>
              <li>Price column was missing in your screenshot - defaulting to 0.</li>
            </ul>
          </div>
        </div>
      </div>

      {previewData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h2 className="font-semibold text-gray-800">Preview ({previewData.length} rows)</h2>
            <button 
              onClick={handleImport}
              disabled={isUploading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {isUploading ? 'Importing...' : '🚀 Start Import'}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Bed/Bath</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Category (Mapped)</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.project}</td>
                    <td className="px-4 py-3">{row.type}</td>
                    <td className="px-4 py-3">{row.bedrooms} / {row.bathrooms}</td>
                    <td className="px-4 py-3">{row.size} sqm</td>
                    <td className="px-4 py-3">{row.location}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        row.category === 'HOUSE' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {row.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 10 && (
              <div className="p-3 text-center text-xs text-gray-500 bg-gray-50 border-t">
                ...and {previewData.length - 10} more rows
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
