/** @type {import('next').NextConfig} */
const nextConfig = {
  strictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    typedRoutes: true,
  },
};

module.exports = nextConfig;
