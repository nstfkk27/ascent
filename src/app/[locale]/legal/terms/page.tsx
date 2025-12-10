import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Ascent Real Estate',
  description: 'Terms and Conditions for using Ascent Real Estate services.',
};

export default function TermsOfService() {
  return (
    <article>
      <h1>Terms of Service</h1>
      <p className="text-gray-500 text-sm mb-8">Last Updated: December 2025</p>

      <section className="mb-8">
        <h2>1. Agreement to Terms</h2>
        <p>
          These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you&quot;) and Ascent Real Estate (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), concerning your access to and use of the ascent-realestate.com website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the &quot;Site&quot;).
        </p>
      </section>

      <section className="mb-8">
        <h2>2. Intellectual Property Rights</h2>
        <p>
          Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the &quot;Content&quot;) and the trademarks, service marks, and logos contained therein (the &quot;Marks&quot;) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
        </p>
      </section>

      <section className="mb-8">
        <h2>3. User Representations</h2>
        <p>By using the Site, you represent and warrant that:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>All registration information you submit will be true, accurate, current, and complete.</li>
          <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
          <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
          <li>You will not use the Site for any illegal or unauthorized purpose.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>4. Property Listings</h2>
        <p>
          We strive to provide accurate information regarding property listings. However, we cannot guarantee that all details (price, availability, features) are 100% accurate at all times as they are subject to change by owners and developers. Users are encouraged to verify details with our agents.
        </p>
      </section>

      <section className="mb-8">
        <h2>5. Contact Us</h2>
        <p>
          In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at info@ascent-realestate.com.
        </p>
      </section>
    </article>
  );
}
