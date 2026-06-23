import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

      // ── 도메인 이전 301 ───────────────────────────────────────────────
      // dongtan.naemiso.com → www.bodymiso.com
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
