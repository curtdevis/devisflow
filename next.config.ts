import { withWorkflow } from "workflow/next";
import type { NextConfig } from "next";

// Not using script-src nonces/strict-dynamic here — this app renders many
// inline JSON-LD <script> tags via dangerouslySetInnerHTML across server
// components, which would need per-request nonce plumbing to keep working.
// 'unsafe-inline' still lets CSP do its main job here: blocking script/frame
// sources from domains we didn't explicitly allow.
// React/Turbopack use eval() for dev-only debugging features (call-stack
// reconstruction, HMR) — never in production builds. Only relax CSP for it
// locally so `next dev` doesn't show spurious console errors.
const scriptSrc = process.env.NODE_ENV === "development"
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com https://api-adresse.data.gouv.fr https://recherche-entreprises.api.gouv.fr https://date.nager.at",
  "frame-src 'self' blob:",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: csp },
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

export default withWorkflow(nextConfig);
