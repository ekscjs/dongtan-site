import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabase, type Post } from "@/lib/supabase";
import { markdownToHtml } from "@/lib/markdown";

export const revalidate = 60;

const SITE = "https://dongtan.naemiso.com";

function extractFirstImage(md: string): string | null {
  const m = md.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return m ? m[1] : null;
}

function parseFaq(md: string): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = [];
  const re = /\*\*Q\.\s*([^*]+?)\*\*\s*\n+([^\n]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    out.push({ q: m[1].trim(), a: m[2].trim() });
  }
  return out;
}

async function getPost(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) return null;
  return data;
}

async function getAdjacentPosts(createdAt: string): Promise<{
  prev: Pick<Post, "title" | "slug"> | null;
  next: Pick<Post, "title" | "slug"> | null;
}> {
  const [{ data: prevData }, { data: nextData }] = await Promise.all([
    supabase
      .from("posts")
      .select("title, slug")
      .eq("published", true)
      .lt("created_at", createdAt)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("posts")
      .select("title, slug")
      .eq("published", true)
      .gt("created_at", createdAt)
      .order("created_at", { ascending: true })
      .limit(1),
  ]);
  return {
    prev: prevData?.[0] ?? null,
    next: nextData?.[0] ?? null,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const ogImg = extractFirstImage(post.content ?? "");
  return {
    title: `${post.title} | 내몸에미소 동탄`,
    description: post.excerpt,
    alternates: { canonical: `${SITE}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `${SITE}/blog/${post.slug}`,
      images: ogImg ? [ogImg] : undefined,
    },
  };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const html = markdownToHtml(post.content ?? "");
  const { prev, next } = await getAdjacentPosts(post.created_at);

  const firstImg = extractFirstImage(post.content ?? "");
  const faq = parseFaq(post.content ?? "");
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.created_at,
    dateModified: post.created_at,
    ...(firstImg ? { image: [firstImg] } : {}),
    mainEntityOfPage: `${SITE}/blog/${post.slug}`,
    author: { "@type": "Organization", name: "내몸에미소" },
    publisher: {
      "@type": "Organization",
      name: "내몸에미소",
      logo: { "@type": "ImageObject", url: `${SITE}/logo.png` },
    },
  };
  const faqLd =
    faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <Header />
      <main className="pt-8 pb-12 md:pt-12 md:pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="text-sm text-gray-400 hover:text-[#7B2D8B] mb-8 inline-block"
          >
            ← 목록으로
          </Link>

          <div className="flex items-center gap-3 mb-4">
            {post.tag && (
              <span className="bg-[#FAF5FB] text-[#7B2D8B] text-xs font-semibold px-3 py-1 rounded-full">
                {post.tag}
              </span>
            )}
            <span className="text-xs text-gray-400">{formatDate(post.created_at)}</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-snug">{post.title}</h1>

          {post.excerpt && (
            <p className="text-gray-500 text-lg mb-10 leading-relaxed border-l-4 border-[#7B2D8B] pl-4">
              {post.excerpt}
            </p>
          )}

          <article
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* 이전/다음 글 네비게이션 */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex justify-between items-stretch gap-4">
              {prev ? (
                <Link
                  href={`/blog/${prev.slug}`}
                  className="flex-1 group flex flex-col gap-1 p-4 rounded-xl border border-gray-100 hover:border-[#7B2D8B] hover:bg-[#FAF5FB] transition-colors"
                >
                  <span className="text-xs text-gray-400 group-hover:text-[#7B2D8B]">← 이전 글</span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#7B2D8B] line-clamp-2">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <div className="flex-1" />
              )}

              {next ? (
                <Link
                  href={`/blog/${next.slug}`}
                  className="flex-1 group flex flex-col gap-1 p-4 rounded-xl border border-gray-100 hover:border-[#7B2D8B] hover:bg-[#FAF5FB] transition-colors text-right"
                >
                  <span className="text-xs text-gray-400 group-hover:text-[#7B2D8B]">다음 글 →</span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#7B2D8B] line-clamp-2">
                    {next.title}
                  </span>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </div>

            <div className="text-center mt-6">
              <Link
                href="/blog"
                className="text-xs text-gray-400 hover:text-[#7B2D8B]"
              >
                목록으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
