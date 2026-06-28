"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KakaoButton from "@/components/KakaoButton";
import { supabase } from "@/lib/supabase";
import {
  questions,
  resultTypes,
  scoreToType,
  scoreToRisk,
  type TypeKey,
} from "./data";
import {
  UserIcon,
  ActivityIcon,
  ZapIcon,
  RefreshCwIcon,
  LightbulbIcon,
  LockIcon,
  CheckIcon,
  TrendingUpIcon,
  ArrowRightIcon,
} from "@/components/Icons";

type IconComponent = (props: { className?: string; size?: number }) => React.ReactElement;
const typeIconMap: Record<TypeKey, IconComponent> = {
  neck: UserIcon,
  pelvis: ActivityIcon,
  back: ZapIcon,
  whole: RefreshCwIcon,
};

const LS_KEY = "naemiso_check_v1";
const PLACE_URL = "https://map.naver.com/p/entry/place/1101035370";
const SITE = "https://www.bodymiso.com";

type RelPost = { title: string; slug: string; excerpt: string | null; tag: string | null };

interface SavedState {
  type: TypeKey;
  risk: { label: string; note: string };
  firstResultAt: string;
  startedAt?: string; // 루틴 시작일 (ISO date)
  completedDays: number[];
  lastCompletedDate?: string; // YYYY-MM-DD
  retest?: { type: TypeKey; riskLabel: string; at: string };
}

