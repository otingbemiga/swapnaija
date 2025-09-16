'use client';

import React from 'react';

export default function SwapPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-4 border-b pb-2">
        Swap Policy
      </h1>
      <p className="mb-6 text-gray-700">
        Welcome to our Swap Platform! Please read this policy carefully to
        understand your rights and responsibilities when swapping items.
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-green-600 mb-2">1. Eligibility</h2>
        <p className="text-gray-700">
          All registered users may list items for swap. Each item must be accurately 
          described, including its condition, location, and any known defects. 
          Users must ensure they are legally entitled to trade the item.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-green-600 mb-2">2. Item Listings</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Provide clear and honest descriptions.</li>
          <li>Upload real photos of your item.</li>
          <li>Set a fair point value (if using points-based swaps).</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-green-600 mb-2">3. Swap Process</h2>
        <p className="text-gray-700">
          When two users agree to swap, both parties are responsible for 
          coordinating delivery or pickup. The platform is not responsible 
          for shipping arrangements or additional costs.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-green-600 mb-2">4. Prohibited Items</h2>
        <p className="text-gray-700">
          Items that are illegal, unsafe, counterfeit, or infringe on intellectual 
          property are strictly prohibited. Violations may result in account suspension.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-green-600 mb-2">5. Disputes</h2>
        <p className="text-gray-700">
          We encourage users to resolve disputes directly. If assistance is needed, 
          contact our support team. However, the platform does not guarantee resolution 
          or accept liability for losses.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-green-600 mb-2">6. Policy Updates</h2>
        <p className="text-gray-700">
          This policy may be updated periodically. Continued use of the platform 
          indicates acceptance of any new terms.
        </p>
      </section>

      <footer className="mt-10 text-sm text-gray-500 border-t pt-4">
        Last updated: {new Date().toLocaleDateString()}
      </footer>
    </main>
  );
}
