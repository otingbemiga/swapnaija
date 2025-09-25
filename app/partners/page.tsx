'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView'; // ✅ custom hook, create it in hooks/useInView.ts

export default function PartnersPage() {
  const partners = [
    {
      name: 'Onefirstech',
      description: 'Our #1 partner delivering premium technology solutions and innovations.',
      logo: '/onefirstech.png',
      website: 'https://onefirstech.netlify.app',
      featured: true,
    },
    {
      name: 'TechWave Solutions',
      description: 'Experts in cloud services, integrations, and enterprise consulting.',
      logo: '/partners/techwave.png',
      website: 'https://onefirstech.netlify.app',
    },
    {
      name: 'BrightApps Ltd',
      description: 'Mobile-first app development for fast-growing businesses.',
      logo: '/partners/brightapps.png',
      website: 'https://onefirstech.netlify.app',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      <section className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-green-700 mb-6 text-center">
          Our Trusted Partners
        </h1>
        <p className="text-center text-gray-700 mb-10">
          We’re proud to collaborate with industry-leading partners to deliver top-quality services and solutions.
        </p>

        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
          {partners.map((partner, index) => {
            const [ref, inView] = useInView({ threshold: 0.2 });

            return (
              <motion.div
                ref={ref}
                key={index}
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`p-6 rounded-xl shadow-md bg-white hover:shadow-lg transition-transform hover:scale-105 border ${
                  partner.featured ? 'border-green-500' : 'border-gray-200'
                }`}
              >
                {partner.logo && (
                  <div className="flex justify-center mb-4">
                    <motion.div
                      whileHover={{
                        scale: 1.15,
                        rotate: 2,
                        boxShadow: '0px 0px 25px rgba(34, 197, 94, 0.5)', // ✅ green glow
                      }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="inline-block rounded-full"
                    >
                      <Image
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        width={120}
                        height={120}
                        className="object-contain rounded"
                        unoptimized
                      />
                    </motion.div>
                  </div>
                )}
                <h2 className="text-2xl font-bold text-center mb-2 text-green-700">
                  {partner.name}
                  {partner.featured && (
                    <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      #1 Partner
                    </span>
                  )}
                </h2>
                <p className="text-gray-600 text-center mb-4">{partner.description}</p>
                {partner.website && (
                  <div className="text-center">
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
