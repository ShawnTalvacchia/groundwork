import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The /system dashboard reads docs/ at build time (lib/system.ts,
  // lib/styleguide.ts) via node:fs. Nothing here is request-time dynamic.
};

export default nextConfig;
