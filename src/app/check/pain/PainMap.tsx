"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KakaoButton from "@/components/KakaoButton";
import { supabase } from "@/lib/supabase";
import {
  painAreas,
  areaOrder,
  exerciseRecs,
  blogKeywords,
  type AreaKey,
} from "./painData";

const PLACE_URL = "https://map.naver.com/p/entry/place/1101035370";

function track(event: string, properties?: Record<string, unknown>) {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, properties: properties ?? {} }),
  }).catch(() => {});
}

type View = "map" | "checklist" | "result";
type RelPost = { title: string; slug: string; excerpt: string | null };

// ── SVG 인체 부위 좌표 정의 ────────────────────────────────────────────────
// viewBox="0 0 200 480"
const FRONT_AREAS: { key: AreaKey; label: string; cx: number; cy: number; rx: number; ry: number }[] = [
  { key: "neck",     label: "목",   cx: 100, cy: 68,  rx: 14, ry: 11 },
  { key: "shoulder", label: "어깨", cx: 100, cy: 108, rx: 46, ry: 14 },
  { key: "back",     label: "허리", cx: 100, cy: 198, rx: 28, ry: 18 },
  { key: "pelvis",   label: "골반", cx: 100, cy: 240, rx: 36, ry: 16 },
  { key: "knee",     label: "무릎", cx: 100, cy: 348, rx: 30, ry: 14 },
  { key: "ankle",    label: "발목", cx: 100, cy: 428, rx: 22, ry: 12 },
];