type View = "loading" | "hub" | "quiz" | "result" | "routine" | "retest";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function track(event: string, properties?: Record<string, unknown>) {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, properties: properties ?? {} }),
  }).catch(() => {});
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
      setView("hub");
    }
  }, []);

  // 뒤로가기 시 hub로 복귀
  useEffect(() => {
    const onPop = () => setView("hub");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // ---- 진단 ----
  function startFresh() {
    setStep(0);
    setAnswers([]);
    setIsRetest(false);
    window.history.pushState({ view: "quiz" }, "");
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

  // 허브 선택 화면
  if (view === "hub") {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#FAF5FB] pt-8 pb-12 md:pt-12 md:pb-20 px-4">
          <div className="max-w-xl mx-auto">
            <p className="text-xs font-semibold text-[#9B4DAB] uppercase tracking-widest mb-3">몸 상태 체크</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              어떤 방식으로<br />확인해볼까요?
            </h1>
            <p className="text-sm text-gray-500 mb-8">둘 다 무료 · 1~3분이면 완료됩니다</p>

            <div className="space-y-4">
              {/* 체형 유형 진단 */}
              <button
                onClick={startFresh}
                className="w-full text-left bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-[#7B2D8B] transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF5FB] flex items-center justify-center shrink-0 group-hover:bg-[#7B2D8B] transition-colors">
                    <UserIcon className="text-[#7B2D8B] group-hover:text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#9B4DAB] mb-1">1분 자가진단</p>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">체형 유형 진단</h2>
                    <p className="text-sm text-gray-500">
                      거북목 / 골반 / 허리 / 전신 — 내 몸 유형을 파악하고<br />
                      7일 교정 루틴을 받아보세요
                    </p>
                  </div>
                  <span className="text-gray-300 text-xl shrink-0">›</span>
                </div>
              </button>

              {/* 통증지도 */}
              <Link
                href="/check/pain"
                className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-[#7B2D8B] transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF5FB] flex items-center justify-center shrink-0 group-hover:bg-[#7B2D8B] transition-colors">
                    <ActivityIcon className="text-[#7B2D8B] group-hover:text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#9B4DAB] mb-1">통증지도</p>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">통증 부위 체크</h2>
                    <p className="text-sm text-gray-500">
                      목·어깨·허리·골반·무릎·발목 중<br />
                      아픈 부위를 클릭하면 원인 분석을 해드려요
                    </p>
                  </div>
                  <span className="text-gray-300 text-xl shrink-0">›</span>
                </div>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

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
            {(() => { const TIcon = typeIconMap[saved.type]; return <div className="w-14 h-14 rounded-full bg-[#FAF5FB] flex items-center justify-center mb-3 mx-auto"><TIcon className="text-[#7B2D8B]" size={28} /></div>; })()}
            <span className="inline-block bg-[#FAF5FB] text-[#7B2D8B] text-xs font-semibold px-3 py-1 rounded-full mb-3">
              위험도 {saved.risk.label}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">당신은 {t.name}</h2>
            <p className="text-[#7B2D8B] font-semibold mb-5">{t.oneLiner}</p>
          </div>
          <p className="text-gray-600 leading-relaxed mb-3">{t.why}</p>
          <p className="text-sm text-gray-500 bg-[#FAF5FB] rounded-xl px-4 py-3 mb-8 flex items-start gap-2"><LightbulbIcon className="text-[#9B4DAB] shrink-0 mt-0.5" size={16} />{saved.risk.note}</p>
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
        <ShareCard type={saved.type} riskLabel={saved.risk.label} />
        <RelatedContent type={saved.type} />
        <CrossPromo to="pain" />
        <ClassPromo />
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
            {allDone ? "7일 완주! 정말 잘하셨어요" : `${done.length}일째 함께하고 있어요`}
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
                      {isDone ? <CheckIcon size={14} /> : isLocked ? <LockIcon size={13} /> : d.day}
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
                            <Image src={d.imageUrl} alt={d.title} width={600} height={600} className="rounded-lg my-3 w-full h-auto" />
                          )}
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{d.how}</p>
                          <p className="text-xs text-[#7B2D8B] mt-1 flex items-center gap-1"><ArrowRightIcon size={12} />{d.point}</p>
                        </>
                      )}
                      {isToday && (
                        <button
                          onClick={() => completeDay(d.day)}
                          className="mt-3 bg-[#7B2D8B] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#6a2578] transition-colors"
                        >
                          오늘 동작 완료
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
              오늘 동작 완료! 내일 Day {nextDay}가 열려요
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

          <button onClick={resetAll} className="w-full text-sm text-gray-500 hover:text-gray-800 underline mt-6 py-2">
            처음부터 다시 진단하기
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
          <div className="w-14 h-14 rounded-full bg-[#FAF5FB] flex items-center justify-center mb-3 mx-auto">
            {improved ? <TrendingUpIcon className="text-[#7B2D8B]" size={28} /> : <ActivityIcon className="text-[#7B2D8B]" size={28} />}
          </div>
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
        <ShareCard type={saved.retest.type} riskLabel={saved.retest.riskLabel} retest improved={improved} />
        <RelatedContent type={saved.retest.type} />
        <CrossPromo to="pain" />
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
      <main className="min-h-screen bg-[#FAF5FB] pt-8 pb-12 md:pt-12 md:pb-20 px-4">
        <div className="max-w-xl mx-auto">{children}</div>
      </main>
      <Footer />
    </>
  );
}

function ShareCard({
  type,
  riskLabel,
  retest = false,
  improved = false,
}: {
  type: TypeKey;
  riskLabel: string;
  retest?: boolean;
  improved?: boolean;
}) {
  const t = resultTypes[type];
  const [copied, setCopied] = useState(false);
  const shareUrl = `${SITE}/check?type=${type}`;
  const shareText = retest
    ? `7일 교정 루틴 ${improved ? "효과 봤어요" : "도전 중"}! 내 몸 유형은 ${t.name}`
    : t.shareLine;

  async function handleShare() {
    track("result_share", { type, retest });
    const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }) : null;
    if (nav?.share) {
      try {
        await nav.share({ title: "내몸에미소 자가진단", text: `${shareText}\n`, url: shareUrl });
        return;
      } catch (e) {
        // 사용자가 공유 취소(AbortError)면 폴백 안 함
        if (e instanceof Error && e.name === "AbortError") return;
      }
    }
    // 폴백: 링크 클립보드 복사
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mt-5 rounded-2xl p-6 text-center text-white bg-gradient-to-br from-[#7B2D8B] to-[#9B4DAB]">
      <p className="font-bold text-lg mb-0.5">{t.name}</p>
      <p className="text-purple-200 text-sm mb-4">위험도 {riskLabel} · 내몸에미소 1분 자가진단</p>
      <button
        onClick={handleShare}
        className="w-full bg-white text-[#7B2D8B] font-bold py-3.5 px-6 rounded-full hover:bg-gray-100 transition-colors"
      >
        {copied ? "링크 복사됐어요! 붙여넣기 하세요 ✓" : "결과 공유하기 (카톡·링크)"}
      </button>
      <p className="text-purple-200 text-xs mt-3">친구 자세도 같이 체크해보세요</p>
    </div>
  );
}

