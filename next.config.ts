import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The /system dashboard reads docs/ at build time (lib/system.ts,
  // lib/styleguide.ts) via node:fs. Nothing here is request-time dynamic.

  // `next build` and `next dev` share `.next` by default, so verifying a
  // production build while the dev server runs corrupts its manifests and
  // every page answers "Internal Server Error" until dev restarts — a
  // confusing failure that looks like a code bug. `npm run verify` sets
  // NEXT_DIST_DIR so the two never touch the same directory.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
