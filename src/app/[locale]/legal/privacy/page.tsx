import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Ascent',
  description: 'Privacy Policy for Ascent - How we handle your data.',
};

export default function PrivacyPolicy() {
  return (
    <article>
      <h1>Privacy Policy</h1>
      <p className="text-gray-500 text-sm mb-8">Last Updated: December 2025</p>

      <section className="mb-8">
        <h2>1. Introduction</h2>
        <p>
          Welcome to Ascent (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website estateascent.com.
        </p>
      </section>

      <section className="mb-8">
        <h2>2. Information We Collect</h2>
        <p>We collect personal information that you voluntarily provide to us when you:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Register on the website</li>
          <li>Express interest in obtaining information about us or our products (listings)</li>
          <li>Participate in activities on the website (such as posting a property)</li>
          <li>Contact us</li>
        </ul>
        <p className="mt-4">
          The personal information that we collect depends on the context of your interactions with us and the website, the choices you make, and the products and features you use.
        </p>
      </section>

      <section className="mb-8">
        <h2>3. How We Use Your Information</h2>
        <p>We use personal information collected via our website for a variety of business purposes described below:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>To facilitate account creation and logon process.</li>
          <li>To send you marketing and promotional communications (with your consent).</li>
          <li>To fulfill and manage your property listings and inquiries.</li>
          <li>To post testimonials.</li>
          <li>To deliver targeted advertising to you.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>4. Contact Us</h2>
        <p>
          If you have questions or comments about this policy, you may email us at info@estateascent.com or by post to:
        </p>
        <address className="not-italic mt-4 bg-gray-50 p-4 rounded-lg">
          Ascent<br />
          Pattaya City, Bang Lamung District<br />
          Chon Buri 20150, Thailand
        </address>
      </section>
    </article>
  );
}
