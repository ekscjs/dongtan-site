"use client";

import { useState, useEffect, useCallback } from "react";
import type { Post } from "@/lib/supabase";
import MarkdownEditor from "@/components/MarkdownEditor";
type View = "login" | "list" | "form";

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  tag: "",
  published: true,
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
  const [view, setView] = useState<View>("login");
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
      }
    });
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

  function openNew() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setMsg("");
    setView("form");
  }

  function openEdit(post: Post) {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      tag: post.tag ?? "",
      published: post.published,
    });
    setEditId(post.id);
    setMsg("");
    setView("form");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const url = editId ? `/api/admin/posts/${editId}` : "/api/admin/posts";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMsg("저장되었습니다.");
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

  async function handleDelete(id: number, title: string) {
    if (!confirm(`"${title}" 글을 삭제하시겠습니까?`)) return;
    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchPosts();
    } else {
      alert("삭제 실패");
    }
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
            <button
              onClick={() => setView("list")}
              className="text-sm text-gray-400 hover:text-gray-700"
            >
              ← 목록
            </button>
          </div>

          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">제목</label>
              <input
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((f) => ({ ...f, title }));
                  // 슬러그 자동 생성 (수동 수정 중이면 건드리지 않음)
                  setForm((f) => {
                    if (f.slug !== "" && f.slug !== slugify(f.title) && f.slug !== "") return f;
                    return f; // 아래 useEffect에서 처리
                  });
                  // 한글이면 번역, 영어면 바로 slugify
                  if (hasKorean(title)) {
                    setSlugGenerating(true);
                    translateToSlug(title).then((slug) => {
                      setSlugGenerating(false);
                      setForm((f) => {
                        // 사용자가 슬러그를 직접 수정하지 않은 경우에만 업데이트
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
                슬러그 (URL){slugGenerating && <span className="ml-2 text-[#7B2D8B] font-normal">번역 중...</span>}
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
                {saving ? "저장 중..." : "저장"}
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
  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.filter((p) => !p.published).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">블로그 관리</h1>
            <p className="text-sm text-gray-400 mt-1">내몸에미소 건강 정보</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/admin/leads"
              className="border border-[#7B2D8B] text-[#7B2D8B] rounded-lg px-5 py-2 text-sm font-semibold hover:bg-[#FAF5FB] flex items-center"
            >
              신청 관리
            </a>
            <button
              onClick={openNew}
              className="bg-[#7B2D8B] text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-[#6a2678]"
            >
              + 새 글
            </button>
            <button
              onClick={handleLogout}
              className="border border-gray-200 text-gray-500 rounded-lg px-5 py-2 text-sm hover:bg-gray-100"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 대시보드 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-gray-400 mb-1">공개 글</p>
            <p className="text-3xl font-bold text-gray-900">{publishedCount}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-xs text-gray-400 mb-1">비공개</p>
            <p className="text-3xl font-bold text-gray-400">{draftCount}</p>
          </div>
          <a
            href="https://analytics.google.com/analytics/web/#/p541281945/reports/intelligenthome"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl shadow p-5 hover:shadow-md transition-shadow cursor-pointer group col-span-2"
          >
            <p className="text-xs text-gray-400 mb-1">트래픽 분석</p>
            <p className="text-sm font-semibold text-[#7B2D8B] group-hover:underline">
              Google Analytics 열기 →
            </p>
            <p className="text-xs text-gray-400 mt-1">방문자 · 카카오 클릭 · 유입 경로</p>
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
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
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          post.published
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {post.published ? "공개" : "비공개"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-400">
                      {new Date(post.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 justify-end">
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
