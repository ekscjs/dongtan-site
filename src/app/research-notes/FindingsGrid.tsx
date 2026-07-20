"use client";

import type { Finding } from "./data";
import { useRevealOnce, useCountUpValue } from "./revealHooks";
import MeterBar from "./MeterBar";

function decimalsOf(value: string) {
  const dot = value.indexOf(".");
  return dot === -1 ? 0 : value.length - dot - 1;
}

function FindingCard({ f }: { f: Finding }) {
  const target = parseFloat(f.value);
  const decimals = decimalsOf(f.value);
  const { ref, revealed } = useRevealOnce<HTMLDivElement>();
  const display = useCountUpValue(target, revealed, decimals);
  const pct = Math.min(100, Math.max(0, (target / f.max) * 100));

  return (
    <div ref={ref} className="bg-white rounded-2xl p-5 border border-gray-100">
      <p className="text-xs md:text-sm text-gray-500 mb-1">{f.label}</p>
      <p className="text-2xl md:text-3xl font-bold text-[#7B2D8B]">
        {display}
        <span className="text-base md:text-lg font-semibold ml-0.5">{f.unit}</span>
      </p>
      <div className="mt-3 mb-2">
        <MeterBar pct={pct} revealed={revealed} />
      </div>
      <p className="text-xs text-gray-400">
        N={f.n}
        {f.range ? ` · 범위 ${f.range}` : ""}
      </p>
      {f.note && <p className="text-xs text-gray-400 mt-0.5">{f.note}</p>}
    </div>
  );
}

export default function FindingsGrid({ findings }: { findings: Finding[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      {findings.map((f) => (
        <FindingCard key={f.label} f={f} />
      ))}
    </div>
  );
}
