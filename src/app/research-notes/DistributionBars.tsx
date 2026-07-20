"use client";

import type { AngleScore } from "./data";
import { useRevealOnce } from "./revealHooks";

const STATUS = [
  { key: "good", label: "양호 (80점 이상)", short: "양호", color: "bg-green-500" },
  { key: "fair", label: "보통 (50~79점)", short: "보통", color: "bg-amber-400" },
  { key: "caution", label: "주의 (50점 미만)", short: "주의", color: "bg-red-400" },
] as const;

function DistributionRow({ item, revealed }: { item: AngleScore; revealed: boolean }) {
  const total = item.distribution.good + item.distribution.fair + item.distribution.caution;
  const segments = STATUS.map((s) => ({
    ...s,
    count: item.distribution[s.key],
    pct: total > 0 ? (item.distribution[s.key] / total) * 100 : 0,
  })).filter((s) => s.count > 0);

  return (
    <div className="flex items-center gap-3">
      <p className="w-[6.5rem] md:w-32 shrink-0 text-xs md:text-sm text-gray-700 font-medium">{item.label}</p>
      <div className="flex-1 h-2.5 rounded-full overflow-hidden flex gap-x-[2px] bg-white">
        {segments.map((s) => (
          <div
            key={s.key}
            className={`h-full ${s.color} origin-left transition-transform duration-700 ease-out`}
            style={{ width: `${s.pct}%`, transform: revealed ? "scaleX(1)" : "scaleX(0)" }}
          />
        ))}
      </div>
      <p className="w-32 md:w-36 shrink-0 text-xs text-gray-400 text-right">
        {STATUS.map((s) => `${s.short}${item.distribution[s.key]}`).join(" · ")}
      </p>
    </div>
  );
}

export default function DistributionBars({ items }: { items: AngleScore[] }) {
  const { ref, revealed } = useRevealOnce<HTMLDivElement>();

  return (
    <div ref={ref} className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-5 text-xs text-gray-500">
        {STATUS.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
            {s.label}
          </span>
        ))}
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <DistributionRow key={item.label} item={item} revealed={revealed} />
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-4">완전측정 회원 6명 기준 인원수(명)입니다. 80점/50점 구간은 점수를 읽기 쉽게 나눈 것으로, 의학적 정상범위를 뜻하지 않습니다.</p>
    </div>
  );
}
