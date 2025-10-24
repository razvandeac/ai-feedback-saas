import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/projects/:id/widget',
        destination: '/org/demo/projects/:id/widget',
        permanent: false,
      },
      {
        source: '/projects/:id/settings',
        destination: '/org/demo/projects/:id/settings',
        permanent: false,
      },
      {
        source: '/projects/:id/studio/:widgetId',
        destination: '/org/demo/projects/:id/studio/:widgetId',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
