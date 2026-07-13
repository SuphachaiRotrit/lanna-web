import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // "standalone" is for the Docker/self-host build (see Dockerfile, which copies
  // .next/standalone and runs server.js) — Vercel's own build expects the default
  // output shape, so skip it there (Vercel sets VERCEL=1 during build/runtime).
  output: process.env.VERCEL ? undefined : "standalone",
  turbopack: {
    root: path.join(__dirname),
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL;
    if (!backendUrl) return [];
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
      { source: "/uploads/:path*", destination: `${backendUrl}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