function RelatedContent({ type }: { type: TypeKey }) {
  const [posts, setPosts] = useState<RelPost[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await supabase
          .from("posts")
          .select("title, slug, excerpt, tag")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(30);
        if (!alive) return;
        const all = (data ?? []) as RelPost[];
        const kw = resultTypes[type].keywords;
        const matched = all.filter((p) =>
          kw.some((k) => `${p.title} ${p.tag ?? ""}`.includes(k))
        );
        setPosts((matched.length ? matched : all).slice(0, 3));
      } catch {
        if (alive) setPosts([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [type]);

  if (posts === null) return null; // 로딩 중 비표시

  if (posts.length === 0) {
    return (
      <div className="mt-5 bg-white rounded-2xl p-6 border border-gray-100 text-center">
        <p className="font-bold text-gray-900 mb-1">원장 칼럼 더 보기</p>
        <p className="text-sm text-gray-500 mb-4">내 유형과 관련된 글을 읽어보세요</p>
        <Link
          href="/blog"
          className="inline-block bg-[#FAF5FB] text-[#7B2D8B] font-semibold py-2.5 px-6 rounded-full hover:bg-[#f0e4f3] transition-colors"
        >
          칼럼 보러가기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-5 bg-white rounded-2xl p-6 border border-gray-100">
      <p className="font-bold text-gray-900 mb-1">내 유형과 관련된 칼럼</p>
      <p className="text-sm text-gray-500 mb-4">왜 이런 몸이 됐는지 더 알아보세요</p>
      <div className="space-y-2.5">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="block rounded-xl border border-gray-100 px-4 py-3 hover:border-[#7B2D8B] hover:bg-[#FAF5FB] transition-colors"
          >
            <p className="font-semibold text-sm text-gray-900 line-clamp-1">{p.title}</p>
            {p.excerpt && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.excerpt}</p>}
          </Link>
        ))}
      </div>
      <Link
        href="/blog"
        className="block text-center text-sm text-[#7B2D8B] font-semibold mt-4 hover:underline"
      >
        전체 칼럼 보기 →
      </Link>
    </div>
  );
}

function ClassPromo() {
  return (
    <Link
      href="/class/breathing"
      onClick={() => track("class_promo_click", { from: "check_result" })}
      className="mt-5 block rounded-2xl p-6 bg-white border border-gray-100 hover:border-[#7B2D8B] transition-colors"
    >
      <p className="text-xs font-semibold text-[#9B4DAB] uppercase tracking-widest mb-1">바디 리셋 세션</p>
      <p className="font-bold text-gray-900 mb-1">운동보다 먼저 해야 할 것 · 2시간</p>
      <p className="text-sm text-gray-500">
        잠든 근육을 깨우는 2시간 1:1 세션 →
      </p>
    </Link>
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

function CrossPromo({ to }: { to: "pain" | "quiz" }) {
  if (to === "pain") {
    return (
      <Link
        href="/check/pain"
        className="mt-5 block bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#7B2D8B] transition-colors group"
      >
        <p className="text-xs font-semibold text-[#9B4DAB] mb-1">통증지도도 해볼까요?</p>
        <p className="font-bold text-gray-900 mb-1">아픈 부위 클릭 → 원인 분석</p>
        <p className="text-sm text-gray-500">
          목·어깨·허리·골반·무릎·발목 중 불편한 곳을 골라보세요 →
        </p>
      </Link>
    );
  }
  return (
    <Link
      href="/check"
      className="mt-5 block bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#7B2D8B] transition-colors group"
    >
      <p className="text-xs font-semibold text-[#9B4DAB] mb-1">체형 유형 진단도 해볼까요?</p>
      <p className="font-bold text-gray-900 mb-1">1분 자가진단 → 7일 교정 루틴</p>
      <p className="text-sm text-gray-500">
        거북목·골반·허리·전신 — 내 몸 유형을 확인하고 루틴을 받아보세요 →
      </p>
    </Link>
  );
}
