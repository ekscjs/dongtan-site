"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KakaoButton from "@/components/KakaoButton";
import {
  UserIcon,
  ActivityIcon,
  RefreshCwIcon,
  TargetIcon,
  ArrowRightIcon,
  MessageSquareIcon,
} from "@/components/Icons";

const EXAMPLES = ["앉으면 허리가 아파요", "어깨가 결려요", "무릎이 시큰거려요", "거북목이 심해요"];

function track(event: string, properties?: Record<string, unknown>) {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, properties: properties ?? {} }),
  }).catch(() => {});
}

type AskResult = {
  answer: string;
  related_posts: { title: string; slug: string }[];
  tools: { label: string; href: string }[];
  show_consult: boolean;
  is_emergency: boolean;
  limited?: boolean;
};

function toolIcon(href: string) {
  if (href.startsWith("/check/pain")) return ActivityIcon;
  if (href.startsWith("/check")) return UserIcon;
  if (href.startsWith("/class")) return RefreshCwIcon;
  if (href.startsWith("/programs")) return TargetIcon;
  return ArrowRightIcon;
}

export default function AskConcierge() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AskResult | null>(null);

  async function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "잠시 후 다시 시도해주세요.");
        setLoading(false);
        return;
      }
      const r = data as AskResult;
      setResult(r);
      track("ai_ask_submit", {
        result: r.is_emergency ? "emergency" : r.limited ? "limited" : "normal",
      });
    } catch {
      setError("네트워크 오류입니다. 잠시 후 다시 시도해주세요.");
    }
    setLoading(false);
  }

  function reset() {
    setResult(null);
    setQuery("");
    setError("");
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF5FB] pt-8 pb-12 md:pt-12 md:pb-20 px-4">
        <div className="max-w-xl mx-auto">
          {!result ? (
            <>
              <p className="text-sm font-semibold text-[#9B4DAB] uppercase tracking-widest mb-3">미소AI</p>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                어떤 증상이<br />궁금하세요?
              </h1>
              <p className="text-sm md:text-base lg:text-lg text-gray-500 mb-6">증상을 편하게 적어주시면, 동탄에서 실제 관리한 회원 사례로 쓴 글 중에서 답을 찾아드려요</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(query);
                }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="예: 앉으면 허리가 아파요"
                  className="w-full resize-none border-0 focus:outline-none text-base text-gray-800 placeholder:text-gray-300"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="w-full mt-3 bg-[#7B2D8B] text-white font-bold py-3.5 rounded-full hover:bg-[#6a2578] transition-colors disabled:opacity-50"
                >
                  {loading ? "찾아보는 중…" : "물어보기"}
                </button>
              </form>

              {error && <p className="text-sm md:text-base lg:text-lg text-red-500 mt-3">{error}</p>}

              <div className="flex flex-wrap gap-2 mt-5">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => {
                      setQuery(ex);
                      submit(ex);
                    }}
                    disabled={loading}
                    className="text-xs md:text-sm lg:text-base bg-white border border-gray-200 text-gray-600 px-3.5 py-2 rounded-full hover:border-[#7B2D8B] hover:text-[#7B2D8B] transition-colors disabled:opacity-50"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </>
          ) : result.limited ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <div className="flex justify-center mb-3"><MessageSquareIcon className="text-[#7B2D8B]" size={32} /></div>
              <p className="text-gray-700">{result.answer}</p>
              <button onClick={reset} className="mt-5 text-sm text-gray-400 hover:text-gray-600 underline">
                처음으로
              </button>
            </div>
          ) : result.is_emergency ? (
            <>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-600 font-bold text-lg mb-2">병원(응급실) 먼저</p>
                <p className="text-red-700 text-sm md:text-base lg:text-lg leading-relaxed">{result.answer}</p>
              </div>
              <button onClick={reset} className="w-full mt-5 text-sm text-gray-400 hover:text-gray-600 underline">
                다시 물어보기
              </button>
              <p className="text-xs text-gray-400 text-center mt-8">
                이 안내는 참고용 정보이며 의료적 진단·치료를 대신하지 않습니다.
              </p>
            </>
          ) : (
            <>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">{result.answer}</p>
              </div>

              {result.related_posts.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold text-gray-500 mb-3 px-1">📖 관련 칼럼</p>
                  <div className="space-y-2.5">
                    {result.related_posts.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/blog/${p.slug}`}
                        onClick={() => track("ai_ask_click_post", { slug: p.slug })}
                        className="block bg-white rounded-xl border border-gray-100 px-4 py-3.5 hover:border-[#7B2D8B] hover:bg-[#FAF5FB] transition-colors"
                      >
                        <p className="font-semibold text-sm md:text-base lg:text-lg text-gray-900">{p.title}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {result.tools.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold text-gray-500 mb-3 px-1">다음으로 해보면 좋은 것</p>
                  <div className="space-y-2.5">
                    {result.tools.map((t) => {
                      const ToolIcon = toolIcon(t.href);
                      return (
                        <Link
                          key={t.href}
                          href={t.href}
                          onClick={() => track("ai_ask_click_tool", { href: t.href })}
                          className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3.5 hover:border-[#7B2D8B] hover:bg-[#FAF5FB] transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-[#FAF5FB] flex items-center justify-center shrink-0 group-hover:bg-[#7B2D8B] transition-colors">
                            <ToolIcon className="text-[#7B2D8B] group-hover:text-white" size={18} />
                          </div>
                          <p className="font-semibold text-sm md:text-base lg:text-lg text-gray-900 flex-1">{t.label}</p>
                          <span className="text-gray-300">›</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {result.show_consult && (
                <div className="mt-5 bg-gradient-to-br from-[#7B2D8B] to-[#9B4DAB] rounded-2xl p-6 text-center text-white">
                  <p className="font-bold mb-1">💬 정확한 건 상담에서</p>
                  <p className="text-purple-200 text-sm md:text-base lg:text-lg mb-4">움직임을 직접 확인하고 맞춤 방향을 안내해 드려요</p>
                  <KakaoButton className="block w-full bg-white text-[#7B2D8B] font-bold py-3.5 rounded-full hover:bg-gray-100 transition-colors">
                    카카오로 상담하기
                  </KakaoButton>
                </div>
              )}

              <button onClick={reset} className="w-full mt-6 text-sm text-gray-400 hover:text-gray-600 underline">
                다시 물어보기
              </button>

              <p className="text-xs text-gray-400 text-center mt-8">
                이 안내는 참고용 정보이며 의료적 진단·치료를 대신하지 않습니다.
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
