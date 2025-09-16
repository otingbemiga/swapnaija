'use client';

import Link from 'next/link';

export default function DocumentationPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-extrabold text-green-700 mb-8 border-b pb-4">
        📖 Swap App Documentation
      </h1>

      {/* Overview */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3">Overview</h2>
        <p className="text-gray-700 leading-relaxed">
          This is a peer-to-peer item swapping platform where users can list items, chat securely, 
          receive notifications, and manage their profile. The application is powered by 
          <b> Next.js 13+</b>, <b>Supabase</b>, and <b>TailwindCSS</b>.
        </p>
      </section>

      {/* Features */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3">Key Features</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>🔄 Swap items between registered users</li>
          <li>💬 Real-time chat with read receipts</li>
          <li>🔔 Notifications when messages arrive</li>
          <li>👤 User profile updates (phone, address, location)</li>
          <li>📂 My Listings page to view your own items</li>
          <li>🔒 Row-level security to protect user data</li>
        </ul>
      </section>

      {/* How to Use */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3">How to Use</h2>
        <ol className="list-decimal pl-6 space-y-2 text-gray-700">
          <li>Sign up or log in to your account.</li>
          <li>Update your profile with phone, address, and location.</li>
          <li>List an item you want to swap in the <b>New Listing</b> page.</li>
          <li>Visit <b>/swap/[id]</b> to view an item’s details and chat with the seller.</li>
          <li>Track your messages and notifications in real-time.</li>
          <li>See all your items in <Link href="/my-listings" className="text-green-600 underline">My Listings</Link>.</li>
        </ol>
      </section>

      {/* Developer Notes */}
      <section className="mb-10 bg-green-50 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-3">Developer Notes</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Auth: Managed by <b>@supabase/auth-helpers-nextjs</b>.</li>
          <li>Database: Supabase tables — <code>items</code>, <code>profiles</code>, <code>messages</code>, <code>notifications</code>.</li>
          <li>Storage: Item images are stored in Supabase storage bucket <code>item-images</code>.</li>
          <li>RLS: Enabled for all tables to ensure privacy. Test queries available under <code>/docs/rls-test.sql</code>.</li>
          <li>Real-time: Subscriptions handled with Supabase channels.</li>
        </ul>
      </section>

      {/* Links */}
      <section>
        <h2 className="text-2xl font-bold mb-3">Helpful Links</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/" className="text-green-600 underline">
              Home
            </Link>
          </li>
          <li>
            <Link href="/my-listings" className="text-green-600 underline">
              My Listings
            </Link>
          </li>
          <li>
            <Link href="/docs" className="text-green-600 underline">
              Documentation (this page)
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
