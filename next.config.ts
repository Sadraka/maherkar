import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: process.env.NEXT_PUBLIC_API_HOST || '',
        port: process.env.NEXT_PUBLIC_API_PORT || '',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_API_HOST || '',
        port: process.env.NEXT_PUBLIC_API_PORT || '',
        pathname: '/media/**',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
