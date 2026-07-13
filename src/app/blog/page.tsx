"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Post } from "@/lib/supabase";

const INITIAL_COUNT = 10;
const LOAD_MORE_COUNT = 6;
const SCROLL_KEY = "blog-scroll-y";

const CATEGORIES = ["전체", "임상노트", "몸 이야기"] as const;
type Category = (typeof CATEGORIES)[number];

function getCategory(tag: string | null): "임상노트" | "몸 이야기" {
  return tag === "임상노트" ? "임상노트" : "몸 이야기";
}

function formatDate(post: Post) {
  const dateStr = post.publish_at && new Date(post.publish_at) <= new Date()
    ? post.publish_at
    : post.created_at;
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function BlogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCount = Number(searchParams.get("count")) || INITIAL_COUNT;

  const [posts, setPosts] = useState<Post[]>([]);
  const [visible, setVisible] = useState(initialCount);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>("전체");

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  // 뒤로가기 시 브라우저 기본 스크롤 복원이 비동기 로딩과 경합해 맨 위로
  // 튀는 문제가 있어, 직접 복원하기로 하고 브라우저 자동 복원은 꺼둔다.
  useEffect(() => {
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => { window.history.scrollRestoration = prev; };
  }, []);

  useEffect(() => {
    if (loading) return;
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved == null) return;
    sessionStorage.removeItem(SCROLL_KEY);
    requestAnimationFrame(() => {
      window.scrollTo(0, Number(saved));
    });
  }, [loading]);

  const saveScrollPosition = () => {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
  };

  const filtered = category === "전체"
    ? posts
    : posts.filter((p) => getCategory(p.tag ?? null) === category);

  return (
    <>
      <Header />
      <main className="pt-12 pb-12 md:pt-16 md:pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">블로그</h1>
          <p className="text-gray-500 mb-8">실제 케이스와 경험을 바탕으로, 몸에 대한 이야기를 기록합니다</p>

          {/* 카테고리 필터 */}
          <div className="flex gap-2 mb-10">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategory(c);
                  setVisible(INITIAL_COUNT);
                  router.replace("/blog", { scroll: false });
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  category === c
                    ? "bg-[#7B2D8B] text-white"
                    : "border border-gray-200 text-gray-500 hover:border-[#7B2D8B] hover:text-[#7B2D8B]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-gray-400 text-center py-20">불러오는 중...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-400 text-center py-20">아직 게시된 글이 없습니다.</p>
          ) : (
            <>
              <div className="space-y-8">
                {filtered.slice(0, visible).map((post) => (
                  <article key={post.id}>
                    <Link href={`/blog/${post.slug}`} onClick={saveScrollPosition} className="block border-b border-gray-100 pb-8 group active:opacity-60 transition-opacity duration-100">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          getCategory(post.tag ?? null) === "임상노트"
                            ? "bg-[#FAF5FB] text-[#7B2D8B]"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {getCategory(post.tag ?? null)}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(post)}</span>
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

              {visible < filtered.length && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => {
                      const next = visible + LOAD_MORE_COUNT;
                      setVisible(next);
                      router.replace(`/blog?count=${next}`, { scroll: false });
                    }}
                    className="border-2 border-[#7B2D8B] text-[#7B2D8B] font-bold px-8 py-3 rounded-full text-sm hover:bg-[#7B2D8B] hover:text-white transition-all"
                  >
                    더보기
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

export default function BlogPage() {
  return (
    <Suspense>
      <BlogPageContent />
    </Suspense>
  );
}
