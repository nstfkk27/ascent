import { Suspense } from 'react';
import CompareClient from '@/components/compare/CompareClient';

export const dynamic = 'force-dynamic';

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1800px] mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#49516f] mb-2">Compare Properties</h1>
          <p className="text-gray-600">Side-by-side comparison of selected properties and their projects</p>
        </div>
        
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#496f5d]"></div>
          </div>
        }>
          <CompareClient />
        </Suspense>
      </div>
    </div>
  );
}
