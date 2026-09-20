import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets phones on the local network load dev-only assets (JS chunks, HMR)
  // when opening the dev server by LAN IP, e.g. http://192.168.0.107:3000.
  allowedDevOrigins: ["192.168.*.*"],

  turbopack: {
    // Turbopack finds the project root by walking up for a lockfile, and there
    // is a stray package-lock.json in the home directory above this one. It
    // would rather use that — outside the repo — and warns on every start.
    // Pinning the root to this folder settles it.
    root: import.meta.dirname,
  },
};

export default nextConfig;
