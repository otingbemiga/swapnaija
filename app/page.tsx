'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from '@supabase/auth-helpers-react';
import ExplainerSection from '../components/ExplainerSection/page';
import TestimonialsPage from './testimonials/page';
import { useInView } from 'react-intersection-observer';

export default function HomePage() {
  const session = useSession();

  // Variants for partner animations
  const fadeScaleVariant = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
  };

  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <main className="min-h-screen text-white relative">
      {/* Hero Section with Banner Background */}
      <section
        className="bg-center bg-no-repeat bg-cover relative flex flex-col justify-center items-center text-center py-24 px-4 min-h-screen"
        style={{ backgroundImage: "url('/banner.png')" }}
      >
        <div className="absolute inset-0 bg-black/45" /> {/* dark overlay */}

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-green-400"
          >
            Welcome to SwapNaija
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mt-10 hover:text-gray-200"
          >
            Nigeria’s #1 community-powered swapping platform. Trade items and services easily! 
            You can also convert items for cash depending on negotiation with item owners.
          </motion.p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/swap"
              className="bg-green-500 hover:bg-green-600 focus:ring focus:ring-green-300 transition px-6 py-3 rounded font-semibold"
            >
              Let's Swap
            </Link>
            {session ? (
              <Link
                href="/add-item"
                className="bg-white text-black hover:bg-gray-200 focus:ring focus:ring-white transition px-6 py-3 rounded font-semibold"
              >
                Add Item
              </Link>
            ) : (
              <Link
                href="/auth/register"
                className="bg-white text-black hover:bg-gray-200 focus:ring focus:ring-white transition px-6 py-3 rounded font-semibold"
              >
                Sign Up
              </Link>
            )}
            <Link
              href="/about"
              className="bg-transparent border border-green-400 text-green-400 hover:bg-green-500 hover:text-white transition px-6 py-3 rounded font-semibold"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Swapping Video Section */}
      <section className="bg-black text-black py-12 relative">
        <h2 className="text-3xl font-bold text-center mb-6 text-green-700">
          Watch Swapping in Action
        </h2>
        <div className="flex justify-center">
          <div
            className="w-full max-w-6xl rounded overflow-hidden shadow-lg relative"
            style={{ aspectRatio: '16/9', background: '#000' }}
          >
            {/* Video Player */}
            <div className="relative w-full h-full overflow-hidden rounded-lg">
              <video
                src="/swap-compressed.mp4"
                autoPlay
                loop
                playsInline
                controls={false}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Branding Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1, ease: 'easeInOut' }}
              className="absolute top-5 left-5 bg-black/60 text-white px-3 py-2 rounded-md font-bold"
            >
              SwapNaija
            </motion.div>

            {/* Bottom Caption */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1, ease: 'easeInOut' }}
              className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-green-600/80 text-white px-4 py-2 rounded-md text-sm"
            >
              Swap Anything. Anywhere. Anytime.
            </motion.div>
          </div>
        </div>
        <ExplainerSection />
      </section>

      {/* How It Works */}
      <section className="bg-black text-black py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6 text-green-700">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto text-sm">
          <div className="bg-green-50 p-4 rounded shadow">
            <h3 className="font-semibold text-lg mb-1">1. Sign Up</h3>
            <p>Create an account using your phone or email.</p>
          </div>
          <div className="bg-green-50 p-4 rounded shadow">
            <h3 className="font-semibold text-lg mb-1">2. Add an Item</h3>
            <p>List what you want to swap, e.g., rice, clothes, services.</p>
          </div>
          <div className="bg-green-50 p-4 rounded shadow">
            <h3 className="font-semibold text-lg mb-1">3. Earn Points</h3>
            <p>Earn “swap points” when someone accepts your listing.</p>
          </div>
          <div className="bg-green-50 p-4 rounded shadow">
            <h3 className="font-semibold text-lg mb-1">4. Swap, Save, or Cash Out</h3>
            <p>Swap your item or convert it for cash after negotiation.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsPage />

      {/* Partners Section */}
      <section
        ref={ref}
        className="bg-gradient-to-r from-green-900 via-black to-green-900 py-20 text-center text-white"
      >
        <h2 className="text-3xl font-bold mb-10 text-green-400">Our Trusted Partners</h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-12">
          We’re proud to collaborate with industry-leading partners to deliver top-quality services and solutions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
          {/* Partner 1 */}
          <motion.div
            variants={fadeScaleVariant}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="bg-black/40 p-6 rounded-xl shadow-lg hover:shadow-green-500/50 transition"
          >
            <img
              src="/onefirstech.png"
              alt="Onefirstech"
              className="mx-auto mb-4 w-28 h-28 object-contain"
            />
            <h3 className="text-xl font-semibold mb-2">Onefirstech</h3>
            <p className="text-sm">
              Our #1 partner delivering premium technology solutions and innovations.
            </p>
          </motion.div>

          {/* Partner 2 */}
          <motion.div
            variants={fadeScaleVariant}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            transition={{ delay: 0.2 }}
            className="bg-black/40 p-6 rounded-xl shadow-lg hover:shadow-green-500/50 transition"
          >
            <img
              src="/partners/techwave.png"
              alt="TechWave Solutions"
              className="mx-auto mb-4 w-28 h-28 object-contain"
            />
            <h3 className="text-xl font-semibold mb-2">TechWave Solutions</h3>
            <p className="text-sm">
              Experts in cloud services, integrations, and enterprise consulting.
            </p>
          </motion.div>

          {/* Partner 3 */}
          <motion.div
            variants={fadeScaleVariant}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            transition={{ delay: 0.4 }}
            className="bg-black/40 p-6 rounded-xl shadow-lg hover:shadow-green-500/50 transition"
          >
            <img
              src="/partners/brightapps.png"
              alt="BrightApps Ltd"
              className="mx-auto mb-4 w-28 h-28 object-contain"
            />
            <h3 className="text-xl font-semibold mb-2">BrightApps Ltd</h3>
            <p className="text-sm">
              Mobile-first app development for fast-growing businesses.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black text-white py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6 text-green-400">Naija Impact Stats</h2>
        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div>
            <p className="text-4xl font-bold text-green-500">10,000+</p>
            <p>Items Swapped</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-500">5,000+</p>
            <p>Happy Swappers</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-500">36</p>
            <p>States Reached with FCT Abuja</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-500">₦2M+</p>
            <p>Value Saved</p>
          </div>
        </div>
      </section>
    </main>
  );
}
