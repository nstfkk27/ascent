import SmartCalculator from '@/components/tools/SmartCalculator';

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Smart Tools</h1>
      
      <div className="mb-8">
        <SmartCalculator />
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4">More Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🧮 Commission Calculator</h2>
          <p className="text-gray-600 mb-4">Calculate splits between Agent, Company, and Co-broke.</p>
          <button className="text-blue-600 font-medium hover:underline">Open Calculator &rarr;</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🗺️ Map View</h2>
          <p className="text-gray-600 mb-4">Visualise all active listings and competitor data on an interactive map.</p>
          <button className="text-blue-600 font-medium hover:underline">Open Map &rarr;</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">✍️ AI Caption Writer</h2>
          <p className="text-gray-600 mb-4">Generate engaging social media captions for your listings automatically.</p>
          <button className="text-blue-600 font-medium hover:underline">Open Writer &rarr;</button>
        </div>
      </div>
    </div>
  );
}
