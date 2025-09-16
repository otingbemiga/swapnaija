"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function TestimonialsPage() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const testimonials = [
    { state: 'Kano', text: 'Swapped my old fan for rice. Incredible!', name: 'Amina' },
    { state: 'Enugu', text: 'Exchanged clothes for school bags. God bless SwapHub!', name: 'John' },
    { state: 'Borno', text: 'Even in the village, I was able to swap via SMS!', name: 'Fatima' },
    { state: 'Oyo', text: 'Old phone gone. Got food in return. Love it!', name: 'Tunde' },
    { state: 'Anambra', text: 'Very smart. No cash but I still got what I needed.', name: 'Ngozi' },
    { state: 'Kaduna', text: 'Used swap points to get services! Works like magic.', name: 'Musa' }
  ];

  return (
    <section className="relative bg-white text-black py-20 px-6 overflow-hidden">
      {/* Background with parallax effect */}
      <motion.div 
        className="absolute inset-0 bg-[url('/green-waves.svg')] bg-cover bg-center"
        style={{ y: offsetY * 0.3 }} 
      />

      {/* Faint dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-green-700"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Community Testimonials
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div 
              key={idx} 
              className="bg-green-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <p className="italic text-gray-800">“{t.text}”</p>
              <p className="mt-4 font-semibold text-green-800">– {t.name}, {t.state}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
