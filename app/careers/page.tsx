'use client';

import Link from 'next/link';

export default function CareersPage() {
  const jobs = [
    {
      title: 'Frontend Developer',
      location: 'Remote',
      type: 'Full-time',
      description:
        'Join our product team to build sleek, responsive web applications using React, Next.js, and Tailwind.',
      link: '/careers/frontend-developer',
    },
    {
      title: 'Backend Engineer',
      location: 'Lagos, Nigeria',
      type: 'Full-time',
      description:
        'Help us scale our API and database systems using Node.js, Supabase, and PostgreSQL.',
      link: '/careers/backend-engineer',
    },
    {
      title: 'Product Designer',
      location: 'Remote',
      type: 'Contract',
      description:
        'Design beautiful, user-friendly interfaces and work closely with developers to deliver a great experience.',
      link: '/careers/product-designer',
    },
  ];

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-green-700 mb-4">
          Join Our Team
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We're building innovative solutions and we’d love for you to be part
          of our journey. Explore open roles and grow your career with us.
        </p>
      </section>

      {/* Company culture section */}
      <section className="bg-green-50 rounded-xl p-6 mb-12 shadow">
        <h2 className="text-2xl font-bold mb-3 text-green-800">
          Why Work With Us?
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Flexible remote and hybrid work options</li>
          <li>Competitive salaries and performance bonuses</li>
          <li>Learning stipends and career growth programs</li>
          <li>A collaborative, inclusive team culture</li>
        </ul>
      </section>

      {/* Job listings */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-green-800">Open Roles</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {jobs.map((job, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-5 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
              <p className="text-sm text-gray-500 mb-1">{job.location} • {job.type}</p>
              <p className="text-gray-700 mb-4">{job.description}</p>
              <Link
                href={job.link}
                className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="text-center mt-16 bg-green-100 p-8 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-green-800">
          Don’t see a role that fits?
        </h2>
        <p className="text-gray-700 mb-4">
          We’re always looking for passionate people. Send us your CV and let’s
          stay in touch.
        </p>
        <Link
          href="/contact"
          className="bg-green-600 text-white px-6 py-3 rounded font-semibold hover:bg-green-700"
        >
          Get In Touch
        </Link>
      </section>
    </main>
  );
}
