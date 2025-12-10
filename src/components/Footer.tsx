import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#49516f] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Ascent Real Estate</h3>
            <p className="text-[#8ea4d2]">
              Your trusted partner in finding the perfect property.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/properties" className="text-[#8ea4d2] hover:text-white">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#8ea4d2] hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#8ea4d2] hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Info</h3>
            <p className="text-[#8ea4d2]">Email: info@ascentrealestate.com</p>
            <p className="text-[#8ea4d2]">Phone: (555) 123-4567</p>
          </div>
        </div>
        <div className="border-t border-[#8ea4d2] mt-8 pt-8 text-center text-[#8ea4d2]">
          <p>&copy; {new Date().getFullYear()} Ascent Real Estate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
