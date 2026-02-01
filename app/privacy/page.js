export const metadata = {
  title: "Privacy Policy - Meet Me in the Middle",
  description: "Privacy policy for Meet Me in the Middle",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen p-4 sm:p-8 pb-32">
      <div className="max-w-3xl mx-auto bg-white border border-[#d0d0d0] rounded shadow-sm p-6 sm:p-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#37474f] mb-2">Privacy Policy</h1>
          <p className="text-sm text-[#6b7c87]">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="space-y-6 text-[#37474f]">
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#37474f]">Introduction</h2>
            <p className="text-[#6b7c87] leading-relaxed">
              Meet Me in the Middle ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#37474f]">Information We Collect</h2>
            <p className="text-[#6b7c87] leading-relaxed mb-2">
              We collect the following information only when you choose to provide it:
            </p>
            <ul className="list-disc list-inside text-[#6b7c87] space-y-1 ml-4">
              <li>Your location (latitude and longitude) when you share it</li>
              <li>Your name if you choose to provide it</li>
              <li>Session data for real-time coordination</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#37474f]">How We Use Your Information</h2>
            <p className="text-[#6b7c87] leading-relaxed mb-2">
              Your information is used solely to:
            </p>
            <ul className="list-disc list-inside text-[#6b7c87] space-y-1 ml-4">
              <li>Calculate the optimal midpoint between two locations</li>
              <li>Suggest nearby meeting venues</li>
              <li>Enable real-time location sharing with your meeting partner</li>
              <li>Calculate drive times and distances</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#37474f]">Data Storage and Retention</h2>
            <p className="text-[#6b7c87] leading-relaxed">
              All session data is stored temporarily in Firebase (Google Cloud) and is <strong>automatically deleted after 6 hours</strong>. 
              We do not store your location or personal information long-term.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#37474f]">Third-Party Services</h2>
            <p className="text-[#6b7c87] leading-relaxed mb-2">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-[#6b7c87] space-y-1 ml-4">
              <li><strong>Firebase (Google):</strong> For real-time data storage and synchronization</li>
              <li><strong>Mapbox:</strong> For maps, geocoding, and location services</li>
            </ul>
            <p className="text-[#6b7c87] leading-relaxed mt-2">
              These services have their own privacy policies. We do not sell, rent, or share your data with any other third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#37474f]">Location Permissions</h2>
            <p className="text-[#6b7c87] leading-relaxed">
              Location access is controlled by your web browser. You must explicitly grant permission for us to access your location. 
              You can revoke this permission at any time through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#37474f]">Your Rights</h2>
            <ul className="list-disc list-inside text-[#6b7c87] space-y-1 ml-4">
              <li>You can close your session at any time</li>
              <li>No account or registration is required</li>
              <li>You control location access through your browser</li>
              <li>All data is automatically deleted after 6 hours</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#37474f]">Cookies</h2>
            <p className="text-[#6b7c87] leading-relaxed">
              We use localStorage (not cookies) to remember your privacy preferences and user ID for the session. 
              This data is stored locally on your device and can be cleared through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#37474f]">Children's Privacy</h2>
            <p className="text-[#6b7c87] leading-relaxed">
              Our service is not intended for children under 13. We do not knowingly collect information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#37474f]">Changes to This Policy</h2>
            <p className="text-[#6b7c87] leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last updated" date at the top of this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#37474f]">Contact Us</h2>
            <p className="text-[#6b7c87] leading-relaxed">
              If you have questions about this Privacy Policy or our practices, please contact us at:{' '}
              <a href="mailto:privacy@markyudt.com" className="text-[#8bc34a] hover:underline font-medium">
                privacy@markyudt.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-[#d0d0d0]">
          <a href="/" className="text-[#8bc34a] hover:underline font-medium inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}