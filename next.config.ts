import type { NextConfig } from "next";

const nextConfig: NextConfig = {
typescript: {
ignoreBuildErrors: true,
},
output: 'standalone',
experimental: {
missingSuspenseWithCSRBailout: false,
},
};

export default nextConfig;
