import SmartCalculator from '@/components/tools/SmartCalculator';

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Smart Tools</h1>
      
      <div className="mb-8">
        <SmartCalculator />
      </div>

    </div>
  );
}