function BodySVG({
  selected,
  onToggle,
}: {
  selected: Set<AreaKey>;
  onToggle: (k: AreaKey) => void;
}) {
  return (
    <svg
      viewBox="0 0 200 480"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[200px] mx-auto select-none"
      aria-label="인체 통증 부위 선택"
    >
      {/* ── 몸 실루엣 ── */}
      {/* 머리 */}
      <ellipse cx="100" cy="38" rx="22" ry="26" fill="#E9D5F5" />
      {/* 목 */}
      <rect x="91" y="60" width="18" height="16" rx="4" fill="#DDD0EE" />
      {/* 몸통 */}
      <path
        d="M62 82 Q54 90 52 130 L52 220 Q52 240 64 248 L136 248 Q148 240 148 220 L148 130 Q146 90 138 82 Z"
        fill="#E9D5F5"
      />
      {/* 어깨 (양측) */}
      <ellipse cx="50" cy="100" rx="16" ry="12" fill="#DDD0EE" />
      <ellipse cx="150" cy="100" rx="16" ry="12" fill="#DDD0EE" />
      {/* 왼팔 */}
      <path d="M36 108 Q28 150 34 190 Q40 196 48 192 Q54 152 52 112 Z" fill="#E9D5F5" />
      {/* 오른팔 */}
      <path d="M164 108 Q172 150 166 190 Q160 196 152 192 Q146 152 148 112 Z" fill="#E9D5F5" />
      {/* 왼손 */}
      <ellipse cx="41" cy="200" rx="9" ry="12" fill="#DDD0EE" />
      {/* 오른손 */}
      <ellipse cx="159" cy="200" rx="9" ry="12" fill="#DDD0EE" />
      {/* 왼쪽 다리 */}
      <path d="M68 248 Q60 300 62 370 Q64 390 76 392 Q86 392 88 370 Q90 300 88 248 Z" fill="#E9D5F5" />
      {/* 오른쪽 다리 */}
      <path d="M132 248 Q140 300 138 370 Q136 390 124 392 Q114 392 112 370 Q110 300 112 248 Z" fill="#E9D5F5" />
      {/* 왼쪽 종아리 */}
      <path d="M63 390 Q58 420 60 450 Q62 460 72 460 Q80 460 80 450 Q80 420 76 390 Z" fill="#E9D5F5" />
      {/* 오른쪽 종아리 */}
      <path d="M137 390 Q142 420 140 450 Q138 460 128 460 Q120 460 120 450 Q120 420 124 390 Z" fill="#E9D5F5" />
      {/* 왼발 */}
      <ellipse cx="67" cy="462" rx="12" ry="7" fill="#DDD0EE" />
      {/* 오른발 */}
      <ellipse cx="133" cy="462" rx="12" ry="7" fill="#DDD0EE" />

      {/* ── 클릭 영역 ── */}
      {FRONT_AREAS.map(({ key, label, cx, cy, rx, ry }) => {
        const active = selected.has(key);
        return (
          <g key={key} onClick={() => onToggle(key)} className="cursor-pointer">
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={active ? "#7B2D8B" : "transparent"}
              stroke={active ? "#7B2D8B" : "#9B4DAB"}
              strokeWidth={active ? 0 : 2}
              strokeDasharray={active ? "0" : "4 2"}
              opacity={active ? 0.85 : 0.7}
            />
            <text
              x={cx}
              y={cy + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={key === "shoulder" ? "7.5" : "8.5"}
              fontWeight="600"
              fill={active ? "white" : "#6B21A8"}
              pointerEvents="none"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── 체크리스트 화면 ──────────────────────────────────────────────────────────
function ChecklistView({
  areaKeys,
  onDone,
}: {
  areaKeys: AreaKey[];
  onDone: (answers: Record<AreaKey, boolean[]>) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<AreaKey, boolean[]>>(() =>
    Object.fromEntries(areaKeys.map((k) => [k, Array(painAreas[k].questions.length).fill(false)])) as Record<AreaKey, boolean[]>
  );

  const current = areaKeys[idx];
  const area = painAreas[current];
  const checked = answers[current];

  function toggle(i: number) {
    setAnswers((prev) => ({
      ...prev,
      [current]: prev[current].map((v, j) => (j === i ? !v : v)),
    }));
  }

  function next() {
    if (idx < areaKeys.length - 1) setIdx(idx + 1);
    else onDone(answers);
  }

  const progress = Math.round(((idx + 1) / areaKeys.length) * 100);
  const hasAny = checked.some(Boolean);

  return (
    <div className="space-y-5">
      {/* 진행바 */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>{idx + 1} / {areaKeys.length} 부위</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-[#7B2D8B] h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 질문 카드 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-sm font-semibold text-[#9B4DAB] uppercase tracking-widest mb-1">통증 체크리스트</p>
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          {area.label} — 해당되는 항목을 모두 선택하세요
        </h2>
        <div className="space-y-3">
          {area.questions.map((q, i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`w-full text-left px-4 py-4 rounded-xl border text-sm md:text-base lg:text-lg font-medium flex items-center gap-3 transition-colors ${
                checked[i]
                  ? "border-[#7B2D8B] bg-[#FAF5FB] text-[#7B2D8B]"
                  : "border-gray-200 text-gray-700 hover:border-[#9B4DAB] hover:bg-[#FAF5FB]"
              }`}
            >
              <span
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  checked[i] ? "bg-[#7B2D8B] border-[#7B2D8B]" : "border-gray-300"
                }`}
              >
                {checked[i] && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </span>
              {q}
            </button>
          ))}
        </div>

        {/* 없음 선택지 */}
        {!hasAny && (
          <p className="text-xs text-gray-400 text-center mt-4">
            해당 없으면 선택 없이 다음으로 넘어가세요
          </p>
        )}
      </div>

      <button
        onClick={next}
        className="w-full bg-[#7B2D8B] text-white font-bold py-4 rounded-full hover:bg-[#6a2578] transition-colors"
      >
        {idx < areaKeys.length - 1 ? `다음 부위 (${painAreas[areaKeys[idx + 1]].label}) →` : "결과 보기 →"}
      </button>
    </div>
  );
}

// ── 결과 화면 ────────────────────────────────────────────────────────────────
function ResultView({
  selected,
  answers,
  onReset,
}: {
  selected: AreaKey[];
  answers: Record<AreaKey, boolean[]>;
  onReset: () => void;
}) {
  const [posts, setPosts] = useState<RelPost[] | null>(null);

  // 부위별 결과 계산
  const findings = selected.flatMap((key) => {
    const area = painAreas[key];
    return area.results
      .filter((r) => r.matchFn(answers[key]))
      .map((r) => ({ ...r, areaLabel: area.label, key }));
  });

  const highPriority = findings.filter((f) => f.priority === 1);
  const hasSerious = highPriority.length > 0;

  // 관련 블로그 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const keywords = selected.flatMap((k) => blogKeywords[k]);
        const { data } = await supabase
          .from("posts")
          .select("title, slug, excerpt")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(30);
        if (!alive) return;
        const all = (data ?? []) as RelPost[];
        const matched = all.filter((p) =>
          keywords.some((kw) => p.title.includes(kw))
        );
        setPosts((matched.length ? matched : all).slice(0, 3));
      } catch {
        if (alive) setPosts([]);
      }
    })();
    return () => { alive = false; };
  }, [selected]);

  // 추천 운동 (선택 부위 전체)
  const allExercises = [...new Set(selected.flatMap((k) => exerciseRecs[k]))].slice(0, 6);

  return (
    <div className="space-y-5">
      {/* 종합 결과 헤더 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-sm font-semibold text-[#9B4DAB] uppercase tracking-widest mb-1">통증지도 분석 결과</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {selected.map((k) => painAreas[k].label).join("·")} 체크 완료
        </h2>
        {hasSerious ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm md:text-base lg:text-lg text-amber-800 mb-2">
            ⚠️ 정밀 평가가 필요한 패턴이 발견됐습니다. 전문가 점검을 권해드립니다.
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm md:text-base lg:text-lg text-green-800 mb-2">
            ✓ 큰 이상 신호는 없지만, 지금 관리하면 더 좋아질 수 있어요.
          </div>
        )}
      </div>

      {/* 부위별 분석 */}
      {findings.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">부위별 분석</h3>
          <div className="space-y-4">
            {findings.map((f, i) => (
              <div key={i} className="border-l-4 border-[#9B4DAB] pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-[#7B2D8B] bg-[#FAF5FB] px-2 py-0.5 rounded-full">
                    {f.areaLabel}
                  </span>
                  {f.priority === 1 && (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      주의
                    </span>
                  )}
                </div>
                <p className="font-semibold text-gray-900 text-sm md:text-base lg:text-lg mb-1">{f.title}</p>
                <p className="text-xs md:text-sm lg:text-base text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          {findings.length === 0 && (
            <p className="text-sm md:text-base lg:text-lg text-gray-500">선택한 항목 기준으로 큰 이상 패턴이 없습니다.</p>
          )}
        </div>
      )}

      {/* 추천 운동 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-3">추천 운동</h3>
        <div className="space-y-2">
          {allExercises.map((ex, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-5 h-5 rounded-full bg-[#FAF5FB] flex items-center justify-center text-[#7B2D8B] font-bold text-xs shrink-0">
                {i + 1}
              </span>
              {ex}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          * 통증이 심한 상태에서 운동하면 악화될 수 있습니다. 아프면 멈추세요.
        </p>
      </div>

      {/* 관련 칼럼 */}
      {posts && posts.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-1">관련 칼럼</h3>
          <p className="text-sm md:text-base lg:text-lg text-gray-500 mb-4">원인과 해결 방향을 더 알아보세요</p>
          <div className="space-y-2.5">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="block rounded-xl border border-gray-100 px-4 py-3 hover:border-[#7B2D8B] hover:bg-[#FAF5FB] transition-colors"
              >
                <p className="font-semibold text-sm md:text-base lg:text-lg text-gray-900 line-clamp-1">{p.title}</p>
                {p.excerpt && <p className="text-xs md:text-sm lg:text-base text-gray-500 mt-0.5 line-clamp-1">{p.excerpt}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 예약 CTA */}
      <div className="bg-[#7B2D8B] rounded-2xl p-6 text-center">
        <p className="text-white font-bold text-lg mb-1">
          AI 분석 결과, 정확한 평가는<br />움직임 검사까지 해야 합니다.
        </p>
        <p className="text-purple-200 text-sm md:text-base lg:text-lg mb-5">
          센터에서는 이 결과를 바탕으로 실제 움직임을 확인하고 맞춤 운동 방향을 안내해 드립니다.
        </p>
        <div className="bg-white rounded-xl p-4 mb-5 text-left">
          <p className="text-xs font-semibold text-gray-500 mb-2">센터 1회 체험 포함</p>
          <div className="space-y-1.5 text-sm md:text-base lg:text-lg text-gray-700">
            {["움직임 평가", "체형측정", "관절 가동성 확인", "맞춤 운동 설계"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="text-[#7B2D8B]">✓</span> {item}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-baseline gap-2">
            <span className="text-xs text-gray-400 line-through">정상가 60,000원</span>
            <span className="text-[#7B2D8B] font-bold text-lg">30,000원</span>
            <span className="text-xs text-gray-400">50% 할인</span>
          </div>
        </div>
        <KakaoButton className="block w-full text-center bg-white text-[#7B2D8B] font-bold text-base py-4 rounded-full hover:bg-gray-50 transition-colors mb-4">
          카카오로 예약하기
        </KakaoButton>
        <a
          href={PLACE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center border border-purple-300 text-white font-semibold text-base py-4 rounded-full hover:bg-white/10 transition-colors"
        >
          네이버로 예약·후기 보기
        </a>
      </div>

      {/* 체형진단 크로스 프로모 */}
      <Link
        href="/check"
        className="block bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#7B2D8B] transition-colors"
      >
        <p className="text-sm font-semibold text-[#9B4DAB] mb-1">체형 유형 확인도 해볼까요?</p>
        <p className="font-bold text-gray-900 mb-1">1분 셀프체크 → 7일 교정 루틴</p>
        <p className="text-sm md:text-base lg:text-lg text-gray-500">
          거북목·골반·허리·전신 — 내 몸 유형을 확인하고 루틴을 받아보세요 →
        </p>
      </Link>

      {/* 다시하기 */}
      <button
        onClick={onReset}
        className="w-full text-sm text-gray-400 hover:text-gray-600 underline py-2"
      >
        다시 체크하기
      </button>
    </div>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export default function PainMap() {
  const [view, setView] = useState<View>("map");
  const [selected, setSelected] = useState<Set<AreaKey>>(new Set());
  const [answers, setAnswers] = useState<Record<AreaKey, boolean[]> | null>(null);

  function toggleArea(k: AreaKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  }

  function handleDone(ans: Record<AreaKey, boolean[]>) {
    setAnswers(ans);
    track("pain_map_complete", { areas: selectedOrdered.join(","), area_count: selectedOrdered.length });
    setView("result");
  }

  function reset() {
    setSelected(new Set());
    setAnswers(null);
    setView("map");
  }

  const selectedOrdered = areaOrder.filter((k) => selected.has(k));

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF5FB] pt-8 pb-12 md:pt-12 md:pb-20 px-4">
        <div className="max-w-xl mx-auto space-y-5">

          {/* 뒤로가기 */}
          <Link href="/check" className="inline-flex items-center gap-1 text-sm text-[#7B2D8B] hover:underline">
            ← 체크 메뉴로
          </Link>

          {/* 지도 선택 화면 */}
          {view === "map" && (
            <>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <p className="text-sm font-semibold text-[#9B4DAB] uppercase tracking-widest mb-1">통증지도</p>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  아픈 부위를 선택하세요
                </h1>
                <p className="text-sm md:text-base lg:text-lg text-gray-500 mb-6">복수 선택 가능 · 클릭하면 체크리스트가 뜹니다</p>

                <BodySVG selected={selected} onToggle={toggleArea} />

                {/* 버튼 선택 (SVG 보조) */}
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {areaOrder.map((k) => {
                    const active = selected.has(k);
                    return (
                      <button
                        key={k}
                        onClick={() => toggleArea(k)}
                        className={`px-4 py-2 rounded-full text-sm md:text-base lg:text-lg font-semibold border transition-colors ${
                          active
                            ? "bg-[#7B2D8B] text-white border-[#7B2D8B]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#7B2D8B] hover:text-[#7B2D8B]"
                        }`}
                      >
                        {painAreas[k].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selected.size > 0 ? (
                <button
                  onClick={() => {
                    track("pain_map_start", { areas: selectedOrdered.join(","), area_count: selectedOrdered.length });
                    setView("checklist");
                  }}
                  className="w-full bg-[#7B2D8B] text-white font-bold py-4 rounded-full hover:bg-[#6a2578] transition-colors"
                >
                  {selectedOrdered.map((k) => painAreas[k].label).join("·")} 체크리스트 시작 →
                </button>
              ) : (
                <p className="text-center text-sm text-gray-400 py-2">
                  부위를 하나 이상 선택해 주세요
                </p>
              )}
            </>
          )}

          {/* 체크리스트 화면 */}
          {view === "checklist" && (
            <ChecklistView
              areaKeys={selectedOrdered}
              onDone={handleDone}
            />
          )}

          {/* 결과 화면 */}
          {view === "result" && answers && (
            <ResultView
              selected={selectedOrdered}
              answers={answers}
              onReset={reset}
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
