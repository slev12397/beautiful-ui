import type { NextConfig } from "next";

/* Not a static export anymore: the /api/subscribe route needs to run on the
 * server so the Airtable token stays out of the browser. Vercel runs Next.js
 * natively — no config needed. */
const nextConfig: NextConfig = {
  images: { unoptimized: true },
};

export default nextConfig;
