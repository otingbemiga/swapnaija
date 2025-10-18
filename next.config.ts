/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ✅ Updated from deprecated "domains" to new "remotePatterns"
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rzjfumrvmmdluunqsqsp.supabase.co',
        pathname: '/storage/v1/object/public/**', // allow all public Supabase storage assets
      },
    ],
  },

  experimental: {
    serverActions: {}, // ✅ must remain an empty object, not boolean
  },
};

module.exports = nextConfig;
