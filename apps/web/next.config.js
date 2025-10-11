/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@pulseai/shared', '@pulseai/worker'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;


