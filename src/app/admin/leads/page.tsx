"use client";

import { useState, useEffect, useCallback } from "react";

type Lead = {
  id: number;
  created_at: string;
  program: string;
  name: string;
  phone: string;
  preferred: string | null;
  message: string | null;
  source: string | null;
  status: "new" | "contacted" | "done";
};

const STATUS_LABEL: Record<Lead["status"], string> = {
  new: "신규",
  contacted: "연락함",
  done: "완료",
};
const STATUS_STYLE: Record<Lead["status"], string> = {
  new: "bg-[#FAF5FB] text-[#7B2D8B]",
  contacted: "bg-amber-50 text-amber-700",
  done: "bg-gray-100 text-gray-500",
};

function fmt(d: string) {
  const x = new Date(d);
  return `${x.getMonth() + 1}/${x.getDate()} ${String(x.getHours()).padStart(2, "0")}:${String(
    x.getMinutes()
  ).padStart(2, "0")}`;
}

export default function AdminLeadsPage() {
  const [view, setView] = useState<"loading" | "login" | "list">("loading");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);

  const fetchLeads = useCallback(async () => {
    const res = await fetch("/api/admin/leads");
    if (res.ok) {
      setLeads(await res.json());
      setView("list");
    } else if (res.status === 401) {
      setView("login");
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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
      fetchLeads();
    } else {
      setLoginError("비밀번호가 틀렸습니다.");
    }
  }

  async function setStatus(id: number, status: Lead["status"]) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

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

  const counts = {
    new: leads.filter((l) => l.status === "new").length,
    total: leads.length,
  };

  return (
    <main className="min-h-screen bg-[#FAF5FB] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-gray-900">신청 관리</h1>
          <a href="/admin" className="text-sm text-[#7B2D8B] hover:underline">
            ← 글 관리
          </a>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          전체 {counts.total}건 · 신규 {counts.new}건
        </p>

        {leads.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center text-gray-400">
            아직 신청이 없어요.
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((l) => (
              <div key={l.id} className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-bold text-gray-900">
                      {l.name}{" "}
                      <a href={`tel:${l.phone}`} className="text-sm font-normal text-[#7B2D8B] hover:underline">
                        {l.phone}
                      </a>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {fmt(l.created_at)} · {l.program}
                      {l.source ? ` · ${l.source}` : ""}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLE[l.status]}`}>
                    {STATUS_LABEL[l.status]}
                  </span>
                </div>
                {l.preferred && <p className="text-sm text-gray-600">신청 일정: {l.preferred}</p>}
                {l.message && (
                  <p className="text-sm text-gray-600 mt-1 bg-[#FAF5FB] rounded-lg px-3 py-2">{l.message}</p>
                )}
                <div className="flex gap-2 mt-3">
                  {(["new", "contacted", "done"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(l.id, s)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                        l.status === s
                          ? "border-[#7B2D8B] bg-[#7B2D8B] text-white"
                          : "border-gray-200 text-gray-500 hover:border-[#7B2D8B]"
                      }`}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
