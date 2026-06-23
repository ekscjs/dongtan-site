import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 구 사이트 잔재 경로 — 크롤링 차단
        disallow: ["/bbs/", "/shop/", "/counsel/", "/magazine/", "/talk/"],
      },
    ],
    sitemap: "https://www.bodymiso.com/sitemap.xml",
  };
}
