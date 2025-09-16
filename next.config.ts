/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['rzjfumrvmmdluunqsqsp.supabase.co'], // Supabase project domain
  },
   experimental: {
    serverActions: {}, // must be object, not boolean
  },
};

module.exports = nextConfig;
