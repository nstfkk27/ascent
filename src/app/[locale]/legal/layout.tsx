export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 prose prose-slate lg:prose-lg">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        {children}
      </div>
    </div>
  );
}
