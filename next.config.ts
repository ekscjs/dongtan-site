import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dfkqvobimrjhilihczvp.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // ── 구 사이트 URL 패턴 → 301 리다이렉트 ─────────────────────────
      { source: "/bbs/:path*",     destination: "/", permanent: true },
      { source: "/shop/:path*",    destination: "/", permanent: true },
      { source: "/counsel/:path*", destination: "/", permanent: true },
      { source: "/counsel",        destination: "/", permanent: true },
      { source: "/magazine/:path*",destination: "/blog", permanent: true },
      { source: "/magazine",       destination: "/blog", permanent: true },
      { source: "/talk/:path*",    destination: "/", permanent: true },
      { source: "/talk",           destination: "/", permanent: true },

      // ── 도메인 이전 301 ──────────────────────────────────────────────�      // dongtan.naemiso.com → www.bodymiso.com
      {
        source: "/:path*",
        has: [{ type: "host", value: "dongtan.naemiso.com" }],
        destination: "https://www.bodymiso.com/:path*",
        permanent: true,
      },
      // *.vercel.app → www.bodymiso.com
      {
        source: "/:path*",
        has: [{ type: "host", value: "dongtan-site.vercel.app" }],
        destination: "https://www.bodymiso.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
;
