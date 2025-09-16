'use client';

import { motion } from 'framer-motion';
import { ArrowRightCircle, ShieldCheck, MessageCircle, Users } from 'lucide-react';

export default function ExplainerSection() {
  return (
    <section className="py-12 bg-black mt-10">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <motion.h2
          className="text-3xl font-extrabold text-green-700 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          What is a Swap? 🤝
        </motion.h2>

        <motion.p
          className="text-lg text-white leading-relaxed max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Swapping is a smarter way to get what you need, trade items directly with others 
          without spending cash. Simply list your item, find a match, chat securely, and make the exchange!
        </motion.p>

        {/* Card Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Users className="text-green-600 w-10 h-10 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Post Your Item</h3>
            <p className="text-gray-600 text-sm">
              Add photos, a detailed description, and location to let others know what you’re offering.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ArrowRightCircle className="text-green-600 w-10 h-10 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Find a Match</h3>
            <p className="text-gray-600 text-sm">
              Browse through items listed by other users and pick the perfect swap partner.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <MessageCircle className="text-green-600 w-10 h-10 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Chat Securely</h3>
            <p className="text-gray-600 text-sm">
              Use our built-in chat to negotiate and agree on the terms of your swap safely.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <ShieldCheck className="text-green-600 w-10 h-10 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Meet & Exchange</h3>
            <p className="text-gray-600 text-sm">
              Complete your swap in a public, safe location and enjoy your new item.
            </p>
          </motion.div>
        </div>

        <motion.p
          className="text-sm text-white italic mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          Pro tip: Always meet in a public place and double-check items before swapping. Safety first!
        </motion.p>
      </div>
    </section>
  );
}
