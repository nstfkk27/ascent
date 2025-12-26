import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function VerifyPage({ params }: { params: { id: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
  });

  if (!property) {
    notFound();
  }

  // If already sold/rented/expired, show different message
  if (property.status === 'SOLD' || property.status === 'RENTED') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h1>
          <p className="text-gray-600">This property has already been marked as {property.status}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Availability Check</h1>
        <p className="text-gray-600 mb-6">
          Is <strong>{property.title}</strong> still available for {property.listingType}?
        </p>

        <div className="space-y-4">
          <form action={`/api/verify/${property.id}`} method="POST">
            <input type="hidden" name="action" value="AVAILABLE" />
            <button 
              type="submit"
              className="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              Yes, Still Available
            </button>
          </form>

          <form action={`/api/verify/${property.id}`} method="POST">
            <input type="hidden" name="action" value="SOLD" />
            <button 
              type="submit"
              className="w-full py-4 bg-gray-200 text-gray-800 rounded-lg font-bold text-lg hover:bg-gray-300 transition-colors"
            >
              No, It&apos;s Sold/Rented
            </button>
          </form>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          This link was sent to verify the status of your listing on Ascent.
        </p>
      </div>
    </div>
  );
}
