'use client';

export default function TermsOfServicePage() {
  return (
    <main className="max-w-4xl mx-auto p-6 text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-extrabold text-green-700 mb-6 border-b pb-2">
        Terms of Service
      </h1>

      <p className="mb-6">
        Welcome to our platform! By using our website and services, you agree to comply with the following
        Terms of Service. Please read them carefully.
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-2">1. Acceptance of Terms</h2>
        <p>
          By accessing or using our platform, you acknowledge that you have read, understood, and agreed to
          these terms. If you do not agree, you must not use our services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-2">2. User Responsibilities</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>You must provide accurate and up-to-date information during registration.</li>
          <li>You are responsible for maintaining the confidentiality of your account.</li>
          <li>You agree not to misuse the platform for fraudulent or unlawful activities.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-2">3. Item Listings and Transactions</h2>
        <p>
          Users are solely responsible for the accuracy of the items they list for swap. Our platform does not 
          guarantee or verify the authenticity of items listed by users. Transactions are conducted at your own risk.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-2">4. Limitation of Liability</h2>
        <p>
          We are not liable for any direct, indirect, or incidental damages resulting from the use or inability to 
          use our services. Users are advised to exercise caution when exchanging items.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-2">5. Modifications to Terms</h2>
        <p>
          We may revise these Terms of Service from time to time. Continued use of our platform means you accept 
          any changes made.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">6. Contact Us</h2>
        <p>
          If you have any questions regarding these terms, please contact us at 
          <a href="mailto:support@example.com" className="text-green-700 font-semibold ml-1">
            onefirstech@gmail.com
          </a>.
        </p>
      </section>

      <div className="mt-10 text-sm text-gray-500">
        Last updated: {new Date().toLocaleDateString()}
      </div>
    </main>
  );
}
