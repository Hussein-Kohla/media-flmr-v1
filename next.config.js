/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'patient-lapwing-172.eu-west-1.convex.cloud',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
  // Optional: improve performance and Vercel compatibility
  swcMinify: true,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false, // Keep linting on for production
  },
  typescript: {
    ignoreBuildErrors: false,   // Keep type checking on for production
  },
};

module.exports = nextConfig;