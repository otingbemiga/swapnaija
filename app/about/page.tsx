'use client';

import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Head>
        <title>About | SwapNaija</title>
      </Head>

      {/* Hero Section */}
      <section className="relative  bg-cover bg-center py-32 px-6">
        <div className="bg-black/70 p-8 rounded-xl max-w-3xl mx-auto text-white text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-green-400 mb-4"
          >
            About SwapNaija
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg md:text-xl"
          >
            Changing how Nigerians exchange goods and services, no cash, no stress. Just simple, community-based swapping.
          </motion.p>
        </div>
      </section>

      {/* About Narrative */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-green-700 mb-6">Our Story</h2>
        <p className="text-gray-800 leading-relaxed mb-4">
          In a country where cash can be tight, internet isn’t always stable, and access to resources is unequal, SwapNaija was born from a simple question: What if we could trade what we have for what we need?
        </p>
        <p className="text-gray-800 leading-relaxed mb-4">
          SwapNaija is a bold initiative to empower everyday Nigerians, from farmers in Sokoto to traders in Aba, with a platform to swap items using points instead of naira. Whether you're in Lagos or Gombe, you can donate what you don't need and gain access to what you do. All from your phone online.
        </p>
        <p className="text-gray-800 leading-relaxed">
          Our dream is to make sure that nothing is wasted, and no one is left behind.
        </p>
      </section>

      {/* Mission + Impact */}
      <section className="bg-green-50 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-green-700 mb-6">Our Mission</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-800">
            <li>Bridge gaps between urban and rural communities.</li>
            <li>Encourage a culture of giving, reuse, and empowerment.</li>
            <li>Support families during tough economic times.</li>
            <li>Make swapping accessible via web</li>
          </ul>

          <h2 className="text-3xl font-bold text-green-700 mt-12 mb-6">Our Impact</h2>
          <p className="text-gray-800 mb-2">✅ Over 10,000 items swapped and counting.</p>
          <p className="text-gray-800 mb-2">✅ Active across Nigeria’s 36 states and FCT.</p>
          <p className="text-gray-800">✅ Helping thousands of families access essentials.</p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-black text-white py-20 text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-green-400">Ready to Join the Movement?</h2>
        <p className="text-md md:text-lg mb-6">
          Start swapping today or spread the word in your community.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/auth/register"
            className="bg-green-500 hover:bg-green-600 focus:ring focus:ring-green-300 transition px-6 py-3 rounded font-semibold"
          >
            Sign Up
          </Link>
          <Link
            href="/contact"
            className="bg-white text-black hover:bg-gray-200 focus:ring focus:ring-white transition px-6 py-3 rounded font-semibold"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
