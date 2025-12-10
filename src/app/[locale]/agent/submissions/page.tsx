'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Submission {
  id: string;
  title: string;
  price: string;
  category: string;
  listingType: string;
  contactName: string;
  contactPhone: string;
  contactLine: string;
  commission: string;
  status: string;
  createdAt: string;
  images: string[];
  description: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions');
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch submissions', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Property Submissions</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Property</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Contact</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Commission</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{sub.title}</div>
                      <div className="text-sm text-gray-500">
                        {sub.category} • {sub.listingType} • ฿{Number(sub.price).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{sub.contactName}</div>
                      <div className="text-sm text-gray-500">{sub.contactPhone || sub.contactLine}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{sub.commission || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sub.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        sub.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedSubmission(sub)}
                        className="text-[#496f5d] hover:text-[#3d5c4d] font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Submission Details</h2>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Contact Info</h3>
                  <p><span className="text-gray-500">Name:</span> {selectedSubmission.contactName}</p>
                  <p><span className="text-gray-500">Phone:</span> {selectedSubmission.contactPhone || '-'}</p>
                  <p><span className="text-gray-500">Line ID:</span> {selectedSubmission.contactLine || '-'}</p>
                  <p><span className="text-gray-500">Commission:</span> {selectedSubmission.commission || '-'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Property Info</h3>
                  <p><span className="text-gray-500">Type:</span> {selectedSubmission.category} ({selectedSubmission.listingType})</p>
                  <p><span className="text-gray-500">Price:</span> ฿{Number(selectedSubmission.price).toLocaleString()}</p>
                  <p><span className="text-gray-500">Date:</span> {new Date(selectedSubmission.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm text-gray-700">
                  {selectedSubmission.description}
                </div>
              </div>

              {selectedSubmission.images && selectedSubmission.images.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Images</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {selectedSubmission.images.map((img, idx) => (
                      <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90">
                        <img src={img} alt={`Submission ${idx}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
              >
                Close
              </button>
              <Link
                href={`/agent/create?fromSubmission=${selectedSubmission.id}`}
                className="px-4 py-2 bg-[#496f5d] text-white rounded-lg hover:bg-[#3d5c4d]"
              >
                Create Listing from This
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
