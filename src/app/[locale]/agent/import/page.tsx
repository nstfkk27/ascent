'use client';

import { useState } from 'react';
import { Download, Upload, CheckCircle, XCircle } from 'lucide-react';

interface CSVFiles {
  projects: File | null;
  facilities: File | null;
  units: File | null;
}

export default function ImportPage() {
  const [files, setFiles] = useState<CSVFiles>({ projects: null, facilities: null, units: null });
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (type: keyof CSVFiles, file: File | null) => {
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleImport = async () => {
    if (!files.projects && !files.facilities && !files.units) {
      alert('Please upload at least one CSV file');
      return;
    }

    setIsImporting(true);
    setResult(null);

    const formData = new FormData();
    if (files.projects) formData.append('projects', files.projects);
    if (files.facilities) formData.append('facilities', files.facilities);
    if (files.units) formData.append('units', files.units);

    try {
      const res = await fetch('/api/import/bulk', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, message: 'Import failed', errors: [String(error)] });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Import Projects</h1>
        <p className="text-gray-600">Import projects, facilities, and units from CSV files</p>
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Project name is optional for standalone properties (villas, land, etc.). 
            You can import units without a project and add them to a project later through the property edit page.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Download CSV Templates
        </h2>
        
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Project & Facilities</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/api/import/templates?type=projects" download="projects_template.csv" className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
              <Download className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Projects</span>
            </a>
            <a href="/api/import/templates?type=facilities" download="facilities_template.csv" className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
              <Download className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Facilities</span>
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Units by Category</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/api/import/templates?type=units_condo" download="units_condo_template.csv" className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
              <Download className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Condo Units</span>
            </a>
            <a href="/api/import/templates?type=units_house" download="units_house_template.csv" className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
              <Download className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">House/Villa</span>
            </a>
            <a href="/api/import/templates?type=units_land" download="units_land_template.csv" className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
              <Download className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Land</span>
            </a>
            <a href="/api/import/templates?type=units_business" download="units_business_template.csv" className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
              <Download className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Business/Investment</span>
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload CSV Files
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">1. Projects CSV <span className="text-red-500">*</span></label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange('projects', e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {files.projects && <p className="mt-1 text-xs text-green-600">✓ {files.projects.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">2. Facilities CSV <span className="text-gray-400 text-xs">(Optional)</span></label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange('facilities', e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {files.facilities && <p className="mt-1 text-xs text-green-600">✓ {files.facilities.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">3. Units CSV <span className="text-gray-400 text-xs">(Optional)</span></label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange('units', e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {files.units && <p className="mt-1 text-xs text-green-600">✓ {files.units.name}</p>}
          </div>
        </div>

        <button
          onClick={handleImport}
          disabled={isImporting || (!files.projects && !files.facilities && !files.units)}
          className="mt-6 w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isImporting ? 'Importing...' : 'Start Import'}
        </button>
      </div>

      {result && (
        <div className={`rounded-lg p-6 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className={`font-semibold mb-2 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                {result.message}
              </h3>
              {result.errors && result.errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-red-800 mb-2">Errors:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {result.errors.map((error: string, idx: number) => (
                      <li key={idx} className="text-sm text-red-700">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
