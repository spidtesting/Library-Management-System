import type { NextConfig } from "next";
import os from "os";

function getLanHosts(): string[] {
  const hosts = new Set<string>();
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces ?? []) {
      if (iface.family === "IPv4" && !iface.internal) {
        hosts.add(iface.address);
      }
    }
  }
  return [...hosts];
}

const envDevOrigins =
  process.env.DEV_ALLOWED_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];

const nextConfig: NextConfig = {
  // Allow phones/tablets on your LAN to use HMR and dev RSC during `npm run dev`
  allowedDevOrigins: [...new Set([...getLanHosts(), ...envDevOrigins])],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
