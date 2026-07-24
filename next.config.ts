import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  async redirects() {
    // Événementiel vertical removed — redirect the previously-indexed URLs
    // to the homepage instead of leaving them as 404s.
    const removedPaths = [
      "/entrepreneur",
      "/devis-traiteur",
      "/devis-photographe",
      "/devis-dj-animateur",
      "/devis-decorateur-evenementiel",
      "/devis-wedding-planner",
    ];
    return removedPaths.map((source) => ({ source, destination: "/", permanent: true }));
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/demo.mp4",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
