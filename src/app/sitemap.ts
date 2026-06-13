import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://dongtan.naemiso.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/programs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/reviews`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/check`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  let postPages: MetadataRoute.Sitemap = [];
  try {
    const { data } = await supabase
      .from("posts")
      .select("slug, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });

    postPages = (data ?? []).map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    postPages = [];
  }

  return [...staticPages, ...postPages];
}
