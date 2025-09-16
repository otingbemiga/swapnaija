'use client';
import Image from 'next/image';

export default function PartnersPage() {
  const partners = [
    {
      name: 'Onefirstech',
      description: 'Our #1 partner delivering premium technology solutions and innovations.',
      logo: '/partners/onefirstech.png', // make sure to add this logo to your /public/partners folder
      website: 'https://onefirstech.com',
      featured: true,
    },
    {
      name: 'TechWave Solutions',
      description: 'Experts in cloud services, integrations, and enterprise consulting.',
      logo: '/partners/techwave.png',
      website: 'https://techwave.example.com',
    },
    {
      name: 'BrightApps Ltd',
      description: 'Mobile-first app development for fast-growing businesses.',
      logo: '/partners/brightapps.png',
      website: 'https://brightapps.example.com',
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
          {partners.map((partner, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl shadow-md bg-white hover:shadow-lg transition-transform hover:scale-105 border ${
                partner.featured ? 'border-green-500' : 'border-gray-200'
              }`}
            >
              {partner.logo && (
                <div className="flex justify-center mb-4">
                  <Image
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    width={120}
                    height={120}
                    className="object-contain rounded"
                    unoptimized
                  />
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
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
