"use client";

import { useEffect, useRef, useState } from "react";

const ANIM_MS = 900;

function reduceMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * 카드/행이 뷰포트에 처음 들어왔을 때 딱 한 번만 true가 되는 훅.
 * 트리거 즉시 observer.unobserve(el)로 관찰을 끊어서, 스크롤로 다시 들어와도
 * 애니메이션이 재실행되거나 겹쳐 돌지 않는다.
 */
export function useRevealOnce<T extends HTMLElement = HTMLDivElement>(threshold = 0.3) {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduceMotion()) {
      setRevealed(true);
      return;
    }

    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          setRevealed(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}

/** revealed가 true로 바뀌는 시점부터 0 → target까지 ease-out으로 세는 훅 */
export function useCountUpValue(target: number, revealed: boolean, decimals = 0) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!revealed) return;

    if (reduceMotion()) {
      setDisplay(target);
      return;
    }

    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ANIM_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [revealed, target]);

  return display.toFixed(decimals);
}
