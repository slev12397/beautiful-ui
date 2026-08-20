import type { NextConfig } from "next";

/* Not a static export: the /api/subscribe route runs on the server so its
 * API key stays out of the browser. Vercel runs Next.js natively — no config
 * needed. Analytics and the email capture are optional; the app builds and
 * runs with no environment variables set. */
const nextConfig: NextConfig = {
  images: { unoptimized: true },
};

export default nextConfig;
