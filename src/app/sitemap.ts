import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

const BLOG_PER_PAGE = 10;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.bodymiso.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/programs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/reviews`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/check`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/class/breathing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  let postPages: MetadataRoute.Sitemap = [];
  let listPages: MetadataRoute.Sitemap = [];
  try {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from("posts")
      .select("slug, created_at")
      .eq("published", true)
      .or(`publish_at.is.null,publish_at.lte.${now}`)
      .order("created_at", { ascending: false });

    postPages = (data ?? []).map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    // /blog는 staticPages에 이미 포함(1페이지). 2페이지부터 목록 페이지를 추가.
    const totalPages = Math.max(1, Math.ceil((data?.length ?? 0) / BLOG_PER_PAGE));
    listPages = Array.from({ length: totalPages - 1 }, (_, i) => ({
      url: `${base}/blog?page=${i + 2}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  } catch {
    postPages = [];
  }

  return [...staticPages, ...postPages, ...listPages];
}
