import Link from 'next/link';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-600 rounded-2xl shadow-lg mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Coming Soon
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            We&apos;re building something amazing
          </p>
        </div>

        {/* Description */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
          <p className="text-lg text-gray-700 mb-6">
            Our platform is currently under construction. We&apos;re working hard to bring you the best real estate experience in Pattaya.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Smart Search</h3>
              <p className="text-sm text-gray-600">Advanced property filtering</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Interactive Maps</h3>
              <p className="text-sm text-gray-600">Explore locations visually</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Fast & Modern</h3>
              <p className="text-sm text-gray-600">Lightning-fast performance</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <p className="text-sm text-gray-500">
            Check back soon for updates!
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mt-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-xs text-gray-400">Building in progress...</p>
        </div>
      </div>
    </div>
  );
}
