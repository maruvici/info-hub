import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
   experimental: {
    serverActions: {
      bodySizeLimit: '25mb', // Accepts values like '1mb', '500kb', '2gb', or bytes (e.g., 1048576)
    },
  },
};

export default nextConfig;
