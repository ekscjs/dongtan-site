"use client";

import { useState, useEffect, useCallback } from "react";
import type { Post } from "@/lib/supabase";
import MarkdownEditor from "@/components/MarkdownEditor";
type View = "loading" | "login" | "list" | "form";

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  tag: "",
  published: true,
  publish_at: "",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function hasKorean(text: string) {
  return /[가-힣]/.test(text);
}

async function translateToSlug(text: string): Promise<string> {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await res.json();
    const translated: string = data[0].map((item: [string]) => item[0]).join(" ");
    return slugify(translated);
  } catch {
    return slugify(text);
  }
}

export default function AdminPage() {
  useEffect(() => { document.title = "🔧 관리자 — 내몸에미소"; }, []);
  const [view, setView] = useState<View>("loading");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [slugGenerating, setSlugGenerating] = useState(false);

  const fetchPosts = useCallback(async () => {
    const res = await fetch("/api/admin/posts");
    if (res.ok) {
      setPosts(await res.json());
    } else if (res.status === 401) {
      setView("login");
    }
  }, []);

  useEffect(() => {
    fetch("/api/admin/posts").then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          setPosts(data);
          setView("list");
        });
      } else {
        setView("login");
      }
    }).catch(() => setView("login"));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      await fetchPosts();
      setView("list");
    } else {
      const data = await res.json();
      setLoginError(data.error ?? "로그인 실패");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setView("login");
    setPassword("");
    setPosts([]);
  }

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      // history state의 view 값을 그대로 반영 — 방향(뒤로/앞으로) 상관없이
      // 해당 히스토리 항목이 form이었으면 form으로, 아니면 list로 복원
      setView((e.state?.view === "form" ? "form" : "list"));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setMsg("");
    history.pushState({ view: "form" }, "");
    setView("form");
  }

  function toLocalInput(utcStr: string): string {
    const s = new Date(utcStr).toLocaleString("sv-SE", { timeZone: "Asia/Seoul" });
    return s.slice(0, 16).replace(" ", "T");
  }

  function openEdit(post: Post) {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      tag: post.tag ?? "",
      published: post.published,
      publish_at: post.publish_at ? toLocalInput(post.publish_at) : "",
    });
    setEditId(post.id);
    setMsg("");
    history.pushState({ view: "form" }, "");
    setView("form");
  }

  async function handleSave(e: React.FormEvent, asDraft?: boolean) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const isFuture = form.publish_at && new Date(form.publish_at) > new Date();
    // datetime-local 입력값은 로컬시간(KST) → UTC ISO로 변환해서 저장
    const publishAtISO = form.publish_at ? new Date(form.publish_at).toISOString() : "";
    // 수정 시 기존 publish_at 유지 (첫 발행 기준 날짜 보존)
    const originalPublishAt = editId ? posts.find((p) => p.id === editId)?.publish_at ?? null : null;
    let payload;
    if (asDraft) {
      // 임시저장: 예약글이면 published 건드리지 않음
      payload = isFuture
        ? { ...form, publish_at: publishAtISO }
        : { ...form, published: false, publish_at: publishAtISO };
    } else {
      // 발행: 미래 날짜 있으면 예약, 기존 글 수정이면 publish_at 그대로 유지(null이었으면 null 그대로),
      // 신규 글 최초 발행일 때만 현재시각으로 설정
      payload = isFuture
        ? { ...form, published: true, publish_at: publishAtISO }
        : editId
        ? { ...form, published: true, publish_at: originalPublishAt }
        : { ...form, published: true, publish_at: new Date().toISOString() };
    }
    try {
      const url = editId ? `/api/admin/posts/${editId}` : "/api/admin/posts";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMsg(asDraft ? "임시저장 완료." : "저장되었습니다.");
        await fetchPosts();
        setTimeout(() => setView("list"), 800);
      } else {
        const data = await res.json();
        setMsg(`오류: ${data.error}`);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(post: Post) {
    const res = await fetch(`/api/admin/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...post, published: true, publish_at: new Date().toISOString() }),
    });
    if (res.ok) await fetchPosts();
    else alert("발행 실패");
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`"${title}" 글을 삭제하시겠습니까?`)) return;
    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchPosts();
    } else {
      alert("삭제 실패");
    }
  }

  if (view === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-300 text-sm">불러오는 중...</p>
      </div>
    );
  }

  if (view === "login") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">관리자</h1>
          <p className="text-sm text-gray-400 mb-6">내몸에미소 블로그 관리</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#7B2D8B]"
              required
            />
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-[#7B2D8B] text-white rounded-lg py-3 text-sm font-semibold hover:bg-[#6a2678]"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === "form") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {editId ? "글 수정" : "새 글 작성"}
            </h1>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  const res = await fetch("/api/admin/marketing");
                  if (!res.ok) return;
                  const { files } = await res.json();
                  if (!files.length) return alert("불러올 파일이 없습니다.");
                  const file = files.length === 1 ? files[0] : files[
                    parseInt(prompt(files.map((f: {filename:string}, i: number) => `${i+1}. ${f.filename}`).join("\n") + "\n\n번호 입력:") ?? "1") - 1
                  ];
                  if (!file) return;
                  setForm({
                    title: file.title,
                    slug: file.slug,
                    tag: file.tag,
                    excerpt: file.excerpt,
                    content: file.content,
                    published: true,
                    publish_at: "",
                  });
                  setMsg("마케팅 파일에서 불러왔습니다. 내용을 확인 후 저장하세요.");
                }}
                className="text-sm text-[#7B2D8B] border border-[#7B2D8B] rounded-lg px-4 py-1.5 hover:bg-[#FAF5FB]"
              >
                📂 마케팅 글 불러오기
              </button>
              <button
                onClick={() => setView("list")}
                className="text-sm text-gray-400 hover:text-gray-700"
              >
                ← 목록
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">제목</label>
              <input
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((f) => ({ ...f, title }));
                  setForm((f) => {
                    if (f.slug !== "" && f.slug !== slugify(f.title) && f.slug !== "") return f;
                    return f;
                  });
                  if (hasKorean(title)) {
                    setSlugGenerating(true);
                    translateToSlug(title).then((slug) => {
                      setSlugGenerating(false);
                      setForm((f) => {
                        if (f.slug === "" || hasKorean(f.title)) {
                          return { ...f, slug };
                        }
                        return f;
                      });
                    });
                  } else {
                    setForm((f) => ({ ...f, slug: slugify(title) }));
                  }
                }}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#7B2D8B]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                슬러그{slugGenerating && <span className="ml-2 text-[#7B2D8B] font-normal">번역 중...</span>}
              </label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#7B2D8B]"
                required
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">태그</label>
                <input
                  value={form.tag}
                  onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                  placeholder="허리, 무릎, 체형교정 등"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#7B2D8B]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">예약 발행 일시 (비우면 즉시발행)</label>
                <input
                  type="datetime-local"
                  value={form.publish_at}
                  onChange={(e) => setForm((f) => ({ ...f, publish_at: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#7B2D8B]"
                />
              </div>
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                    className="w-4 h-4 accent-[#7B2D8B]"
                  />
                  공개
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">요약 (목록에 표시)</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#7B2D8B] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">본문 (마크다운)</label>
              <MarkdownEditor
                value={form.content}
                onChange={(v) => setForm((f) => ({ ...f, content: v }))}
                postTitle={form.title}
              />
            </div>

            {msg && (
              <p className={`text-sm ${msg.startsWith("오류") ? "text-red-500" : "text-green-600"}`}>
                {msg}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#7B2D8B] text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-[#6a2678] disabled:opacity-50"
              >
                {saving
                  ? "저장 중..."
                  : form.publish_at && new Date(form.publish_at) > new Date()
                  ? "📅 예약발행"
                  : "발행"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={(e) => handleSave(e as unknown as React.FormEvent, true)}
                className="border border-[#7B2D8B] text-[#7B2D8B] rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-[#FAF5FB] disabled:opacity-50"
              >
                임시저장
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className="border border-gray-200 text-gray-600 rounded-lg px-6 py-2.5 text-sm hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // list view
  const now = new Date();
  const scheduledCount = posts.filter((p) => p.published && p.publish_at && new Date(p.publish_at) > now).length;
  const publishedCount = posts.filter((p) => p.published && !(p.publish_at && new Date(p.publish_at) > now)).length;
  const draftCount = posts.filter((p) => !p.published).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between mb-8 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">블로그 관리</h1>
            <a
              href="https://www.bodymiso.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#7B2D8B] hover:underline mt-1 inline-block"
            >
              사이트 바로가기 →
            </a>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <a
              href="/admin/leads"
              className="border border-[#7B2D8B] text-[#7B2D8B] rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#FAF5FB]"
            >
              신청 관리
            </a>
            <button
              onClick={openNew}
              className="bg-[#7B2D8B] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#6a2678]"
            >
              + 새 글
            </button>
            <button
              onClick={handleLogout}
              className="border border-gray-200 text-gray-500 rounded-lg px-4 py-2 text-sm hover:bg-gray-100"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 대시보드 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-gray-400 mb-1">공개</p>
            <p className="text-3xl font-bold text-gray-900">{publishedCount}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-orange-400 mb-1">예약</p>
            <p className="text-3xl font-bold text-orange-400">{scheduledCount}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-gray-400 mb-1">비공개</p>
            <p className="text-3xl font-bold text-gray-400">{draftCount}</p>
          </div>
          <a
            href="/admin/analytics"
            className="col-span-2 bg-[#FAF5FB] border border-[#7B2D8B]/20 rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <p className="text-xs text-[#7B2D8B] font-semibold mb-1">사이트 분석</p>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-[#7B2D8B]">
              방문자 · 검색 · 유입경로 · 콘텐츠 성과 →
            </p>
            <p className="text-xs text-gray-400 mt-1">국가 · 기기 · GA4 연동</p>
          </a>
          <a
            href="https://analytics.google.com/analytics/web/#/p541281945/reports/intelligenthome"
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 bg-white rounded-2xl shadow p-4 hover:shadow-md transition-shadow cursor-pointer group flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Google Analytics 세부 리포트</p>
              <p className="text-sm font-semibold text-gray-700 group-hover:text-[#7B2D8B]">전환 · 이벤트 · 잠재고객 심층 분석 →</p>
            </div>
            <span className="text-gray-300 text-lg">↗</span>
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          {posts.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              <p>글이 없습니다.</p>
              <button onClick={openNew} className="mt-3 text-[#7B2D8B] font-semibold">
                첫 글 작성하기 →
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">제목</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-20">태그</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-16">상태</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-28">날짜</th>
                  <th className="px-4 py-3 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, i) => (
                  <tr
                    key={post.id}
                    className={`border-b border-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{post.title}</span>
                      <span className="text-gray-400 text-xs ml-2">/{post.slug}</span>
                    </td>
                    <td className="px-4 py-4">
                      {post.tag && (
                        <span className="bg-[#FAF5FB] text-[#7B2D8B] text-xs px-2 py-0.5 rounded-full">
                          {post.tag}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {(() => {
                        const isScheduled = post.published && post.publish_at && new Date(post.publish_at) > new Date();
                        const isPublished = post.published && !isScheduled;
                        return (
                          <div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              isScheduled ? "bg-orange-50 text-orange-500"
                              : isPublished ? "bg-green-50 text-green-600"
                              : "bg-gray-100 text-gray-400"
                            }`}>
                              {isScheduled ? "예약됨" : isPublished ? "공개" : "비공개"}
                            </span>
                            {isScheduled && post.publish_at && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                {new Date(post.publish_at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-400">
                      {new Date(post.publish_at || post.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 justify-end">
                        {!post.published && (
                          <button
                            onClick={() => handlePublish(post)}
                            className="text-xs bg-[#7B2D8B] text-white px-2.5 py-1 rounded-full hover:bg-[#6a2678]"
                          >
                            발행
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(post)}
                          className="text-xs text-[#7B2D8B] hover:underline"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="text-xs text-red-400 hover:underline"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
