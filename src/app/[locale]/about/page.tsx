export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-6">About Ascent Real Estate</h1>
      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-4">
          Welcome to Ascent Real Estate, your trusted partner in finding the perfect property.
          With years of experience in the real estate industry, we are committed to helping
          you discover your dream home or investment property.
        </p>
        <p className="text-lg text-gray-700 mb-4">
          Our team of dedicated professionals works tirelessly to provide you with the best
          service, most comprehensive property listings, and expert guidance throughout your
          real estate journey.
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
        <p className="text-lg text-gray-700 mb-4">
          To make the process of buying, selling, or renting property as smooth and stress-free
          as possible while ensuring our clients get the best value for their investment.
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-4">Why Choose Us</h2>
        <ul className="list-disc list-inside text-lg text-gray-700 space-y-2">
          <li>Extensive portfolio of properties</li>
          <li>Expert market knowledge</li>
          <li>Personalized service</li>
          <li>Transparent pricing</li>
          <li>Professional support from start to finish</li>
        </ul>
      </div>
    </div>
  );
}
