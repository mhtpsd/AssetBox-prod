import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  transpilePackages: ['@assetbox/config', '@assetbox/types', '@assetbox/database'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle Prisma Client
      config.externals = [...config.externals, '@prisma/client', '.prisma/client'];
    }
    return config;
  },
};

export default nextConfig;
