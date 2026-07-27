"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

type AskLog = {
  id: number;
  created_at: string;
  query: string;
  repeat: boolean;
};

const DAY_OPTIONS = [7, 30, 90] as const;

function fmt(d: string) {
  const x = new Date(d);
  return `${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")} ${String(
    x.getHours()
  ).padStart(2, "0")}:${String(x.getMinutes()).padStart(2, "0")}`;
}

export default function AdminAskLogsPage() {
  const [view, setView] = useState<"loading" | "login" | "list">("loading");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [rows, setRows] = useState<AskLog[]>([]);
  const [days, setDays] = useState<(typeof DAY_OPTIONS)[number]>(30);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchLogs = useCallback(async (d: number) => {
    const res = await fetch(`/api/admin/ask-logs?days=${d}`);
    if (res.ok) {
      const data = await res.json();
      setRows(data.rows ?? []);
      setView("list");
    } else if (res.status === 401) {
      setView("login");
    }
  }, []);

  useEffect(() => {
    fetchLogs(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setPassword("");
      fetchLogs(days);
    } else {
      setLoginError("비밀번호가 틀렸습니다.");
    }
  }

  function changeDays(d: (typeof DAY_OPTIONS)[number]) {
    setDays(d);
    fetchLogs(d);
  }

  async function copy(id: number, query: string) {
    try {
      await navigator.clipboard.writeText(query);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500);
    } catch {
      /* ignore */
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return rows;
    return rows.filter((r) => r.query.includes(q));
  }, [rows, search]);

  const repeatRate = rows.length > 0 ? Math.round((rows.filter((r) => r.repeat).length / rows.length) * 100) : 0;

  if (view === "loading") {
    return (
      <main className="min-h-screen bg-[#FAF5FB] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7B2D8B] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (view === "login") {
    return (
      <main className="min-h-screen bg-[#FAF5FB] flex items-center justify-center px-4">
        <form onSubmit={login} className="bg-white rounded-2xl p-8 border border-gray-100 w-full max-w-sm">
          <h1 className="font-bold text-lg text-gray-900 mb-4">관리자 로그인</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7B2D8B] focus:outline-none mb-3"
          />
          {loginError && <p className="text-sm text-red-500 mb-3">{loginError}</p>}
          <button className="w-full bg-[#7B2D8B] text-white font-bold py-3 rounded-full hover:bg-[#6a2578] transition-colors">
            로그인
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF5FB] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-gray-900">미소코치 질문 로그</h1>
          <a href="/admin" className="text-sm text-[#7B2D8B] hover:underline">
            ← 글 관리
          </a>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          최근 {days}일 {rows.length}건 · 재질문 방문자 {repeatRate}%
        </p>

        {/* 기간 필터 */}
        <div className="flex gap-2 mb-4">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => changeDays(d)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                days === d
                  ? "border-[#7B2D8B] bg-[#7B2D8B] text-white"
                  : "border-gray-200 text-gray-500 hover:border-[#7B2D8B]"
              }`}
            >
              {d}일
            </button>
          ))}
        </div>

        {/* 검색 */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="질문 내용 검색"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7B2D8B] focus:outline-none mb-6 bg-white"
        />

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center text-gray-400">
            {rows.length === 0 ? "아직 질문이 없습니다. 미소코치 유입이 늘면 여기에 쌓입니다." : "검색 결과가 없습니다."}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((r) => (
              <div key={r.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">{fmt(r.created_at)}</span>
                    {r.repeat && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        재질문
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{r.query}</p>
                </div>
                <button
                  onClick={() => copy(r.id, r.query)}
                  className="shrink-0 text-xs text-gray-400 hover:text-[#7B2D8B] transition-colors px-2 py-1"
                >
                  {copiedId === r.id ? "복사됨" : "복사"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
