"use client";

import { createContext, useContext, useCallback, useEffect, useRef, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const Ctx = createContext<{ start: () => void }>({ start: () => {} });

export function useRouteProgress() {
  return useContext(Ctx);
}

export function RouteProgressProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
  }, []);

  const start = useCallback(() => {
    clear();
    setActive(true);
    // 안전장치: 어떤 이유로든 전환이 안 끝나도 바가 영구히 남지 않게 한다.
    timer.current = setTimeout(() => setActive(false), 10000);
  }, [clear]);

  return (
    <Ctx.Provider value={{ start }}>
      <Suspense fallback={null}>
        <ProgressStopper onStop={() => { clear(); setActive(false); }} />
      </Suspense>
      {active && (
        <div
          aria-hidden
          className="fixed top-0 left-0 right-0 h-[3px] z-[100] bg-[#7B2D8B]/15 overflow-hidden"
        >
          <div className="h-full w-2/5 bg-[#7B2D8B] rounded-full animate-[routebar_1.1s_ease-in-out_infinite]" />
        </div>
      )}
      {children}
    </Ctx.Provider>
  );
}

/** URL이 실제로 바뀌면(=전환 완료) 바를 끈다. useSearchParams는 Suspense 경계가 필요해 분리. */
function ProgressStopper({ onStop }: { onStop: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => { onStop(); }, [pathname, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
