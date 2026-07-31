"use client";

import Link from "next/link";
import { blogKeywords, painAreas, type AreaKey } from "@/app/check/pain/painData";

function track(event: string, properties?: Record<string, unknown>) {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, properties: properties ?? {} }),
  }).catch(() => {});
}

// 제목+발췌에서 가장 많이 겹치는 부위를 고른다. 못 고르면 null.
// "목"(neck)이 "발목"(ankle)의 일부로만 등장하는 경우처럼, 다른 부위의 키워드에
// 포함된 부분 문자열로만 매치된 건 오탐지로 보고 제외한다.
const ALL_KEYWORDS = (Object.keys(blogKeywords) as AreaKey[]).flatMap((k) => blogKeywords[k]);

function detectArea(text: string): AreaKey | null {
  let best: AreaKey | null = null;
  let bestHits = 0;
  (Object.keys(blogKeywords) as AreaKey[]).forEach((key) => {
    const hits = blogKeywords[key].filter((kw) => {
      if (!text.includes(kw)) return false;
      const isSubstringOfOther = ALL_KEYWORDS.some(
        (other) => other !== kw && other.includes(kw) && text.includes(other)
      );
      return !isSubstringOfOther;
    }).length;
    if (hits > bestHits) {
      bestHits = hits;
      best = key;
    }
  });
  return bestHits > 0 ? best : null;
}

export default function PostUtilBlock({
  slug,
  title,
  excerpt,
}: {
  slug: string;
  title: string;
  excerpt?: string | null;
}) {
  const area = detectArea(`${title} ${excerpt ?? ""}`);
  const areaLabel = area ? painAreas[area].label : null;

  const cards = [
    area
      ? {
          href: `/check/pain?area=${area}`,
          eyebrow: "통증지도",
          title: `${areaLabel} 통증, 원인 확인하기`,
          desc: "체크 몇 개로 어떤 패턴인지 확인해보세요",
          event: "post_util_click_pain",
        }
      : {
          href: "/check/pain",
          eyebrow: "통증지도",
          title: "아픈 부위 골라서 원인 확인하기",
          desc: "목·어깨·허리·골반·무릎·발목",
          event: "post_util_click_pain",
        },
    {
      href: "/check",
      eyebrow: "1분 셀프체크",
      title: "내 체형은 어떤 유형일까",
      desc: "거북목·골반·허리·전신 — 7일 교정 루틴까지",
      event: "post_util_click_check",
    },
    {
      href: "/ask",
      eyebrow: "미소코치",
      title: "증상을 그대로 물어보기",
      desc: "AI가 24시간 답해드려요",
      event: "post_util_click_ask",
    },
    {
      href: "/method",
      eyebrow: "미소 운동법",
      title: "저희가 몸을 보는 순서",
      desc: "왜 아픈 곳부터 만지지 않는지",
      event: "post_util_click_method",
    },
  ];

  return (
    <aside className="mt-14 rounded-2xl bg-[#FAF5FB] p-5 md:p-6">
      <p className="mb-1 text-sm font-bold text-gray-900">
        <span className="inline-block">글을 읽으셨다면,</span>{" "}
        <span className="inline-block">내 몸은 어떤지 확인해보세요</span>
      </p>
      <p className="mb-4 text-xs text-gray-500">모두 무료입니다</p>

      <div className="space-y-2.5">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            onClick={() => track(c.event, { slug, area: area ?? "none" })}
            className="block rounded-xl border border-[#f0e4f3] bg-white px-4 py-3.5 transition-colors hover:border-[#7B2D8B]"
          >
            <p className="mb-0.5 text-xs font-semibold text-[#9B4DAB]">{c.eyebrow}</p>
            <p className="text-sm font-bold text-gray-900 md:text-base">{c.title}</p>
            <p className="mt-0.5 text-xs text-gray-500 md:text-sm">{c.desc}</p>
          </Link>
        ))}
      </div>
    </aside>
  );
}
