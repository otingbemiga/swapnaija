'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from '@supabase/auth-helpers-react';
import ExplainerSection from '../components/ExplainerSection/page';
import TestimonialsPage from './testimonials/page';
// import FloatingButton from '@/components/FloatingButton';

export default function HomePage() {
  const session = useSession();

  return (
    <main  className="min-h-screen text-white bg-center bg-fit relative"
      style={{ backgroundImage: "url('/banner.png')" }}>
      {/* Hero Section */}
      <section className="bg-black/45 flex flex-col justify-center items-center text-center py-24 px-4 min-h-screen">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold text-green-400"
        >
          Welcome to SwapHub
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg md:text-xl max-w-2xl"
        >
          Nigeria’s #1 community-powered swapping platform. Trade items and services easily! You can also convert items for cash depending on negotiation with item owners.
        </motion.p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/swap" className="bg-green-500 hover:bg-green-600 focus:ring focus:ring-green-300 transition px-6 py-3 rounded font-semibold">
            Let's Swap
          </Link>
          {session ? (
            <Link href="/add-item" className="bg-white text-black hover:bg-gray-200 focus:ring focus:ring-white transition px-6 py-3 rounded font-semibold">
              Add Item
            </Link>
          ) : (
            <Link href="/auth/register" className="bg-white text-black hover:bg-gray-200 focus:ring focus:ring-white transition px-6 py-3 rounded font-semibold">
              Sign Up
            </Link>
          )}
          <Link href="/about" className="bg-transparent border border-green-400 text-green-400 hover:bg-green-500 hover:text-white transition px-6 py-3 rounded font-semibold">
            Learn More
          </Link>
        </div>
      </section>
      
        {/* Swapping Video Section */}
        <section className="bg-black text-black py-12 px-4 relative">
          <h2 className="text-3xl font-bold text-center mb-6 text-green-700">
            Watch Swapping in Action
          </h2> 
          <div className="flex justify-center">
            <div className="w-full max-w-4xl rounded overflow-hidden shadow-lg relative" style={{ aspectRatio: '16/9', background: '#000' }}>
              
              {/* Video Player */}
              <div className="relative w-full h-full overflow-hidden rounded-lg">
                <video src="/swap-compressed.mp4" autoPlay muted loop playsInline width="200%"
                  height="150%" />

                {/* <ReactPlayer
                  url="/swap-compressed.mp4"
                  playing
                  muted
                  loop
                  playsinline
                  controls={false}
                  width="100%"
                  height="100%"
                  config={{
                    file: { attributes: { playsInline: true } }
                  }}
                /> */}
              </div>

              {/* Branding Overlay with Fade-in */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1, ease: "easeInOut" }}
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  background: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
              >
                SwapHub
              </motion.div>

              {/* Bottom Caption with Fade-in */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1, ease: "easeInOut" }}
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(25, 136, 19, 0.8)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
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

      {<TestimonialsPage/ >}

  

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
