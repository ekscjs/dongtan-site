import type { Metadata } from "next";
import { supabase, type Post } from "@/lib/supabase";
import BlogPageClient from "./BlogPageClient";
import { normalizeCategory, buildBlogUrl, buildBlogTitle, type Category } from "./blogUrl";

const SITE = "https://www.bodymiso.com";
const DESCRIPTION = "실제 케이스와 경험을 바탕으로, 몸에 대한 이야기를 기록합니다";

export const revalidate = 60;

async function getPosts(): Promise<Post[]> {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .order("publish_at", { ascending: false, nullsFirst: false });
  return data ?? [];
}

function parseParams(sp: Record<string, string | string[] | undefined>): { category: Category; page: number } {
  const catRaw = typeof sp.cat === "string" ? sp.cat : null;
  const category = normalizeCategory(catRaw);
  const pageRaw = typeof sp.page === "string" ? Number(sp.page) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  return { category, page };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const { category, page } = parseParams(sp);

  return {
    title: buildBlogTitle(category, page),
    description: DESCRIPTION,
    alternates: { canonical: `${SITE}${buildBlogUrl(category, page)}` },
  };
}

export default async function BlogPage() {
  const posts = await getPosts();
  return <BlogPageClient initialPosts={posts} />;
}
