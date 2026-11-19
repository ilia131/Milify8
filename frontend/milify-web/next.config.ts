import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backend = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
    return backend ? [{
      source: "/backend-api/:path*",
      destination: `${backend.replace(/\/+$/, "")}/api/:path*/`,
    }] : [];
  },

  skipTrailingSlashRedirect: true,
  output: "standalone",
  outputFileTracingRoot: path.resolve(process.cwd(), ".."),
  turbopack: { root: path.resolve(process.cwd(), "..") },

  images: {
    unoptimized: true,
  },
};

export default nextConfig;