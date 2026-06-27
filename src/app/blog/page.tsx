"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Post } from "@/lib/supabase";

const INITIAL_COUNT = 6;
const LOAD_MORE_COUNT = 6;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [visible, setVisible] = useState(INITIAL_COUNT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />
      <main className="pt-12 pb-12 md:pt-16 md:pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">임상 노트</h1>
          <p className="text-gray-500 mb-12">실제 케이스와 경험을 바탕으로, 몸에 대한 이야기를 기록합니다</p>

          {loading ? (
            <p className="text-gray-400 text-center py-20">불러오는 중...</p>
          ) : posts.length === 0 ? (
            <p className="text-gray-400 text-center py-20">아직 게시된 글이 없습니다.</p>
          ) : (
            <>
              <div className="space-y-8">
                {posts.slice(0, visible).map((post) => (
                  <article key={post.id}>
                    <Link href={`/blog/${post.slug}`} className="block border-b border-gray-100 pb-8 group active:opacity-60 transition-opacity duration-100">
                      <div className="flex items-center gap-3 mb-3">
                        {post.tag && (
                          <span className="bg-[#FAF5FB] text-[#7B2D8B] text-xs font-semibold px-3 py-1 rounded-full">
                            {post.tag}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{formatDate(post.created_at)}</span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#7B2D8B]">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-gray-500 text-sm leading-relaxed">{post.excerpt}</p>
                      )}
                    </Link>
                  </article>
                ))}
              </div>

              {visible < posts.length && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => setVisible((v) => v + LOAD_MORE_COUNT)}
                    className="border-2 border-[#7B2D8B] text-[#7B2D8B] font-bold px-8 py-3 rounded-full text-sm hover:bg-[#7B2D8B] hover:text-white transition-all"
                  >
                    더보기 ({posts.length - visible}개 남음)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
