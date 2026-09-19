import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets phones on the local network load dev-only assets (JS chunks, HMR)
  // when opening the dev server by LAN IP, e.g. http://192.168.0.107:3000.
  allowedDevOrigins: ["192.168.*.*"],
};

export default nextConfig;
