import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabase, type Post } from "@/lib/supabase";
import { markdownToHtml } from "@/lib/markdown";

export const revalidate = 60;

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | 내몸에미소 동탄`,
    description: post.excerpt,
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

  return (
    <>
      <Header />
      <main className="py-20 px-4">
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

          <div className="mt-16 pt-8 border-t border-gray-100">
            <Link
              href="/blog"
              className="text-sm text-gray-400 hover:text-[#7B2D8B]"
            >
              ← 건강 정보 목록
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
