"use client";

import { useState } from "react";

function track(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    const w = window as unknown as { gtag?: (...a: unknown[]) => void };
    w.gtag?.("event", event, params ?? {});
  }
}

export default function LeadForm({
  program,
  source,
  timeOptions = ["평일 오전", "평일 오후", "평일 저녁", "주말", "아무때나 가능"],
  timeLabel = "희망 시간대",
  timePlaceholder = "선택 안 함",
}: {
  program: string;
  source?: string;
  timeOptions?: string[];
  timeLabel?: string;
  timePlaceholder?: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferred, setPreferred] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setErr("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, preferred, message, program, source }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "잠시 후 다시 시도해주세요.");
        setStatus("error");
        return;
      }
      track("lead_submit", { program, source });
      setStatus("done");
    } catch {
      setErr("네트워크 오류입니다. 잠시 후 다시 시도해주세요.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
        <p className="text-4xl mb-3">✅</p>
        <p className="font-bold text-lg text-gray-900 mb-1">신청이 접수됐어요!</p>
        <p className="text-sm text-gray-500">곧 카카오톡 또는 남겨주신 연락처로 안내드릴게요.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">이름</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={40}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7B2D8B] focus:outline-none"
          placeholder="성함"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">연락처</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          inputMode="tel"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7B2D8B] focus:outline-none"
          placeholder="010-0000-0000"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{timeLabel}</label>
        <select
          value={preferred}
          onChange={(e) => setPreferred(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7B2D8B] focus:outline-none bg-white"
        >
          <option value="">{timePlaceholder}</option>
          {timeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">남기고 싶은 말 (선택)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7B2D8B] focus:outline-none resize-none"
          placeholder="궁금한 점이나 몸 상태를 적어주세요"
        />
      </div>
      {err && <p className="text-sm text-red-500">{err}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-[#7B2D8B] text-white font-bold py-4 rounded-full hover:bg-[#6a2578] transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "접수 중…" : "신청하기"}
      </button>
      <p className="text-xs text-gray-400 text-center">제출하시면 안내를 위해 연락처가 센터에 전달됩니다.</p>
    </form>
  );
}
