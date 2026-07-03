import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/aura8",
        permanent: false,
        has: [{ type: "host", value: "aura8.fun" }],
      },
      {
        source: "/",
        destination: "/aura8",
        permanent: false,
        has: [{ type: "host", value: "www.aura8.fun" }],
      },
    ];
  },
};

export default nextConfig;
