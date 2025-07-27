/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export since we're using API calls
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['localhost'] // Add your backend domain here
  },
  // Enable API routes for development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ]
  },
};

module.exports = nextConfig;