"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KakaoButton from "@/components/KakaoButton";
import {
  questions,
  resultTypes,
  scoreToType,
  scoreToRisk,
  type TypeKey,
} from "./data";

const LS_KEY = "naemiso_check_v1";
const PLACE_URL = "https://map.naver.com/p/entry/place/1101035370";

interface SavedState {
  type: TypeKey;
  risk: { label: string; note: string };
  firstResultAt: string;
  startedAt?: string; // 루틴 시작일 (ISO date)
  completedDays: number[];
  lastCompletedDate?: string; // YYYY-MM-DD
  retest?: { type: TypeKey; riskLabel: string; at: string };
}

type View = "loading" | "quiz" | "result" | "routine" | "retest";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function track(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    const w = window as unknown as { gtag?: (...a: unknown[]) => void };
    w.gtag?.("event", event, params ?? {});
  }
}

function load(): SavedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as SavedState) : null;
  } catch {
    return null;
  }
}
function save(s: SavedState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export default function CheckQuiz() {
  const [view, setView] = useState<View>("loading");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [saved, setSaved] = useState<SavedState | null>(null);
  const [isRetest, setIsRetest] = useState(false);

  useEffect(() => {
    const s = load();
    if (s?.startedAt) {
      setSaved(s);
      setView("routine");
    } else if (s?.type) {
      setSaved(s);
      setView("result");
    } else {
      setView("quiz");
    }
  }, []);

  // ---- 진단 ----
  function startFresh() {
    setStep(0);
    setAnswers([]);
    setIsRetest(false);
    setView("quiz");
  }
  function startRetest() {
    setStep(0);
    setAnswers([]);
    setIsRetest(true);
    setView("retest");
  }

  function answer(optIdx: number) {
    const next = [...answers, optIdx];
    setAnswers(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
      return;
    }
    // 마지막 문항 → 채점
    const type = scoreToType(next);
    const risk = scoreToRisk(next);
    if (isRetest) {
      const base = load();
      const updated: SavedState = {
        ...(base as SavedState),
        retest: { type, riskLabel: risk.label, at: new Date().toISOString() },
      };
      save(updated);
      setSaved(updated);
      track("self_check_retest", { type, risk: risk.label });
      setView("retest"); // 결과 비교 화면(아래 retest 뷰가 결과 표시)
      setStep(questions.length);
    } else {
      const s: SavedState = {
        type,
        risk: { label: risk.label, note: risk.note },
        firstResultAt: new Date().toISOString(),
        completedDays: [],
      };
      save(s);
      setSaved(s);
      track("self_check_complete", { type, risk: risk.label });
      setView("result");
    }
  }

  function startRoutine() {
    if (!saved) return;
    const s: SavedState = { ...saved, startedAt: todayStr(), completedDays: [] };
    save(s);
    setSaved(s);
    track("routine_start", { type: s.type });
    setView("routine");
  }

  function completeDay(day: number) {
    if (!saved) return;
    const completedDays = [...new Set([...saved.completedDays, day])].sort((a, b) => a - b);
    const s: SavedState = { ...saved, completedDays, lastCompletedDate: todayStr() };
    save(s);
    setSaved(s);
    track("routine_day_complete", { type: s.type, day });
  }

  function resetAll() {
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
    setSaved(null);
    startFresh();
  }

  // ---------- 렌더 ----------
  if (view === "loading") {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#FAF5FB] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#7B2D8B] border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  // 진단/재진단 문항 화면
  if ((view === "quiz" || (view === "retest" && step < questions.length))) {
    const progress = Math.round((step / questions.length) * 100);
    return (
      <Shell>
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>{isRetest ? "재진단 " : ""}{step + 1} / {questions.length}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-[#7B2D8B] h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-[#9B4DAB] uppercase tracking-widest mb-4">
            {isRetest ? "7일 뒤 재진단" : "통증·체형 자가진단"}
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8">{questions[step].q}</h2>
          <div className="space-y-3">
            {questions[step].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => answer(i)}
                className="w-full text-left px-5 py-4 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm md:text-base hover:border-[#7B2D8B] hover:text-[#7B2D8B] hover:bg-[#FAF5FB] transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  // 결과 화면
  if (view === "result" && saved) {
    const t = resultTypes[saved.type];
    return (
      <Shell>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-5xl mb-3">{t.emoji}</p>
            <span className="inline-block bg-[#FAF5FB] text-[#7B2D8B] text-xs font-semibold px-3 py-1 rounded-full mb-3">
              위험도 {saved.risk.label}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">당신은 {t.name}</h2>
            <p className="text-[#7B2D8B] font-semibold mb-5">{t.oneLiner}</p>
          </div>
          <p className="text-gray-600 leading-relaxed mb-3">{t.why}</p>
          <p className="text-sm text-gray-500 bg-[#FAF5FB] rounded-xl px-4 py-3 mb-8">💡 {saved.risk.note}</p>
          <button
            onClick={startRoutine}
            className="w-full bg-[#7B2D8B] text-white font-bold py-4 px-6 rounded-full hover:bg-[#6a2578] transition-colors mb-3"
          >
            내 유형 7일 교정 루틴 시작하기 →
          </button>
          <button onClick={resetAll} className="w-full text-sm text-gray-400 hover:text-gray-600 underline">
            다시 진단하기
          </button>
        </div>
        <CenterCTA />
      </Shell>
    );
  }

  // 루틴 대시보드
  if (view === "routine" && saved?.startedAt) {
    const t = resultTypes[saved.type];
    const done = saved.completedDays;
    const allDone = done.length >= 7;
    const nextDay = done.length + 1;
    const newCalendarDay = saved.lastCompletedDate !== todayStr();
    const canDoToday = !allDone && (done.length === 0 || newCalendarDay);

    return (
      <Shell>
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-[#9B4DAB] uppercase tracking-widest">{t.name}</p>
            <span className="text-xs text-gray-400">{done.length} / 7일</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">7일 교정 루틴</h2>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div className="bg-[#7B2D8B] h-2 rounded-full transition-all duration-500" style={{ width: `${(done.length / 7) * 100}%` }} />
          </div>
          <p className="text-sm text-gray-500 mb-6">
            {allDone ? "7일 완주! 정말 잘하셨어요 🎉" : `${done.length}일째 함께하고 있어요`}
          </p>

          <div className="space-y-3">
            {t.routine.map((d) => {
              const isDone = done.includes(d.day);
              const isToday = !isDone && d.day === nextDay && canDoToday;
              const isLocked = !isDone && !isToday;
              return (
                <div
                  key={d.day}
                  className={`rounded-xl border p-4 transition-colors ${
                    isToday ? "border-[#7B2D8B] bg-[#FAF5FB]" : isDone ? "border-green-100 bg-green-50/50" : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        isDone ? "bg-green-500 text-white" : isToday ? "bg-[#7B2D8B] text-white" : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {isDone ? "✓" : isLocked ? "🔒" : d.day}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-bold text-sm md:text-base ${isLocked ? "text-gray-400" : "text-gray-900"}`}>
                          Day {d.day}. {d.title}
                        </p>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">{Math.round(d.durationSec / 60 * 10) / 10}분</span>
                      </div>
                      {(isToday || isDone) && (
                        <>
                          {d.imageUrl && (
                            <img src={d.imageUrl} alt={d.title} className="rounded-lg my-3 w-full" />
                          )}
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{d.how}</p>
                          <p className="text-xs text-[#7B2D8B] mt-1">👉 {d.point}</p>
                        </>
                      )}
                      {isToday && (
                        <button
                          onClick={() => completeDay(d.day)}
                          className="mt-3 bg-[#7B2D8B] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#6a2578] transition-colors"
                        >
                          오늘 동작 완료 ✓
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!allDone && !canDoToday && (
            <p className="text-center text-sm text-gray-500 mt-6 bg-[#FAF5FB] rounded-xl py-3">
              오늘 동작 완료! 내일 Day {nextDay}가 열려요 🔓
            </p>
          )}

          {allDone && (
            <div className="mt-6 text-center">
              <p className="text-gray-700 mb-4">7일 동안 어떻게 달라졌는지 다시 확인해볼까요?</p>
              <button
                onClick={startRetest}
                className="bg-[#7B2D8B] text-white font-bold py-3 px-8 rounded-full hover:bg-[#6a2578] transition-colors"
              >
                7일 뒤 재진단하기 →
              </button>
            </div>
          )}

          <button onClick={resetAll} className="w-full text-xs text-gray-300 hover:text-gray-500 underline mt-6">
            처음부터 다시
          </button>
        </div>
        <CenterCTA />
      </Shell>
    );
  }

  // 재진단 결과 비교
  if (view === "retest" && saved?.retest) {
    const before = resultTypes[saved.type];
    const after = resultTypes[saved.retest.type];
    const improved = saved.risk.label !== saved.retest.riskLabel || saved.type !== saved.retest.type;
    return (
      <Shell>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-5xl mb-3">{improved ? "🌱" : "💪"}</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7일 전과 비교</h2>
          <div className="flex items-center justify-center gap-3 mb-6 text-sm">
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex-1">
              <p className="text-xs text-gray-400 mb-1">처음</p>
              <p className="font-semibold text-gray-700">{before.name}</p>
              <p className="text-xs text-gray-400">위험도 {saved.risk.label}</p>
            </div>
            <span className="text-gray-300">→</span>
            <div className="bg-[#FAF5FB] rounded-xl px-4 py-3 flex-1">
              <p className="text-xs text-[#9B4DAB] mb-1">지금</p>
              <p className="font-semibold text-[#7B2D8B]">{after.name}</p>
              <p className="text-xs text-gray-400">위험도 {saved.retest.riskLabel}</p>
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed mb-8">
            {improved
              ? "변화가 시작됐어요! 다만 막힌 방향을 정확히 잡으려면 1:1 점검이 가장 빠릅니다."
              : "꾸준히 하셨네요. 혼자 7일로 안 바뀌는 부분은 원인이 더 깊을 수 있어요. 센터에서 정확히 짚어드릴게요."}
          </p>
        </div>
        <CenterCTA highlight />
      </Shell>
    );
  }

  // fallback
  return (
    <Shell>
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
        <button onClick={startFresh} className="bg-[#7B2D8B] text-white font-bold py-3 px-8 rounded-full">
          자가진단 시작하기
        </button>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF5FB] py-20 px-4">
        <div className="max-w-xl mx-auto">{children}</div>
      </main>
      <Footer />
    </>
  );
}

function CenterCTA({ highlight = false }: { highlight?: boolean }) {
  return (
    <div className={`mt-5 rounded-2xl p-6 text-center ${highlight ? "bg-[#7B2D8B]" : "bg-white border border-gray-100"}`}>
      <p className={`font-bold mb-1 ${highlight ? "text-white" : "text-gray-900"}`}>
        막힌 방향, 센터에서 정확히 짚어드려요
      </p>
      <p className={`text-sm mb-5 ${highlight ? "text-purple-200" : "text-gray-500"}`}>
        동탄 내몸에미소 · 1:1 정밀 측정 · 무료 상담
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <KakaoButton
          className={`flex-1 font-bold py-3.5 px-6 rounded-full transition-colors ${
            highlight ? "bg-white text-[#7B2D8B] hover:bg-gray-100" : "bg-[#7B2D8B] text-white hover:bg-[#6a2578]"
          }`}
        >
          카카오로 무료 상담
        </KakaoButton>
        <a
          href={PLACE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 font-semibold py-3.5 px-6 rounded-full border transition-colors ${
            highlight
              ? "border-purple-300 text-white hover:bg-white/10"
              : "border-gray-200 text-gray-500 hover:border-[#7B2D8B] hover:text-[#7B2D8B]"
          }`}
        >
          네이버로 예약·후기
        </a>
      </div>
    </div>
  );
}
