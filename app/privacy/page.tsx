'use client';

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Privacy Policy</h1>
      
      <section className="bg-white shadow rounded-lg p-6 space-y-4">
        <p>
          Your privacy is important to us. This policy explains how we collect, use, and protect your personal information when you use our platform.
        </p>

        <h2 className="text-xl font-semibold text-green-700">1. Information We Collect</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Account information such as your name, email, phone, and address.</li>
          <li>Item listings, messages, and other content you provide on our platform.</li>
          <li>Technical data like IP address, device information, and browser type for security and analytics.</li>
        </ul>

        <h2 className="text-xl font-semibold text-green-700">2. How We Use Your Information</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>To verify your identity and manage your account.</li>
          <li>To display item listings and facilitate secure swaps between users.</li>
          <li>To improve our services, detect fraud, and ensure platform safety.</li>
        </ul>

        <h2 className="text-xl font-semibold text-green-700">3. Sharing Your Information</h2>
        <p>
          We do not sell your data. We only share information:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>With other users, when required to complete a swap or chat.</li>
          <li>With trusted service providers (e.g., payment or cloud services).</li>
          <li>When required by law, regulation, or legal process.</li>
        </ul>

        <h2 className="text-xl font-semibold text-green-700">4. Data Security</h2>
        <p>
          We use encryption, authentication, and access controls to protect your information. However, no system is completely secure, so we encourage using strong passwords and being mindful when sharing details.
        </p>

        <h2 className="text-xl font-semibold text-green-700">5. Your Rights</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>You may view and edit your personal data in your profile settings.</li>
          <li>You can request account deletion at any time.</li>
          <li>You may opt out of non-essential communications.</li>
        </ul>

        <h2 className="text-xl font-semibold text-green-700">6. Contact Us</h2>
        <p>
          If you have any questions about this privacy policy or your data, please reach out to us at 
          <span className="font-medium"> onefirstech@gmail.com</span>.
        </p>
      </section>

      <p className="text-xs text-gray-500 mt-6">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </main>
  );
}
