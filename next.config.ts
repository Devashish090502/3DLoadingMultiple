import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add this line to properly bundle the Three.js library
  transpilePackages: ['three'],
};

export default nextConfig;