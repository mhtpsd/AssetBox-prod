import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // MinIO / S3-compatible storage (set NEXT_PUBLIC_STORAGE_URL in production)
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      {
        // Avatar providers
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
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
