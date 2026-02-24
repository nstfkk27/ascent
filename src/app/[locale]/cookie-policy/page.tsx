import { Metadata } from 'next';
import Link from 'next/link';
import { Cookie, Shield, Settings, Eye } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cookie Policy | Estate Ascent',
  description: 'Learn about how Estate Ascent uses cookies and similar technologies to enhance your browsing experience.',
};

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#496f5d] rounded-full mb-4">
            <Cookie className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, understanding how you use our site, and improving our services.
            </p>
          </section>

          {/* How We Use Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Estate Ascent uses cookies for various purposes to enhance your experience on our platform:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#496f5d] flex-shrink-0 mt-0.5" />
                <span><strong>Essential Operations:</strong> Enable core functionality like secure login, property searches, and navigation.</span>
              </li>
              <li className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-[#496f5d] flex-shrink-0 mt-0.5" />
                <span><strong>Preferences:</strong> Remember your language settings, search filters, and display preferences.</span>
              </li>
              <li className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-[#496f5d] flex-shrink-0 mt-0.5" />
                <span><strong>Analytics:</strong> Understand how visitors interact with our website to improve user experience.</span>
              </li>
            </ul>
          </section>

          {/* Types of Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              {/* Necessary Cookies */}
              <div className="border-l-4 border-[#496f5d] pl-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Necessary Cookies</h3>
                <p className="text-gray-700 mb-3">
                  These cookies are essential for the website to function properly and cannot be disabled.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Examples:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Authentication cookies (user login sessions)</li>
                    <li>• Security cookies (CSRF protection)</li>
                    <li>• Load balancing cookies</li>
                    <li>• Cookie consent preferences</li>
                  </ul>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Analytics Cookies</h3>
                <p className="text-gray-700 mb-3">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Examples:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Google Analytics (_ga, _gid)</li>
                    <li>• Page view tracking</li>
                    <li>• User behavior analysis</li>
                    <li>• Performance monitoring</li>
                  </ul>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Marketing Cookies</h3>
                <p className="text-gray-700 mb-3">
                  These cookies track your browsing activity to display relevant advertisements and measure campaign effectiveness.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Examples:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Facebook Pixel</li>
                    <li>• Google Ads conversion tracking</li>
                    <li>• Retargeting cookies</li>
                    <li>• Social media sharing cookies</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may use third-party services that set cookies on your device. These include:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>Google Analytics:</strong> For website analytics and performance tracking</li>
              <li>• <strong>Social Media Platforms:</strong> For social sharing and login functionality</li>
              <li>• <strong>Advertising Networks:</strong> For targeted advertising (if you consent)</li>
            </ul>
          </section>

          {/* Managing Cookies */}
          <section className="bg-[#496f5d]/5 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have full control over which cookies you allow. You can:
            </p>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li>• Accept or reject cookies through our cookie banner</li>
              <li>• Manage your preferences at any time using our cookie settings</li>
              <li>• Configure your browser to block or delete cookies</li>
            </ul>
            <p className="text-sm text-gray-600 italic">
              Note: Blocking necessary cookies may affect website functionality and your user experience.
            </p>
          </section>

          {/* Browser Settings */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Browser Cookie Settings</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can also manage cookies through your browser settings:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li>• <strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li>• <strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
              <li>• <strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              Different cookies have different lifespans:
            </p>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li>• <strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li>• <strong>Persistent Cookies:</strong> Remain on your device for a set period (typically 1-24 months)</li>
              <li>• <strong>Analytics Cookies:</strong> Usually expire after 2 years</li>
            </ul>
          </section>

          {/* Contact & Updates */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any significant changes by posting the updated policy on this page with a new &ldquo;Last Updated&rdquo; date.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about our use of cookies, please contact us at{' '}
              <a href="mailto:privacy@estateascent.com" className="text-[#496f5d] underline hover:text-[#3d5c4d]">
                privacy@estateascent.com
              </a>
            </p>
          </section>

          {/* Related Links */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Information</h3>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/privacy-policy"
                className="text-[#496f5d] hover:text-[#3d5c4d] underline"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms"
                className="text-[#496f5d] hover:text-[#3d5c4d] underline"
              >
                Terms of Service
              </Link>
              <Link 
                href="/contact"
                className="text-[#496f5d] hover:text-[#3d5c4d] underline"
              >
                Contact Us
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
