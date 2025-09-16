// app/gdpr-compliance/page.tsx
export default function GDPRCompliancePage() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-4">GDPR Compliance</h1>
      <p className="mb-4">
        We value your privacy and are committed to protecting your personal data in line with the General Data Protection Regulation (GDPR).
      </p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">1. What data we collect</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Your account details (email, name, phone, address)</li>
          <li>Item listings you create (title, description, location, images)</li>
          <li>Messages you send to other users via the chat system</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">2. Why we collect this data</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>To allow users to swap items securely</li>
          <li>To enable real-time chat and notifications</li>
          <li>To verify account ownership and prevent fraud</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">3. Your rights under GDPR</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Request a copy of the data we hold about you</li>
          <li>Request correction or deletion of your data</li>
          <li>Withdraw your consent at any time</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">4. How we protect your data</h2>
        <p className="text-gray-700">
          We use Supabase with Row-Level Security (RLS), secure database policies, and encryption to keep your data private.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">5. Contact us</h2>
        <p className="text-gray-700">
          If you have any privacy concerns or wish to exercise your rights, please email us at <b>onefirstech@gmail.com</b>.
        </p>
      </section>

      <p className="mt-8 text-sm text-gray-500">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </main>
  );
}
