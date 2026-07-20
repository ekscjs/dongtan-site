"use client";

import type { AngleScore } from "./data";
import { useRevealOnce, useCountUpValue } from "./revealHooks";
import MeterBar from "./MeterBar";

function TopIssueRow({ rank, item }: { rank: number; item: AngleScore }) {
  const { ref, revealed } = useRevealOnce<HTMLDivElement>();
  const display = useCountUpValue(item.score, revealed, 2);
  const pct = Math.min(100, Math.max(0, item.score));

  return (
    <div ref={ref} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
      <div className="w-8 h-8 rounded-full bg-[#FAF5FB] text-[#7B2D8B] font-bold text-sm flex items-center justify-center shrink-0">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{item.label}</p>
          <p className="text-lg md:text-xl font-bold text-[#7B2D8B] shrink-0">{display}점</p>
        </div>
        <MeterBar pct={pct} revealed={revealed} />
        <p className="text-xs text-gray-400 mt-1.5">
          평균 {item.score}점 · N={item.n} ({item.label} {item.angleAvg} 상당)
        </p>
      </div>
    </div>
  );
}

export default function TopIssues({ items }: { items: AngleScore[] }) {
  const top3 = items.slice(0, 3);
  return (
    <div className="space-y-3">
      {top3.map((item, i) => (
        <TopIssueRow key={item.label} rank={i + 1} item={item} />
      ))}
    </div>
  );
}
