import type { Metadata } from "next";
import BlogPageClient from "./BlogPageClient";
import { normalizeCategory, buildBlogUrl } from "./blogUrl";

const SITE = "https://www.bodymiso.com";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const catRaw = typeof sp.cat === "string" ? sp.cat : null;
  const category = normalizeCategory(catRaw);
  const pageRaw = typeof sp.page === "string" ? Number(sp.page) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  return {
    alternates: { canonical: `${SITE}${buildBlogUrl(category, page)}` },
  };
}

export default function BlogPage() {
  return <BlogPageClient />;
}
