export default function LeadsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Leads Inbox</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <div className="text-6xl mb-4">🕵️‍♂️</div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Lead Scout</h2>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
          Automated scraping integration to find leads from Facebook Groups and other sources.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-left max-w-2xl mx-auto">
          <h3 className="font-bold text-yellow-800 mb-2">Configuration Required</h3>
          <p className="text-sm text-yellow-700">
            To enable the Lead Scout, we need to configure the scraping service (Apify/Puppeteer). 
            This feature runs in the background to monitor keywords like &quot;Looking for condo&quot; or &quot;Rent in Sukhumvit&quot;.
          </p>
        </div>
      </div>
    </div>
  );
}
