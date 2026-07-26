import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabase, type Post } from "@/lib/supabase";
import BlogPageClient from "./BlogPageClient";
import { normalizeCategory, getPostCategory, buildBlogUrl, buildBlogTitle, PER_PAGE, type Category } from "./blogUrl";

const SITE = "https://www.bodymiso.com";
const DESCRIPTION = "실제 케이스와 경험을 바탕으로, 몸에 대한 이야기를 기록합니다";

export const revalidate = 60;

const getPosts = cache(async (): Promise<Post[]> => {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .order("publish_at", { ascending: false, nullsFirst: false });
  return data ?? [];
});

type ResolvedView =
  | { ok: true; category: Category; page: number; posts: Post[] }
  | { ok: false };

async function resolveView(sp: Record<string, string | string[] | undefined>): Promise<ResolvedView> {
  const catRaw = typeof sp.cat === "string" ? sp.cat : null;
  const category = normalizeCategory(catRaw);

  const pageStr = typeof sp.page === "string" ? sp.page : undefined;
  let page = 1;
  if (pageStr !== undefined) {
    const n = Number(pageStr);
    if (!Number.isInteger(n) || n < 1) return { ok: false };
    page = n;
  }

  const posts = await getPosts();
  const count = category === "전체"
    ? posts.length
    : posts.filter((p) => getPostCategory(p.tag ?? null) === category).length;
  const totalPages = Math.max(1, Math.ceil(count / PER_PAGE));
  if (page > totalPages) return { ok: false };

  return { ok: true, category, page, posts };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const view = await resolveView(sp);
  // generateMetadata 단계에서 먼저 notFound()를 던져야 응답 상태코드가
  // 200으로 이미 확정된 뒤에 body에서 notFound()를 호출하는 상황(상태코드가
  // 안 바뀜)을 피할 수 있다.
  if (!view.ok) notFound();

  return {
    title: buildBlogTitle(view.category, view.page),
    description: DESCRIPTION,
    alternates: { canonical: `${SITE}${buildBlogUrl(view.category, view.page)}` },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const view = await resolveView(sp);
  if (!view.ok) notFound();

  return <BlogPageClient initialPosts={view.posts} />;
}
