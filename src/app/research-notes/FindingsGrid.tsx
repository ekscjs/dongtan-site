"use client";

import { useEffect, useRef, useState } from "react";
import type { Finding } from "./data";

const ANIM_MS = 900;

function decimalsOf(value: string) {
  const dot = value.indexOf(".");
  return dot === -1 ? 0 : value.length - dot - 1;
}

function useCountUp(target: number, decimals: number) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setDisplay(target);
      return;
    }

    let raf: number;
    let started = false;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / ANIM_MS);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        setDisplay(target * eased);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          run();
          observer.unobserve(el); // 처음 한 번만 실행 — 이후 스크롤로 다시 들어와도 재실행 안 함
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [target]);

  return { display: display.toFixed(decimals), ref };
}

function FindingCard({ f }: { f: Finding }) {
  const target = parseFloat(f.value);
  const decimals = decimalsOf(f.value);
  const { display, ref } = useCountUp(target, decimals);
  const pct = Math.min(100, Math.max(0, (target / f.max) * 100));
  const [barPct, setBarPct] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setBarPct(pct);
      return;
    }
    const id = requestAnimationFrame(() => setBarPct(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div ref={ref} className="bg-white rounded-2xl p-5 border border-gray-100">
      <p className="text-xs md:text-sm text-gray-500 mb-1">{f.label}</p>
      <p className="text-2xl md:text-3xl font-bold text-[#7B2D8B]">
        {display}
        <span className="text-base md:text-lg font-semibold ml-0.5">{f.unit}</span>
      </p>
      <div className="w-full h-2 rounded-full bg-[#f0e4f3] overflow-hidden mt-3 mb-2">
        <div
          className="h-full rounded-full bg-[#7B2D8B] transition-[width] duration-700 ease-out"
          style={{ width: `${barPct}%` }}
        />
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
