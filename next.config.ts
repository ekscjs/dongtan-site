import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // dongtan.naemiso.com → www.bodymiso.com (301 영구 이전)
      {
        source: "/:path*",
        has: [{ type: "host", value: "dongtan.naemiso.com" }],
        destination: "https://www.bodymiso.com/:path*",
        permanent: true,
      },
      // *.vercel.app → www.bodymiso.com (301 영구 이전)
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
