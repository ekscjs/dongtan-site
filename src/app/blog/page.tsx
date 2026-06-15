import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";
import { supabase, type Post } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "임상 노트 | 내몸에미소 동탄",
  description: "내몸에미소 박미소 원장이 현장에서 만난 케이스와 경험을 씁니다.",
};

export const revalidate = 60;

async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
  return data ?? [];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <Header />
      <main className="pt-12 pb-12 md:pt-16 md:pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">임상 노트</h1>
          <p className="text-gray-500 mb-12">실제 케이스와 경험을 바탕으로, 몸에 대한 이야기를 기록합니다</p>

          {posts.length === 0 ? (
            <p className="text-gray-400 text-center py-20">아직 게시된 글이 없습니다.</p>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <article key={post.id} className="border-b border-gray-100 pb-8">
                  <div className="flex items-center gap-3 mb-3">
                    {post.tag && (
                      <span className="bg-[#FAF5FB] text-[#7B2D8B] text-xs font-semibold px-3 py-1 rounded-full">
                        {post.tag}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{formatDate(post.created_at)}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-[#7B2D8B]">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  {post.excerpt && (
                    <p className="text-gray-500 text-sm leading-relaxed">{post.excerpt}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
